// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import "./BackedVaultV3.sol";

/// Any backer creates a vault for any trader in one tx. The keeper enumerates vaults from here.
contract BackedFactory {
    address[] public vaults;
    event VaultCreated(address indexed vault, address indexed backer, address indexed trader);
    function create(address trader, uint32[] calldata markets, uint8[] calldata szDec, uint256 maxLev, int64 floor,
                    uint64 dailyLoss, uint16 shareBps, uint64 bounty) external returns (address v) {
        v = address(new BackedVaultV3(msg.sender, trader, markets, szDec, maxLev, floor, dailyLoss, shareBps, bounty));
        vaults.push(v);
        emit VaultCreated(v, msg.sender, trader);
    }
    function count() external view returns (uint256) { return vaults.length; }
    function all() external view returns (address[] memory) { return vaults; }
}
