// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// For interacting with our own strategy
interface IStrategy {
    // Main want token compounding function
    function earn() external;

    function inCaseTokensGetStuck(
        address _token,
        uint256 _amount,
        address _to
    ) external;

    // Transfer want tokens autoFarm -> strategy
    function deposit(uint256 _wantAmt) external returns (uint256);

    // Transfer want tokens strategy -> autoFarm
    function withdraw(uint256 _wantAmt) external returns (uint256);

    // Total want tokens managed by stratfegy
    function wantLockedTotal() external view returns (uint256);

    // Sum of all shares of users to wantLockedTotal
    function sharesTotal() external view returns (uint256);
}
