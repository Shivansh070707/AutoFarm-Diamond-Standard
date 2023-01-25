// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibDiamond} from "../../libraries/LibDiamond.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../interfaces/IAutoToken.sol";
import "../../interfaces/IStrategy.sol";

contract AutoFarmFacet is ReentrancyGuard {
    using SafeERC20 for IERC20;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    // Want tokens moved from user -> AUTOFarm (auto allocation) -> Strat (compounding)
    function deposit(uint256 _pid, uint256 _wantAmt) external nonReentrant {
        updatePool(_pid);
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        LibDiamond.PoolInfo storage pool = a.poolInfo[_pid];
        LibDiamond.UserInfo storage user = a.userInfo[_pid][msg.sender];

        if (user.shares > 0) {
            uint256 pending = (user.shares * (pool.accAUTOPerShare)) /
                (1e12) -
                (user.rewardDebt);
            if (pending > 0) {
                _safeAUTOTransfer(msg.sender, pending);
            }
        }
        if (_wantAmt > 0) {
            IERC20(pool.want).safeTransferFrom(
                address(msg.sender),
                address(this),
                _wantAmt
            );

            IERC20(pool.want).safeIncreaseAllowance(pool.strat, _wantAmt);
            uint256 sharesAdded = IStrategy(pool.strat).deposit(_wantAmt);
            user.shares = user.shares + (sharesAdded);
        }
        user.rewardDebt = (user.shares * (pool.accAUTOPerShare)) / (1e12);
        emit Deposit(msg.sender, _pid, _wantAmt);
    }

    function withdrawAll(uint256 _pid) external nonReentrant {
        withdraw(_pid, type(uint256).max);
    }

    function inCaseTokensGetStuck(address _token, uint256 _amount) external {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        require(msg.sender == a.owner, "Not Owner");
        require(_token != a.autoV2, "!safe");
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        LibDiamond.PoolInfo storage pool = a.poolInfo[_pid];
        LibDiamond.UserInfo storage user = a.userInfo[_pid][msg.sender];

        uint256 wantLockedTotal = IStrategy(pool.strat).wantLockedTotal();
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
        uint256 amount = (user.shares * (wantLockedTotal)) / (sharesTotal);

        IStrategy(pool.strat).withdraw(amount);

        IERC20(pool.want).safeTransfer(address(msg.sender), amount);
        emit EmergencyWithdraw(msg.sender, _pid, amount);
        user.shares = 0;
        user.rewardDebt = 0;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do. (Only if want tokens are stored here.)

    function add(
        uint256 _allocPoint,
        address _want,
        bool _withUpdate,
        address _strat
    ) external {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        require(msg.sender == a.owner, "Not Owner");
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > a.startBlock
            ? block.number
            : a.startBlock;
        a.totalAllocPoint = a.totalAllocPoint + (_allocPoint);
        a.poolInfo.push(
            LibDiamond.PoolInfo({
                want: _want,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accAUTOPerShare: 0,
                strat: _strat
            })
        );
    }

    // Update the given pool's auto allocation point. Can only be called by the owner.
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) external {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        require(msg.sender == a.owner, "Not Owner");
        if (_withUpdate) {
            massUpdatePools();
        }
        a.totalAllocPoint =
            a.totalAllocPoint -
            (a.poolInfo[_pid].allocPoint) +
            (_allocPoint);
        a.poolInfo[_pid].allocPoint = _allocPoint;
    }

    // View function to see pending auto on frontend.
    function pendingAUTO(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        LibDiamond.PoolInfo storage pool = a.poolInfo[_pid];
        LibDiamond.UserInfo storage user = a.userInfo[_pid][_user];
        uint256 accAUTOPerShare = pool.accAUTOPerShare;
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
        if (block.number > pool.lastRewardBlock && sharesTotal != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 autoReward = (multiplier *
                (a.autoPerBlock) *
                (pool.allocPoint)) / (a.totalAllocPoint);
            accAUTOPerShare =
                accAUTOPerShare +
                ((autoReward * (1e12)) / (sharesTotal));
        }
        return (user.shares * (accAUTOPerShare)) / (1e12) - (user.rewardDebt);
    }

    // View function to see staked Want tokens on frontend.
    function stakedWantTokens(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        LibDiamond.PoolInfo storage pool = a.poolInfo[_pid];
        LibDiamond.UserInfo storage user = a.userInfo[_pid][_user];
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
        uint256 wantLockedTotal = IStrategy(pool.strat).wantLockedTotal();
        if (sharesTotal == 0) {
            return 0;
        }
        return (user.shares * (wantLockedTotal)) / (sharesTotal);
    }

    function poolLength() external view returns (uint256) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.poolInfo.length;
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        uint256 length = a.poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _wantAmt) public nonReentrant {
        updatePool(_pid);
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        LibDiamond.PoolInfo storage pool = a.poolInfo[_pid];
        LibDiamond.UserInfo storage user = a.userInfo[_pid][msg.sender];
        uint256 wantLockedTotal = IStrategy(pool.strat).wantLockedTotal();
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();

        require(user.shares > 0, "user.shares is 0");
        require(sharesTotal > 0, "sharesTotal is 0");

        // Withdraw pending auto
        uint256 pending = (user.shares * (pool.accAUTOPerShare)) /
            (1e12) -
            (user.rewardDebt);
        if (pending > 0) {
            _safeAUTOTransfer(msg.sender, pending);
        }

        // Withdraw want tokens
        uint256 amount = (user.shares * (wantLockedTotal)) / (sharesTotal);
        if (_wantAmt > amount) {
            _wantAmt = amount;
        }
        if (_wantAmt > 0) {
            uint256 sharesRemoved = IStrategy(pool.strat).withdraw(_wantAmt);

            if (sharesRemoved > user.shares) {
                user.shares = 0;
            } else {
                user.shares = user.shares - (sharesRemoved);
            }

            uint256 wantBal = IERC20(pool.want).balanceOf(address(this));
            if (wantBal < _wantAmt) {
                _wantAmt = wantBal;
            }
            IERC20(pool.want).safeTransfer(address(msg.sender), _wantAmt);
        }
        user.rewardDebt = (user.shares * (pool.accAUTOPerShare)) / (1e12);
        emit Withdraw(msg.sender, _pid, _wantAmt);
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        LibDiamond.PoolInfo storage pool = a.poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();

        if (sharesTotal == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);

        if (multiplier <= 0) {
            return;
        }
        uint256 autoReward = (multiplier *
            (a.autoPerBlock) *
            (pool.allocPoint)) / (a.totalAllocPoint);

        IAutoToken(a.autoV2).mint(
            _owner(),
            (autoReward * (a.ownerAUTOReward)) / (1000)
        );
        IAutoToken(a.autoV2).mint(address(this), autoReward);

        pool.accAUTOPerShare =
            pool.accAUTOPerShare +
            ((autoReward * (1e12)) / (sharesTotal));
        pool.lastRewardBlock = block.number;
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        if (IERC20(a.autoV2).totalSupply() >= a.autoMaxSupply) {
            return 0;
        }
        return _to - (_from);
    }

    // Safe auto transfer function, just in case if rounding error causes pool to not have enough
    function _safeAUTOTransfer(address _to, uint256 _AUTOAmt) internal {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        uint256 AUTOBal = IERC20(a.autoV2).balanceOf(address(this));
        if (_AUTOAmt > AUTOBal) {
            IERC20(a.autoV2).transfer(_to, AUTOBal);
        } else {
            IERC20(a.autoV2).transfer(_to, _AUTOAmt);
        }
    }

    function _owner() internal view returns (address owner_) {
        LibDiamond.AutoFarmV2Storage storage a = LibDiamond.autoFarmStorage();
        return a.owner;
    }
}
