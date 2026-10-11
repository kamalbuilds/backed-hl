// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "../src/BackedFactory.sol";

interface Vm {
    function etch(address, bytes calldata) external; function warp(uint256) external; function prank(address) external;
    function addr(uint256) external returns (address); function sign(uint256, bytes32) external returns (uint8, bytes32, bytes32);
}
contract MockCW {
    bytes[] public calls;
    function sendRawAction(bytes calldata d) external { calls.push(d); }
    function n() external view returns (uint256) { return calls.length; }
    function idAt(uint256 i) external view returns (uint24 id) { bytes memory d = calls[i]; assembly { id := shr(232, mload(add(d, 33))) } }
    function bodyAt(uint256 i) external view returns (bytes memory b) { bytes memory d = calls[i]; b = new bytes(d.length - 4); for (uint256 k; k < b.length; k++) b[k] = d[k + 4]; }
}
contract MockOracle { mapping(uint32 => uint64) public px; function set(uint32 a, uint64 p) external { px[a] = p; }
    fallback(bytes calldata i) external returns (bytes memory) { return abi.encode(px[abi.decode(i, (uint32))]); } }
contract MockPos { mapping(uint32 => int64) public szi; function set(uint32 a, int64 s) external { szi[a] = s; }
    fallback(bytes calldata i) external returns (bytes memory) { (, uint32 a) = abi.decode(i, (address, uint32)); return abi.encode(szi[a], uint64(0), int64(0), uint32(0), false); } }
contract MockMargin { int64 public av; function set(int64 v) external { av = v; }
    fallback(bytes calldata) external returns (bytes memory) { return abi.encode(av, uint64(0), uint64(0), int64(0)); } }

