// BACKED app: static, no build. Reads HyperEVM testnet directly; writes through the user's wallet.
import { createPublicClient, createWalletClient, custom, http, defineChain } from 'https://esm.sh/viem@2.21.0';
const chain = defineChain({ id: 998, name: 'HyperEVM Testnet', nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] } }, blockExplorers: { default: { name: 'purrsec', url: 'https://testnet.purrsec.com' } } });
const pub = createPublicClient({ chain, transport: http() });
const $ = (s) => document.querySelector(s);
const DATA = await (await fetch('data.json')).json(); const ABI = DATA.abi, EV = DATA.evidence, CFG = DATA.config;
const TX = (h) => h ? `<a href="${chain.blockExplorers.default.url}/tx/${h}" target="_blank" rel="noopener">${h.slice(0, 10)}…</a>` : '';
const usd = (x) => (Number(x) / 1e6).toFixed(2);
const MK = { 4: 'ETH', 3: 'BTC', 5: 'SOL' }, SZD = { 4: 4, 3: 5, 5: 2 };
let vault = CFG.liveVault, wallet = null, me = null;

const rd = (fn, args = []) => pub.readContract({ address: vault, abi: ABI.vault, functionName: fn, args });
async function loadVaults() {
  const all = await pub.readContract({ address: CFG.factory, abi: ABI.factory, functionName: 'all' });
  $('#vaultSel').innerHTML = all.slice().reverse().map((a) => `<option ${a.toLowerCase() === vault.toLowerCase() ? 'selected' : ''}>${a}</option>`).join('');
}
async function readVault() {
  const [backer, trader, maxLev, cap, floor, breached, settled, reason, eq, n] = await Promise.all(['backer', 'trader', 'maxLev', 'capital', 'floorPnl', 'breached', 'settled', 'breachReason', 'equityPnl', 'marketCount'].map((f) => rd(f)));
  const markets = []; for (let i = 0; i < Number(n); i++) markets.push(Number(await rd('markets', [i])));
  const pos = await Promise.all(markets.map(async (m) => ({ m, szi: Number((await rd('position', [m])).szi), px: Number(await rd('oraclePx', [m])) })));
  return { backer, trader, maxLev: Number(maxLev), cap: Number(cap), floor: Number(floor), breached, settled, reason: Number(reason), eq: Number(eq), markets, pos };
}
function stateBadge(s) {
  if (s.settled) return '<span class="badge warn">SETTLED</span>';
  if (s.breached && s.pos.some((p) => p.szi)) return '<span class="badge warn">CLOSING</span>';
  if (s.breached) return '<span class="badge flat">FLATTENED</span>';
  if (s.reason) return '<span class="badge warn">BREACH: ANYONE CAN FLATTEN</span>';
  return '<span class="badge ok">ACTIVE</span>';
}
function gauge(eq, floor, cap) {
  const lo = Math.min(floor, eq) - 1_000_000, hi = Math.max(cap * 0.1, eq + 500_000, 1_000_000);
  const pct = (x) => Math.max(0, Math.min(100, ((x - lo) / (hi - lo)) * 100));
  return `<div class="gauge"><div class="fill ${eq < floor ? 'bad' : ''}" style="width:${pct(eq)}%"></div><div class="floor" style="left:${pct(floor)}%"><span>loss line ${usd(floor)}</span></div></div>`;
}
async function render() {
  try {
    const s = await readVault();
    const posTxt = s.pos.map((p) => `${MK[p.m] || p.m} ${(p.szi / 10 ** SZD[p.m]).toFixed(SZD[p.m])} @ ${(p.px / 10 ** (6 - SZD[p.m])).toFixed(2)}`).join('<br>');
    const html = `<div class="row" style="justify-content:space-between"><b>${vault.slice(0, 8)}…${vault.slice(-4)}</b>${stateBadge(s)}</div>
      ${gauge(s.eq, s.floor, s.cap)}
      <div class="kv"><span>equity − capital</span><span>${usd(s.eq)} USDC</span><span>capital</span><span>${usd(s.cap)} USDC</span><span>positions (oracle)</span><span>${posTxt}</span><span>backer</span><span>${s.backer.slice(0, 10)}…</span><span>trader</span><span>${s.trader.slice(0, 10)}…</span></div>`;
    $('#heroCard').innerHTML = html + '<p class="muted small"><span class="tag real">REAL</span> live from HyperEVM testnet, refreshes every 4 s.</p>';
    $('#vaultState').innerHTML = html;
    const [dl, bo, sh] = await Promise.all([rd('dailyLossUsd6'), rd('bountyUsd6'), rd('traderShareBps')]);
    $('#rules').innerHTML = `<li>Markets: <b>${s.markets.map((m) => MK[m] || m).join(', ')}</b> only</li><li>Leverage: total notional of all positions at the oracle price ≤ <b>${s.maxLev}× capital</b> (${usd(s.cap * s.maxLev)} USDC)</li>
      <li>Loss line: equity − capital ≥ <b>${usd(s.floor)}</b> USDC (realized losses and fees count)</li><li>Daily loss: <b>${usd(dl)}</b> USDC (0 = off)</li>
      <li>Flatten: anyone, retryable until flat; bounty <b>${usd(bo)}</b> USDC</li><li>Settle: trader keeps <b>${Number(sh) / 100}%</b> of profit</li>`;
  } catch (e) { $('#vaultState').innerHTML = `<p class="out err">${e.shortMessage || e.message}</p>`; }
}
$('#loadVault').onclick = () => { vault = $('#vaultAddr').value.trim() || $('#vaultSel').value; render(); };
$('#vaultSel').onchange = () => { vault = $('#vaultSel').value; render(); };

