// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibDiamond} from "../../libraries/LibDiamond.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IAutoToken.sol";
import "../../interfaces/IStrategy.sol";

contract AutoFarmV2GetterFacet {
    function autoV2() external view returns (address) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.autoV2;
    }

    function burnAddress() external view returns (address) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.burnAddress;
    }

    function ownerAUTOReward() external view returns (uint256) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.ownerAUTOReward;
    }

    function autoMaxSupply() external view returns (uint256) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.autoMaxSupply;
    }

    function totalAllocPoint() external view returns (uint256) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.totalAllocPoint;
    }

    function autoPerBlock() external view returns (uint256) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.autoPerBlock;
    }

    function poolInfo(uint256 pid)
        external
        view
        returns (LibDiamond.PoolInfo memory)
    {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.poolInfo[pid];
    }

    function userInfo(uint256 pid, address user)
        external
        view
        returns (LibDiamond.UserInfo memory)
    {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.userInfo[pid][user];
    }

    function startBlock() external view returns (uint256) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.startBlock;
    }
}