contract BackedVaultV3Test {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);
    MockCW constant cw = MockCW(0x3333333333333333333333333333333333333333);
    MockOracle constant ora = MockOracle(0x0000000000000000000000000000000000000807);
    MockPos constant pos = MockPos(0x0000000000000000000000000000000000000813);
    MockMargin constant mar = MockMargin(0x000000000000000000000000000000000000080F);
    uint32 constant ETH = 4; uint32 constant BTC = 3; uint32 constant SOL = 5;
    uint256 constant TK = 0xA11CE; address trader; address relayer = address(0xBEEF); address anyone = address(0xCAFE);
    BackedFactory f; BackedVaultV3 v;

    function setUp() public {
        vm.etch(address(cw), address(new MockCW()).code); vm.etch(address(ora), address(new MockOracle()).code);
        vm.etch(address(pos), address(new MockPos()).code); vm.etch(address(mar), address(new MockMargin()).code);
        vm.warp(1_800_000_000);
        ora.set(ETH, 250000); ora.set(BTC, 1000000); // ETH $2500 (szDec 4, raw 1e2); BTC $100000 (szDec 5, raw 1e1)
        trader = vm.addr(TK); f = new BackedFactory();
        uint32[] memory m = new uint32[](2); m[0] = ETH; m[1] = BTC; uint8[] memory d = new uint8[](2); d[0] = 4; d[1] = 5;
        v = BackedVaultV3(f.create(trader, m, d, 3, -2_000_000, 1_000_000, 2000, 100_000)); // 3x, floor -2, daily 1, 20% share, 0.1 bounty
        v.fundPerp(14_000_000); mar.set(14_000_000); // capital 14 -> cap 42 USD notional
    }
    function _t(uint32 a, bool b, uint64 px, uint64 sz, bool ro) internal returns (bool ok) { vm.prank(trader); (ok,) = address(v).call(abi.encodeCall(v.trade, (a, b, px, sz, ro))); }
    function _call(address who, bytes memory d) internal returns (bool ok) { vm.prank(who); (ok,) = address(v).call(d); }

    // factory
    function test_factoryRegistersVault() public view { require(f.count() == 1 && f.vaults(0) == address(v) && v.backer() == address(this) && v.trader() == trader); }
    function test_factoryRejectsBadParams() public {
        uint32[] memory m = new uint32[](1); m[0] = ETH; uint8[] memory d = new uint8[](2);
        (bool ok,) = address(f).call(abi.encodeCall(f.create, (trader, m, d, 3, -1, 0, 0, 0))); require(!ok, "len mismatch");
        d = new uint8[](1); d[0] = 4;
        (ok,) = address(f).call(abi.encodeCall(f.create, (trader, m, d, 3, 1, 0, 0, 0))); require(!ok, "positive floor");
        (ok,) = address(f).call(abi.encodeCall(f.create, (trader, m, d, 3, -1, 0, 10_001, 0))); require(!ok, "share>100%");
    }
    // markets + leverage
    function test_withinCapOk() public { require(_t(ETH, true, 2550e8, 0.016e8, false)); require(cw.idAt(cw.n() - 1) == 1); } // $40
    function test_20xRejected() public { require(!_t(ETH, true, 2550e8, 0.1123e8, false)); }
    function test_fakeLowLimitRejected() public { require(!_t(ETH, true, 1e8, 0.05e8, false)); }      // $125 at oracle
    function test_disallowedMarketRejected() public { require(!_t(SOL, true, 150e8, 0.1e8, false)); }
    function test_stackedSameMarketRejected() public { pos.set(ETH, 160); require(!_t(ETH, true, 2550e8, 0.001e8, false)); }
    function test_stackedAcrossMarketsRejected() public { pos.set(ETH, 120); /* $30 */ require(!_t(BTC, true, 101000e8, 0.00013e8, false)); /* +$13 = 43 > 42 */ require(_t(BTC, true, 101000e8, 0.0001e8, false)); /* +$10 = 40 */ }
    function test_hedgeReducesNotional() public { pos.set(ETH, 160); require(_t(ETH, false, 2450e8, 0.01e8, false)); }
    function test_onlyTraderCanTrade() public { require(!_call(anyone, abi.encodeCall(v.trade, (ETH, true, 2550e8, 0.001e8, false)))); }
    function test_reduceOnlyMustReduce() public { require(!_t(ETH, false, 2450e8, 0.001e8, true)); pos.set(ETH, 100); require(_t(ETH, false, 2450e8, 0.001e8, true)); require(!_t(ETH, true, 2550e8, 0.001e8, true)); }
    // floor / daily loss
    function test_floorCountsRealizedLoss() public { mar.set(11_900_000); require(uint8(v.breachReason()) == 1); }
    function test_noOpenWhileInBreach() public { mar.set(11_900_000); require(!_t(ETH, true, 2550e8, 0.001e8, false)); pos.set(ETH, 100); require(_t(ETH, false, 2450e8, 0.01e8, true), "reduce allowed"); }
    function test_dailyLossBreach() public {
        require(_t(ETH, true, 2550e8, 0.004e8, false)); // snapshot equity 14
        mar.set(12_900_000);                             // -1.1 today, floor (-2) not hit
        require(uint8(v.breachReason()) == 2, "daily");
        vm.warp(block.timestamp + 1 days); require(uint8(v.breachReason()) == 0, "new day resets until snapshot");
        v.checkpoint(); require(v.dayStartEquity() == 12_900_000);
    }
    // flatten
    function test_flattenNeedsBreach() public { pos.set(ETH, 100); require(!_call(anyone, abi.encodeCall(v.flatten, ()))); }
    function test_flattenClosesAllMarketsAndPaysBountyOnce() public {
        pos.set(ETH, 100); pos.set(BTC, -20); mar.set(11_000_000); uint256 n0 = cw.n();
        require(_call(anyone, abi.encodeCall(v.flatten, ())));
        require(cw.n() - n0 == 4, "2 closes + bounty transfer + send");
        (uint32 a, bool b, uint64 px8, uint64 sz8, bool ro,,) = abi.decode(cw.bodyAt(n0), (uint32, bool, uint64, uint64, bool, uint8, uint128));
        require(a == ETH && !b && ro && sz8 == 0.01e8 && px8 == 2375e8, "ETH sell 5% under oracle");
        (a, b, px8, sz8, ro,,) = abi.decode(cw.bodyAt(n0 + 1), (uint32, bool, uint64, uint64, bool, uint8, uint128));
        require(a == BTC && b && sz8 == 0.0002e8 && px8 == 105000e8, "BTC buy 5% over");
        (address to,, uint64 w) = abi.decode(cw.bodyAt(n0 + 3), (address, uint64, uint64)); require(to == anyone && w == 100_000 * 100, "bounty");
        // retry while still open: no second bounty, even if equity recovered
        mar.set(14_000_000); uint256 n1 = cw.n();
        require(_call(relayer, abi.encodeCall(v.flatten, ()))); require(cw.n() - n1 == 2, "closes only");
    }
    function test_flattenRevertsWhenFlat() public { mar.set(1); require(!_call(anyone, abi.encodeCall(v.flatten, ()))); }
    function test_fiveSigPriceRounding() public { ora.set(ETH, 249311); pos.set(ETH, 100); mar.set(1); uint256 n0 = cw.n();
        require(_call(anyone, abi.encodeCall(v.flatten, ()))); (,, uint64 px8,,,,) = abi.decode(cw.bodyAt(n0), (uint32, bool, uint64, uint64, bool, uint8, uint128));
        require(px8 == 236840000000, "236845.45 raw -> 2368.4 (5 sig)"); }
    function test_frozenAfterBreachUntilRearm() public {
        pos.set(ETH, 100); mar.set(11_000_000); require(_call(anyone, abi.encodeCall(v.flatten, ())));
        require(!_t(ETH, true, 2550e8, 0.001e8, false), "frozen");
        require(!_call(address(this), abi.encodeCall(v.rearm, ())), "open position");
        pos.set(ETH, 0); require(!_call(address(this), abi.encodeCall(v.rearm, ())), "still in breach");
        mar.set(14_000_000); require(_call(address(this), abi.encodeCall(v.rearm, ()))); require(_t(ETH, true, 2550e8, 0.001e8, false));
    }
    function test_backerStopThenAnyoneFlattensWithoutBounty() public { pos.set(ETH, 100); v.stop(); uint256 n0 = cw.n();
        require(_call(anyone, abi.encodeCall(v.flatten, ()))); require(cw.n() - n0 == 1, "no bounty without breach"); }
    function test_onlyBackerAdmin() public {
        require(!_call(anyone, abi.encodeCall(v.setFloor, (int64(1)))) && !_call(trader, abi.encodeCall(v.stop, ())) && !_call(trader, abi.encodeCall(v.fundPerp, (1))));
    }
    // settle
    function test_settleProfitSplit() public { v.stop(); mar.set(19_000_000); uint256 n0 = cw.n();
        require(_call(anyone, abi.encodeCall(v.settle, ())));
        (address to,, uint64 w) = abi.decode(cw.bodyAt(n0 + 1), (address, uint64, uint64)); require(to == trader && w == 1_000_000 * 100, "20% of 5");
        (to,, w) = abi.decode(cw.bodyAt(n0 + 2), (address, uint64, uint64)); require(to == address(this) && w == 18_000_000 * 100, "rest");
        require(!_call(anyone, abi.encodeCall(v.settle, ())), "once"); require(!_t(ETH, true, 2550e8, 0.001e8, false));
    }
    function test_settleLossAllToBacker() public { v.stop(); mar.set(10_000_000); uint256 n0 = cw.n(); require(_call(anyone, abi.encodeCall(v.settle, ())));
        require(cw.n() - n0 == 2); (address to,, uint64 w) = abi.decode(cw.bodyAt(n0 + 1), (address, uint64, uint64)); require(to == address(this) && w == 10_000_000 * 100); }
    function test_settleNeedsEndedAndFlat() public { require(!_call(anyone, abi.encodeCall(v.settle, ()))); v.stop(); pos.set(BTC, 1); require(!_call(anyone, abi.encodeCall(v.settle, ()))); }
    // gasless signed orders
    function _sig(BackedVaultV3.Order memory o, uint256 k) internal returns (uint8 a, bytes32 r, bytes32 s) { (a, r, s) = vm.sign(k, v.hashOrder(o)); }
    function test_relayerSubmitsSignedOrder() public {
        BackedVaultV3.Order memory o = BackedVaultV3.Order(ETH, true, 2550e8, 0.016e8, false, 1, block.timestamp + 60);
        (uint8 a, bytes32 r, bytes32 s) = _sig(o, TK); require(_call(relayer, abi.encodeCall(v.tradeBySig, (o, a, r, s))));
        require(!_call(relayer, abi.encodeCall(v.tradeBySig, (o, a, r, s))), "replay");
    }
    function test_signedOrderStillRuleChecked() public {
        BackedVaultV3.Order memory o = BackedVaultV3.Order(ETH, true, 2550e8, 0.1123e8, false, 2, block.timestamp + 60);
        (uint8 a, bytes32 r, bytes32 s) = _sig(o, TK); require(!_call(relayer, abi.encodeCall(v.tradeBySig, (o, a, r, s))), "20x via sig");
    }
    function test_wrongSignerExpiredTampered() public {
        BackedVaultV3.Order memory o = BackedVaultV3.Order(ETH, true, 2550e8, 0.001e8, false, 3, block.timestamp + 60);
        (uint8 a, bytes32 r, bytes32 s) = _sig(o, 0xBAD); require(!_call(relayer, abi.encodeCall(v.tradeBySig, (o, a, r, s))), "wrong signer");
        (a, r, s) = _sig(o, TK); o.sz8 = 0.002e8; require(!_call(relayer, abi.encodeCall(v.tradeBySig, (o, a, r, s))), "tampered");
        o.sz8 = 0.001e8; vm.warp(block.timestamp + 61); require(!_call(relayer, abi.encodeCall(v.tradeBySig, (o, a, r, s))), "expired");
    }
}