function replay(kind) {
  const ms = kind === 'real' ? EV.latency.replay_real_ms : EV.latency.replay_sim_ms;
  const fill = $('#rFill'), badge = $('#rBadge'), clock = $('#rClock'), logEl = $('#rLog');
  $('#rFloor').style.left = '40%'; fill.style.width = '70%'; fill.classList.remove('bad'); badge.className = 'badge ok'; badge.textContent = 'ACTIVE';
  logEl.innerHTML = `<li>${kind === 'real' ? '<span class="tag real">REAL</span> ' + EV.latency.replay_real_label : '<span class="tag sim">SIM</span> V3 + public keeper on simulated HyperCore'}</li>`;
  const steps = [[0, 'equity crosses the loss line'], [Math.round(ms * 0.35), 'keeper sees the breach → flatten()'], [Math.round(ms * 0.8), 'contract sends reduce-only IOC via CoreWriter'], [ms, 'HyperCore fill: position 0']]; let si = 0, t0;
  setTimeout(() => { fill.style.width = '36%'; fill.classList.add('bad'); badge.className = 'badge warn'; badge.textContent = 'BREACH'; t0 = performance.now(); tick(); }, 700);
  function tick() { const t = performance.now() - t0; clock.textContent = `${Math.min(Math.round(t), ms)} ms`;
    while (si < steps.length && t >= steps[si][0]) { logEl.innerHTML += `<li><b>${steps[si][0]} ms</b> ${steps[si][1]}</li>`; si++; }
    if (t < ms) requestAnimationFrame(tick); else { badge.className = 'badge flat'; badge.textContent = 'FLATTENED'; } }
}
document.querySelectorAll('[data-replay]').forEach((b) => (b.onclick = () => replay(b.dataset.replay)));

$('#evidence').innerHTML = EV.groups.map((g) => `<div class="card ev"><h3><span class="tag ${g.kind === 'REAL' ? 'real' : 'sim'}">${g.kind}</span>${g.title}</h3><ul>${g.items.map((i) => `<li><span>${i.label}</span><span>${TX(i.tx)}</span></li>`).join('')}</ul></div>`).join('');
if (EV.latency.median_live_s) $('#statLat').textContent = EV.latency.median_live_s + ' s';

