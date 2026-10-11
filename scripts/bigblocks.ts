// Opt an EOA into (or out of) HyperEVM big blocks with the signed L1 action evmUserModify, on testnet.
// Reuses the partition L1-action signer (msgpack + phantom agent, cross-checked against three encoders).
// Usage: node --experimental-strip-types bigblocks.ts true|false
import fs from 'node:fs';
import { signL1Action, TESTNET_EXCHANGE_URL } from '/Users/kamal/Desktop/solana/cwf/projects/partition/exchange/src/sign.ts';
import { signerFromPrivateKeyBytes } from '/Users/kamal/Desktop/solana/cwf/projects/partition/exchange/src/signer.ts';

const key = JSON.parse(fs.readFileSync(process.env.BACKED_KEYFILE || '/Users/kamal/Desktop/solana/cwf/hyperliquid/.keys/demo-operator.json', 'utf8'))[0].private_key as string;
const signer = signerFromPrivateKeyBytes(Uint8Array.from(Buffer.from(key.replace(/^0x/, ''), 'hex')));
const on = process.argv[2] !== 'false';
const action = { type: 'evmUserModify', usingBigBlocks: on };
const nonce = Date.now();
const signed = await signL1Action(action, { nonce, isMainnet: false }, signer);
const res = await fetch(TESTNET_EXCHANGE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action, nonce, signature: signed.signature, vaultAddress: null }),
});
console.log(JSON.stringify({ signer: signer.address, action, status: res.status, body: await res.text() }));
