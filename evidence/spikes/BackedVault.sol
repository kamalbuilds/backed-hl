// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// BACKED spike: a backer-funded HyperCore perp account owned by this contract.
// trade(): trader-only, rejects orders whose notional exceeds maxLev x capital or a non-allowed market.
// flatten(): ANYONE may call once pnl < backer floor; sends reduce-only IOC for the full position.
interface ICoreWriter { function sendRawAction(bytes calldata data) external; }

contract BackedVault {
    struct Position { int64 szi; uint64 entryNtl; int64 isolatedRawUsd; uint32 leverage; bool isIsolated; }

    address public immutable backer;
    address public immutable trader;
    uint32 public immutable perp;      // allowed market (ETH = 4 on testnet)
    uint256 public immutable maxLev;   // e.g. 3
    uint64 public capital;             // USDC 1e6 moved to perp margin
    int64 public floorPnl;             // USDC 1e6, backer-set; flatten when pnl < floor (negative = loss cap, positive = locked gain)
    bool public breached;

    event Rejected(string why);
    event Flatten(address caller, int64 szi, int256 pnlUsd6, uint64 limitPx8);

    constructor(address _trader, uint32 _perp, uint256 _maxLev, int64 _floor) {
        backer = msg.sender; trader = _trader; perp = _perp; maxLev = _maxLev; floorPnl = _floor;
    }

    function _cw(bytes memory d) internal { ICoreWriter(0x3333333333333333333333333333333333333333).sendRawAction(d); }

    // backer: move USDC from contract spot to perp margin (CoreWriter action 7)
    function fundPerp(uint64 usd6) external {
        require(msg.sender == backer, "backer");
        capital += usd6;
        _cw(abi.encodePacked(uint8(1), uint24(7), abi.encode(usd6, true)));
    }

    function reset() external { require(msg.sender == backer, "backer"); breached = false; }

    function setFloor(int64 usd6) external { require(msg.sender == backer, "backer"); floorPnl = usd6; }

    function oraclePx() public view returns (uint64 px) { // raw: 10^(6-szDecimals)
        (bool ok, bytes memory out) = address(0x0000000000000000000000000000000000000807).staticcall(abi.encode(perp));
        require(ok, "oracle"); px = abi.decode(out, (uint64));
    }

    function position() public view returns (Position memory p) {
        (bool ok, bytes memory out) = address(0x0000000000000000000000000000000000000813).staticcall(abi.encode(address(this), perp));
        require(ok, "position2"); p = abi.decode(out, (Position));
    }

    // ETH szDecimals 4 -> szi 1e4, px raw 1e2, so |szi|*pxRaw is USD 1e6 (same units as entryNtl)
    function pnl() public view returns (int256) {
        Position memory p = position();
        if (p.szi == 0) return 0;
        uint256 a = uint256(uint64(p.szi < 0 ? -p.szi : p.szi));
        uint256 ntl = a * oraclePx();
        return p.szi > 0 ? int256(ntl) - int256(uint256(p.entryNtl)) : int256(uint256(p.entryNtl)) - int256(ntl);
    }

    // sz8/limitPx8 are 1e8-scaled human values (CoreWriter action 1 encoding)
    function trade(bool isBuy, uint64 limitPx8, uint64 sz8, uint32 asset) external {
        require(msg.sender == trader, "trader");
        require(!breached, "breached: account frozen");
        require(asset == perp, "market not allowed");
        // notional USD 1e6 = sz8 * px8 / 1e10
        uint256 ntl = uint256(sz8) * uint256(limitPx8) / 1e10;
        require(ntl <= maxLev * capital, "leverage above backer limit");
        _cw(abi.encodePacked(uint8(1), uint24(1), abi.encode(asset, isBuy, limitPx8, sz8, false, uint8(3), uint128(0))));
    }

    function flatten() external {
        Position memory p = position();
        require(p.szi != 0, "flat");
        int256 cur = pnl();
        require(cur < floorPnl, "no breach");
        bool isBuy = p.szi < 0;
        uint64 sz8 = uint64(p.szi < 0 ? -p.szi : p.szi) * 1e4;            // 1e4 -> 1e8
        uint64 px = oraclePx() / 100;                                        // whole dollars
        uint64 lim = (isBuy ? px * 105 / 100 : px * 95 / 100) * 1e8;
        breached = true;
        emit Flatten(msg.sender, p.szi, cur, lim);
        _cw(abi.encodePacked(uint8(1), uint24(1), abi.encode(perp, isBuy, lim, sz8, true, uint8(3), uint128(0))));
    }
}