async function connect() {
  if (!window.ethereum) throw new Error('No wallet found (install MetaMask or Rabby)');
  try { await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x3e6' }] }); }
  catch { await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x3e6', chainName: 'HyperEVM Testnet', nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 }, rpcUrls: ['https://rpc.hyperliquid-testnet.xyz/evm'], blockExplorerUrls: ['https://testnet.purrsec.com'] }] }); }
  wallet = createWalletClient({ chain, transport: custom(window.ethereum) }); [me] = await wallet.requestAddresses();
  $('#connect').textContent = me.slice(0, 6) + '…' + me.slice(-4); const t = $('#createForm [name=trader]'); if (!t.value) t.value = me;
}
$('#connect').onclick = () => connect().catch((e) => alert(e.message));
async function write(address, abi, functionName, args, out, gas = 1_500_000n) {
  const o = $(out); o.className = 'out'; o.textContent = 'checking…';
  try { if (!wallet) await connect();
    await pub.simulateContract({ account: me, address, abi, functionName, args });
    const hash = await wallet.writeContract({ account: me, address, abi, functionName, args, gas });
    o.innerHTML = `sent ${TX(hash)}`; const r = await pub.waitForTransactionReceipt({ hash }); o.className = 'out ' + (r.status === 'success' ? 'ok' : 'err'); o.innerHTML = `${r.status} · ${TX(hash)}`; render(); return r;
  } catch (e) { o.className = 'out err'; o.textContent = 'REJECTED: ' + (e.shortMessage || e.message).split('\n').pop(); }
}
$('#createForm').onsubmit = (ev) => { ev.preventDefault(); const f = new FormData(ev.target); const both = f.get('markets') === 'ethbtc';
  write(CFG.factory, ABI.factory, 'create', [f.get('trader'), both ? [4, 3] : [4], both ? [4, 5] : [4], BigInt(f.get('lev')), BigInt(-Math.round(f.get('floor') * 1e6)), BigInt(Math.round(f.get('daily') * 1e6)), Math.round(f.get('share') * 100), BigInt(Math.round(f.get('bounty') * 1e6))], '#createOut', 5_000_000n)
    .then(async (r) => { if (r?.status === 'success') { await loadVaults(); vault = $('#vaultSel').value; render(); $('#createOut').innerHTML += `<br>new vault ${vault}. Next: send USDC to it on HyperCore spot, then fundPerp.`; } }); };
$('#fundBtn').onclick = () => write(vault, ABI.vault, 'fundPerp', [BigInt(Math.round($('#fundAmt').value * 1e6))], '#ctlOut');
$('#floorBtn').onclick = () => write(vault, ABI.vault, 'setFloor', [BigInt(-Math.round($('#floorAmt').value * 1e6))], '#ctlOut');
$('#stopBtn').onclick = () => write(vault, ABI.vault, 'stop', [], '#ctlOut');
$('#flattenBtn').onclick = () => write(vault, ABI.vault, 'flatten', [], '#ctlOut');
$('#settleBtn').onclick = () => write(vault, ABI.vault, 'settle', [], '#ctlOut');
async function ticketArgs() {
  const f = new FormData($('#ticket')); const a = Number(f.get('asset')); const d = SZD[a] ?? 2;
  let px = Number(f.get('px')); if (!px) { try { px = Number(await rd('oraclePx', [a])) / 10 ** (6 - d) * (f.get('side') === 'buy' ? 1.02 : 0.98); } catch { px = 150; } px = Math.round(px); }
  return [a, f.get('side') === 'buy', BigInt(Math.round(px * 1e8)), BigInt(Math.round(Number(f.get('sz')) * 1e8)), f.get('ro') === 'on'];
}
$('#checkBtn').onclick = async () => { const o = $('#ticketOut'); o.className = 'out'; o.textContent = 'asking the contract…';
  try { const s = await readVault(); await pub.simulateContract({ account: s.trader, address: vault, abi: ABI.vault, functionName: 'trade', args: await ticketArgs() });
    o.className = 'out ok'; o.textContent = "ACCEPTED by the contract (simulated as this vault's trader); it would go to HyperCore.";
  } catch (e) { o.className = 'out err'; o.textContent = 'REJECTED ON CHAIN: ' + (e.shortMessage || e.message).split('\n').pop(); } };
$('#ticket').onsubmit = async (ev) => { ev.preventDefault(); write(vault, ABI.vault, 'trade', await ticketArgs(), '#ticketOut'); };
$('#sigBtn').onclick = async () => { const o = $('#ticketOut');
  try { if (!wallet) await connect(); const [asset, isBuy, limitPx8, sz8, reduceOnly] = await ticketArgs();
    const order = { asset, isBuy, limitPx8, sz8, reduceOnly, nonce: BigInt(Date.now()), deadline: BigInt(Math.floor(Date.now() / 1000) + 300) };
    const sig = await wallet.signTypedData({ account: me, domain: { name: 'BACKED', version: '3', chainId: 998, verifyingContract: vault }, primaryType: 'Order',
      types: { Order: [{ name: 'asset', type: 'uint32' }, { name: 'isBuy', type: 'bool' }, { name: 'limitPx8', type: 'uint64' }, { name: 'sz8', type: 'uint64' }, { name: 'reduceOnly', type: 'bool' }, { name: 'nonce', type: 'uint256' }, { name: 'deadline', type: 'uint256' }] }, message: order });
    const r = sig.slice(0, 66), s = '0x' + sig.slice(66, 130), v = parseInt(sig.slice(130, 132), 16);
    o.className = 'out ok'; o.innerHTML = 'Signed, no gas. Any relayer can submit it; the contract re-checks every rule. <button class="btn ghost" id="relayBtn">Relay from this wallet</button>';
    $('#relayBtn').onclick = () => write(vault, ABI.vault, 'tradeBySig', [order, v, r, s], '#ticketOut');
  } catch (e) { o.className = 'out err'; o.textContent = e.shortMessage || e.message; } };
document.querySelectorAll('[data-preset]').forEach((a) => (a.onclick = async (ev) => { ev.preventDefault(); const f = $('#ticket'); const s = await readVault(); const eth = (s.pos.find((p) => p.m === 4)?.px || 250000) / 100; const capUsd = s.cap / 1e6 || 20;
  const P = { '20x': [4, 'buy', (20 * capUsd / eth).toFixed(4), ''], fake: [4, 'buy', (5 * capUsd / eth).toFixed(4), '1'], sol: [5, 'buy', '0.1', '150'], ok: [4, 'buy', (2.5 * capUsd / eth).toFixed(4), ''] }[a.dataset.preset];
  f.asset.value = P[0]; f.side.value = P[1]; f.sz.value = P[2]; f.px.value = P[3]; $('#checkBtn').click(); }));
await loadVaults().catch(() => {}); render(); setInterval(render, 4000);
