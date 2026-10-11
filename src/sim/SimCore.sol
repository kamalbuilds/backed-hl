// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
// FORK-SIMULATED HyperCore. Etched at the CoreWriter/precompile addresses on a local anvil fork ONLY.
// IOC orders fill instantly at the oracle (if the limit crosses it), perp positions and account value are tracked.
// This is NOT Hyperliquid: it exists to exercise BACKED's funded paths when no test USDC is available.
address constant SIM_ORACLE = 0x0000000000000000000000000000000000000807;
address constant SIM_POS = 0x0000000000000000000000000000000000000813;
address constant SIM_MARGIN = 0x000000000000000000000000000000000000080F;

contract SimOracle {
    mapping(uint32 => uint64) public px;
    function set(uint32 a, uint64 p) external { px[a] = p; }
    fallback(bytes calldata i) external returns (bytes memory) { return abi.encode(px[abi.decode(i, (uint32))]); }
}
contract SimPos {
    struct P { int64 szi; uint64 entryNtl; }
    mapping(address => mapping(uint32 => P)) public p;
    function set(address u, uint32 a, int64 s, uint64 e) external { p[u][a] = P(s, e); }
    fallback(bytes calldata i) external returns (bytes memory) { (address u, uint32 a) = abi.decode(i, (address, uint32)); P memory x = p[u][a]; return abi.encode(x.szi, x.entryNtl, int64(0), uint32(0), false); }
}
contract SimMargin {
    mapping(address => int256) public cash;          // realized perp USD 1e6
    mapping(address => uint32[]) public assetsOf;
    mapping(address => mapping(uint32 => bool)) public has;
    function addCash(address u, int256 d) external { cash[u] += d; }
    function track(address u, uint32 a) external { if (!has[u][a]) { has[u][a] = true; assetsOf[u].push(a); } }
    function value(address u) public view returns (int64) {
        int256 v = cash[u];
        for (uint256 k; k < assetsOf[u].length; k++) {
            uint32 a = assetsOf[u][k];
            (int64 s, uint64 e) = SimPos(SIM_POS).p(u, a);
            if (s == 0) continue;
            int256 ntl = int256(uint256(uint64(s < 0 ? -s : s))) * int256(uint256(SimOracle(SIM_ORACLE).px(a)));
            v += s > 0 ? ntl - int256(uint256(e)) : int256(uint256(e)) - ntl;
        }
        return int64(v);
    }
    fallback(bytes calldata i) external returns (bytes memory) { (, address u) = abi.decode(i, (uint32, address)); return abi.encode(value(u), uint64(0), uint64(0), int64(0)); }
}
contract SimCoreWriter {
    event SimAction(address indexed user, uint24 id, bytes body, bool filled);
    mapping(address => uint256) public missNext;      // test hook: drop the next N orders from this user (simulates a missed IOC band)
    mapping(uint32 => uint8) public szDec;
    function setMissNext(address u, uint256 n) external { missNext[u] = n; }
    function setSzDec(uint32 a, uint8 d) external { szDec[a] = d; }
    function sendRawAction(bytes calldata d) external {
        uint24 id = uint24(bytes3(d[1:4])); bytes calldata body = d[4:]; bool filled;
        if (id == 7) { (uint64 ntl, bool toPerp) = abi.decode(body, (uint64, bool)); SimMargin(SIM_MARGIN).addCash(msg.sender, toPerp ? int256(uint256(ntl)) : -int256(uint256(ntl))); filled = true; }
        else if (id == 1) filled = _order(body);
        emit SimAction(msg.sender, id, body, filled);
    }
    function _order(bytes calldata body) internal returns (bool) {
        (uint32 a, bool isBuy, uint64 px8, uint64 sz8, bool ro,,) = abi.decode(body, (uint32, bool, uint64, uint64, bool, uint8, uint128));
        if (missNext[msg.sender] > 0) { missNext[msg.sender]--; return false; }
        uint8 dec = szDec[a]; uint64 o = SimOracle(SIM_ORACLE).px(a);                // raw 10^(6-dec)
        uint64 lim = px8 / uint64(10 ** (2 + dec));
        if (isBuy ? lim < o : lim > o) return false;                                   // IOC doesn't cross: no fill
        (int64 s, uint64 e) = SimPos(SIM_POS).p(msg.sender, a);
        int64 q = int64(uint64(sz8 / uint64(10 ** (8 - dec)))); if (!isBuy) q = -q;
        if (ro) { if (s == 0 || (s > 0) == (q > 0)) return false; if ((q < 0 ? -q : q) > (s < 0 ? -s : s)) q = -s; }
        int64 n = s + q;
        if (s != 0 && (s > 0) != (q > 0)) {                                           // reducing: realize pnl on the closed part
            uint64 closed = uint64(q < 0 ? -q : q); if (closed > uint64(s < 0 ? -s : s)) closed = uint64(s < 0 ? -s : s);
            uint64 eClosed = uint64(uint256(e) * closed / uint64(s < 0 ? -s : s));
            int256 exitNtl = int256(uint256(closed) * o);
            SimMargin(SIM_MARGIN).addCash(msg.sender, s > 0 ? exitNtl - int256(uint256(eClosed)) : int256(uint256(eClosed)) - exitNtl);
            e -= eClosed;
            if ((n > 0) != (s > 0) && n != 0) e = uint64(uint64(n < 0 ? -n : n) * o); // flipped
        } else e += uint64(uint64(q < 0 ? -q : q) * o);
        if (n == 0) e = 0;
        SimPos(SIM_POS).set(msg.sender, a, n, e); SimMargin(SIM_MARGIN).track(msg.sender, a);
        return true;
    }
}
