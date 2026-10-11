// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// BACKED V3: a backer-funded HyperCore perp account owned by this contract. No operator key exists:
// every order is sent by this contract through CoreWriter after the backer's rules are checked.
//  - allowed markets list; leverage = aggregate notional of all positions AFTER the order at ORACLE prices
//  - equity floor (0x80F accountValue - capital) and daily-loss rule (vs first equity seen each UTC day)
//  - flatten(): permissionless, retryable until flat; first caller that triggers a breach earns a bounty
//  - tradeBySig(): trader signs EIP-712, any relayer submits (gasless for the trader, still keyless)
//  - settle(): once flat and ended, pays trader its share of profit and the backer the rest
interface ICoreWriter { function sendRawAction(bytes calldata data) external; }

contract BackedVaultV3 {
    struct Position { int64 szi; uint64 entryNtl; int64 isolatedRawUsd; uint32 leverage; bool isIsolated; }
    struct Order { uint32 asset; bool isBuy; uint64 limitPx8; uint64 sz8; bool reduceOnly; uint256 nonce; uint256 deadline; }

    enum Reason { None, Floor, DailyLoss }

    address constant CW = 0x3333333333333333333333333333333333333333;
    address constant ORACLE = 0x0000000000000000000000000000000000000807;
    address constant POS = 0x0000000000000000000000000000000000000813;
    address constant MARGIN = 0x000000000000000000000000000000000000080F;
    uint256 public constant MAX_MARKETS = 8;
    bytes32 public constant ORDER_TYPEHASH = keccak256("Order(uint32 asset,bool isBuy,uint64 limitPx8,uint64 sz8,bool reduceOnly,uint256 nonce,uint256 deadline)");

    address public immutable backer;
    address public immutable trader;
    uint256 public immutable maxLev;          // x, e.g. 3
    uint16 public immutable traderShareBps;   // of profit at settle
    uint64 public immutable bountyUsd6;       // paid once to the caller whose flatten() triggers the breach
    bytes32 public immutable DOMAIN_SEPARATOR;

    uint32[] public markets;
    mapping(uint32 => bool) public allowed;
    mapping(uint32 => uint8) public szDecimals;

    uint64 public capital;          // USDC 1e6 moved to perp
    int64 public floorPnl;          // equity - capital may not go below this (negative = loss cap)
    uint64 public dailyLossUsd6;    // 0 = off
    uint32 public snapDay;
    int64 public dayStartEquity;
    bool public breached;           // frozen: no new trades, flatten allowed until flat
    bool public settled;
    bool public bountyPaid;
    mapping(uint256 => bool) public nonceUsed;

    event Traded(address indexed by, uint32 asset, bool isBuy, uint64 limitPx8, uint64 sz8, bool reduceOnly);
    event Flatten(address indexed caller, uint8 reason, int256 equityPnl, uint256 positionsClosed);
    event Settled(int256 profit, uint64 toTrader, uint64 toBacker);
    event DaySnapshot(uint32 day, int64 equity);

    constructor(address backer_, address trader_, uint32[] memory markets_, uint8[] memory szDec_, uint256 maxLev_,
                int64 floor_, uint64 dailyLoss_, uint16 shareBps_, uint64 bounty_) {
        require(markets_.length > 0 && markets_.length <= MAX_MARKETS && markets_.length == szDec_.length, "markets");
        require(shareBps_ <= 10_000 && maxLev_ > 0 && floor_ <= 0, "params");
        backer = backer_; trader = trader_; maxLev = maxLev_; floorPnl = floor_; dailyLossUsd6 = dailyLoss_;
        traderShareBps = shareBps_; bountyUsd6 = bounty_;
        for (uint256 i; i < markets_.length; i++) {
            require(!allowed[markets_[i]] && szDec_[i] <= 6, "dup/szDec");
            markets.push(markets_[i]); allowed[markets_[i]] = true; szDecimals[markets_[i]] = szDec_[i];
        }
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256("BACKED"), keccak256("3"), block.chainid, address(this)));
    }

    modifier onlyBacker() { require(msg.sender == backer, "backer"); _; }

    // ---------- reads (HyperCore precompiles) ----------
    function oraclePx(uint32 asset) public view returns (uint64 px) { // raw, 10^(6-szDecimals)
        (bool ok, bytes memory out) = ORACLE.staticcall(abi.encode(asset)); require(ok, "oracle"); px = abi.decode(out, (uint64));
    }
    function position(uint32 asset) public view returns (Position memory p) {
        (bool ok, bytes memory out) = POS.staticcall(abi.encode(address(this), asset)); require(ok, "position"); p = abi.decode(out, (Position));
    }
    function accountValue() public view returns (int64 v) {
        (bool ok, bytes memory out) = MARGIN.staticcall(abi.encode(uint32(0), address(this))); require(ok, "margin");
        (v, , , ) = abi.decode(out, (int64, uint64, uint64, int64));
    }
    function equityPnl() public view returns (int256) { return int256(accountValue()) - int256(uint256(capital)); }
    function marketCount() external view returns (uint256) { return markets.length; }
    function today() public view returns (uint32) { return uint32(block.timestamp / 1 days); }

    // aggregate notional (USD 1e6) at oracle prices, optionally with a hypothetical order applied
    function notionalAfter(uint32 asset, bool isBuy, uint64 sz8) public view returns (uint256 total) {
        for (uint256 i; i < markets.length; i++) {
            uint32 m = markets[i];
            int256 s = int256(position(m).szi);                                   // 10^szDec units
            if (m == asset && sz8 > 0) {
                int256 d = int256(uint256(sz8 / uint64(10 ** (8 - szDecimals[m]))));
                s = isBuy ? s + d : s - d;
            }
            if (s != 0) total += uint256(s < 0 ? -s : s) * oraclePx(m);           // 10^szDec * 10^(6-szDec) = 1e6
        }
    }
    function isFlat() public view returns (bool) {
        for (uint256 i; i < markets.length; i++) if (position(markets[i]).szi != 0) return false;
        return true;
    }
    function breachReason() public view returns (Reason) {
        int256 eq = int256(accountValue());
        if (eq - int256(uint256(capital)) < floorPnl) return Reason.Floor;
        if (dailyLossUsd6 > 0 && snapDay == today() && int256(dayStartEquity) - eq > int256(uint256(dailyLossUsd6))) return Reason.DailyLoss;
        return Reason.None;
    }

    // ---------- backer ----------
    function fundPerp(uint64 usd6) external onlyBacker { // USDC must already sit on this contract's HyperCore spot
        capital += usd6;
        _cw(7, abi.encode(usd6, true));
    }
    function setFloor(int64 usd6) external onlyBacker { require(usd6 <= 0 || !settled, "floor"); floorPnl = usd6; } // positive allowed: lock-in gains / testing
    function setDailyLoss(uint64 usd6) external onlyBacker { dailyLossUsd6 = usd6; }
    function stop() external onlyBacker { breached = true; }           // backer ends the backing; anyone may then flatten
    function rearm() external onlyBacker {                              // reuse after a flatten, only when flat and unsettled
        require(breached && !settled && isFlat(), "rearm");
        require(breachReason() == Reason.None, "still in breach");
        breached = false; bountyPaid = false;
    }
    function sweep(uint64 wei8) external onlyBacker { require(settled, "not settled"); _cw(6, abi.encode(backer, uint64(0), wei8)); }

    // ---------- trading ----------
    function trade(uint32 asset, bool isBuy, uint64 limitPx8, uint64 sz8, bool reduceOnly) external {
        require(msg.sender == trader, "trader");
        _trade(Order(asset, isBuy, limitPx8, sz8, reduceOnly, 0, 0), trader);
    }
    function hashOrder(Order calldata o) public view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR,
            keccak256(abi.encode(ORDER_TYPEHASH, o.asset, o.isBuy, o.limitPx8, o.sz8, o.reduceOnly, o.nonce, o.deadline))));
    }
    function tradeBySig(Order calldata o, uint8 v, bytes32 r, bytes32 s) external {
        require(block.timestamp <= o.deadline, "expired");
        require(!nonceUsed[o.nonce], "nonce");
        require(uint256(s) <= 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0, "sig s");
        address signer = ecrecover(hashOrder(o), v, r, s);
        require(signer != address(0) && signer == trader, "bad sig");
        nonceUsed[o.nonce] = true;
        _trade(o, msg.sender);
    }
    function _trade(Order memory o, address by) internal {
        require(!breached && !settled, "frozen");
        require(allowed[o.asset], "market not allowed");
        require(o.sz8 > 0 && o.limitPx8 > 0, "size/px");
        _snapshotIfNewDay();
        if (o.reduceOnly) {
            int64 s = position(o.asset).szi;
            require(s != 0 && (s > 0) != o.isBuy, "not reducing");
        } else {
            require(breachReason() == Reason.None, "in breach");
            require(notionalAfter(o.asset, o.isBuy, o.sz8) <= maxLev * capital, "leverage above backer limit");
        }
        _cw(1, abi.encode(o.asset, o.isBuy, o.limitPx8, o.sz8, o.reduceOnly, uint8(3), uint128(0)));
        emit Traded(by, o.asset, o.isBuy, o.limitPx8, o.sz8, o.reduceOnly);
    }
    function checkpoint() external { _snapshotIfNewDay(); }
    function _snapshotIfNewDay() internal {
        uint32 d = today();
        if (snapDay != d) { snapDay = d; dayStartEquity = accountValue(); emit DaySnapshot(d, dayStartEquity); }
    }

    // ---------- stop ----------
    function flatten() external {
        require(!settled, "settled");
        Reason why = breachReason();
        bool first = !breached;
        require(breached || why != Reason.None, "no breach");
        breached = true;
        uint256 n;
        for (uint256 i; i < markets.length; i++) {
            uint32 m = markets[i];
            int64 s = position(m).szi;
            if (s == 0) continue;
            bool isBuy = s < 0;
            uint8 dec = szDecimals[m];
            uint64 sz8 = uint64(s < 0 ? -s : s) * uint64(10 ** (8 - dec));
            uint64 raw = oraclePx(m);
            raw = isBuy ? raw * 105 / 100 : raw * 95 / 100;
            uint64 px8 = _fiveSig(raw) * uint64(10 ** (2 + dec));                  // raw has 6-dec decimals -> 1e8
            _cw(1, abi.encode(m, isBuy, px8, sz8, true, uint8(3), uint128(0)));
            n++;
        }
        require(n > 0, "flat");
        emit Flatten(msg.sender, uint8(why), equityPnl(), n);
        if (first && why != Reason.None && bountyUsd6 > 0 && !bountyPaid) {
            bountyPaid = true;
            _cw(7, abi.encode(bountyUsd6, false));                                   // perp -> spot
            _cw(6, abi.encode(msg.sender, uint64(0), uint64(bountyUsd6) * 100));     // USDC spot wei 1e8
        }
    }
    // HyperCore perp prices: at most 5 significant figures
    function _fiveSig(uint64 x) internal pure returns (uint64) {
        uint64 p = 1;
        while (x / p >= 100_000) p *= 10;
        return x / p * p;
    }

    // ---------- settle ----------
    function settle() external {
        require(breached && !settled, "not ended");
        require(isFlat(), "positions open");
        settled = true;
        int64 eq = accountValue();
        uint64 equity = eq > 0 ? uint64(eq) : 0;
        int256 profit = int256(uint256(equity)) - int256(uint256(capital));
        uint64 toTrader = profit > 0 ? uint64(uint256(profit) * traderShareBps / 10_000) : 0;
        uint64 toBacker = equity - toTrader;
        if (equity > 0) _cw(7, abi.encode(equity, false));
        if (toTrader > 0) _cw(6, abi.encode(trader, uint64(0), toTrader * 100));
        if (toBacker > 0) _cw(6, abi.encode(backer, uint64(0), toBacker * 100));
        emit Settled(profit, toTrader, toBacker);
    }

    function _cw(uint24 id, bytes memory enc) internal { ICoreWriter(CW).sendRawAction(abi.encodePacked(uint8(1), id, enc)); }
}
