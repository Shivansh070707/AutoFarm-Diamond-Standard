// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/
import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import "hardhat/console.sol";

// Remember to add the loupe functions from DiamondLoupeFacet to the diamond.
// The loupe functions are required by the EIP2535 Diamonds standard

library LibDiamond {
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.diamond.storage");
    bytes32 constant STRATX2_STORAGE_POSITION =
        keccak256("diamond.standard.stratx2.storage");
    bytes32 constant AUTOFARM_V2_STORAGE_POSITION =
        keccak256("diamond.standard.autofarm_v2.storage");

    struct FacetAddressAndSelectorPosition {
        address facetAddress;
        uint16 selectorPosition;
    }

    struct DiamondStorage {
        // function selector => facet address and selector position in selectors array
        mapping(bytes4 => FacetAddressAndSelectorPosition) facetAddressAndSelectorPosition;
        bytes4[] selectors;
        mapping(bytes4 => bool) supportedInterfaces;
        // owner of the contract
        address contractOwner;
    }

    // Info of each user.
    struct UserInfo {
        uint256 shares; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.

        // We do some fancy math here. Basically, any point in time, the amount of auto
        // entitled to a user but is pending to be distributed is:
        //
        //   amount = user.shares / sharesTotal * wantLockedTotal
        //   pending reward = (amount * pool.accAUTOPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws want tokens to a pool. Here's what happens:
        //   1. The pool's `accAUTOPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    struct PoolInfo {
        address want; // Address of the want token.
        uint256 allocPoint; // How many allocation points assigned to this pool. auto to distribute per block.
        uint256 lastRewardBlock; // Last block number that auto distribution occurs.
        uint256 accAUTOPerShare; // Accumulated auto per share, times 1e12. See below.
        address strat; // Strategy address that will auto compound want tokens
    }
    struct AutoFarmV2Storage {
        address owner;
        mapping(address => uint256) wantToPid;
        mapping(address => bool) iswantAdded;
        address autoV2;
        address burnAddress;
        uint256 ownerAUTOReward; // 12%
        uint256 autoMaxSupply;
        uint256 autoPerBlock; // auto tokens created per block
        uint256 startBlock; //https://bscscan.com/block/countdown/3888888
        PoolInfo[] poolInfo; // Info of each pool.
        mapping(uint256 => mapping(address => UserInfo)) userInfo; // Info of each user that stakes LP tokens.
        uint256 totalAllocPoint; // Total allocation points. Must be the sum of all allocation points in all pools.
    }

    function autoFarmStorage()
        internal
        pure
        returns (AutoFarmV2Storage storage a)
    {
        bytes32 position = AUTOFARM_V2_STORAGE_POSITION;
        assembly {
            a.slot := position
        }
    }

    struct StratX2Storage {
        bool _paused;
        bool isCAKEStaking; // only for staking CAKE using pancakeswap's native CAKE staking contract.
        bool isSameAssetDeposit;
        bool isAutoComp; // this vault is purely for staking. eg. WBNB-AUTO staking vault.
        address farmContractAddress; // address of farm, eg, PCS, Thugs etc.
        uint256 pid; // pid of pool in farmContractAddress
        address owner;
        address wantAddress;
        address token0Address;
        address token1Address;
        address earnedAddress;
        address uniRouterAddress; // uniswap, pancakeswap etc
        address wbnbAddress;
        address autoFarmAddress;
        address AUTOAddress;
        address govAddress; // timelock contract
        bool onlyGov;
        uint256 lastEarnBlock;
        uint256 wantLockedTotal;
        uint256 sharesTotal;
        uint256 controllerFee; // 70;
        uint256 controllerFeeMax; // 100 = 1%
        uint256 controllerFeeUL;
        uint256 buyBackRate; // 250;
        uint256 buyBackRateMax; // 100 = 1%
        uint256 buyBackRateUL;
        address buyBackAddress;
        address rewardsAddress;
        uint256 entranceFeeFactor; // < 0.1% entrance fee - goes to pool + prevents front-running
        uint256 entranceFeeFactorMax;
        uint256 entranceFeeFactorLL; // 0.5% is the max entrance fee settable. LL = lowerlimit
        uint256 withdrawFeeFactor; // 0.1% withdraw fee - goes to pool
        uint256 withdrawFeeFactorMax;
        uint256 withdrawFeeFactorLL; // 0.5% is the max entrance fee settable. LL = lowerlimit
        uint256 slippageFactor; // 5% default slippage tolerance
        uint256 slippageFactorUL;
        address[] earnedToAUTOPath;
        address[] earnedToToken1Path;
        address[] token0ToEarnedPath;
        address[] token1ToEarnedPath;
        address[] earnedToToken0Path;
    }
    //  */ @dev Emitted when the pause is triggered by `account`.
    //  */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    function _msgSender() internal view returns (address) {
        return msg.sender;
    }

    function paused() internal view returns (bool) {
        StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s._paused;
    }

    function _pause() internal {
        StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(!paused(), "Pausable: paused");
        s._paused = true;
        emit Paused(_msgSender());
    }

    function _unpause() internal {
        StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(paused(), "Pausable: not paused");
        s._paused = false;
        emit Unpaused(_msgSender());
    }

    function diamondStorage()
        internal
        pure
        returns (DiamondStorage storage ds)
    {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function stratX2Storage() internal pure returns (StratX2Storage storage s) {
        bytes32 position = STRATX2_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    function setContractOwner(address _newOwner) internal {
        DiamondStorage storage ds = diamondStorage();
        address previousOwner = ds.contractOwner;
        ds.contractOwner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }

    function contractOwner() internal view returns (address contractOwner_) {
        contractOwner_ = diamondStorage().contractOwner;
    }

    function enforceIsContractOwner() internal view {
        require(
            msg.sender == diamondStorage().contractOwner,
            "LibDiamond: Must be contract owner"
        );
    }

    event DiamondCut(
        IDiamondCut.FacetCut[] _diamondCut,
        address _init,
        bytes _calldata
    );

    // Internal function version of diamondCut
    function diamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) internal {
        for (
            uint256 facetIndex;
            facetIndex < _diamondCut.length;
            facetIndex++
        ) {
            IDiamondCut.FacetCutAction action = _diamondCut[facetIndex].action;
            if (action == IDiamondCut.FacetCutAction.Add) {
                addFunctions(
                    _diamondCut[facetIndex].facetAddress,
                    _diamondCut[facetIndex].functionSelectors
                );
            } else if (action == IDiamondCut.FacetCutAction.Replace) {
                replaceFunctions(
                    _diamondCut[facetIndex].facetAddress,
                    _diamondCut[facetIndex].functionSelectors
                );
            } else if (action == IDiamondCut.FacetCutAction.Remove) {
                removeFunctions(
                    _diamondCut[facetIndex].facetAddress,
                    _diamondCut[facetIndex].functionSelectors
                );
            } else {
                revert("LibDiamondCut: Incorrect FacetCutAction");
            }
        }
        emit DiamondCut(_diamondCut, _init, _calldata);
        initializeDiamondCut(_init, _calldata);
    }

    function addFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(
            _functionSelectors.length > 0,
            "LibDiamondCut: No selectors in facet to cut"
        );
        DiamondStorage storage ds = diamondStorage();
        uint16 selectorCount = uint16(ds.selectors.length);
        require(
            _facetAddress != address(0),
            "LibDiamondCut: Add facet can't be address(0)"
        );
        enforceHasContractCode(
            _facetAddress,
            "LibDiamondCut: Add facet has no code"
        );
        for (
            uint256 selectorIndex;
            selectorIndex < _functionSelectors.length;
            selectorIndex++
        ) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds
                .facetAddressAndSelectorPosition[selector]
                .facetAddress;
            // TODO: remove this line
            if (oldFacetAddress != address(0)) {
                console.log("# Facet already exists");
                console.log("old facet address: ", oldFacetAddress);
                console.log("Selector");
                console.logBytes4(selector);
            }
            require(
                oldFacetAddress == address(0),
                "LibDiamondCut: Can't add function that already exists"
            );
            ds.facetAddressAndSelectorPosition[
                    selector
                ] = FacetAddressAndSelectorPosition(
                _facetAddress,
                selectorCount
            );
            ds.selectors.push(selector);
            selectorCount++;
        }
    }

    function replaceFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(
            _functionSelectors.length > 0,
            "LibDiamondCut: No selectors in facet to cut"
        );
        DiamondStorage storage ds = diamondStorage();
        require(
            _facetAddress != address(0),
            "LibDiamondCut: Replace facet can't be address(0)"
        );
        enforceHasContractCode(
            _facetAddress,
            "LibDiamondCut: Replace facet has no code"
        );
        for (
            uint256 selectorIndex;
            selectorIndex < _functionSelectors.length;
            selectorIndex++
        ) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds
                .facetAddressAndSelectorPosition[selector]
                .facetAddress;
            // can't replace immutable functions -- functions defined directly in the diamond
            require(
                oldFacetAddress != address(this),
                "LibDiamondCut: Can't replace immutable function"
            );
            require(
                oldFacetAddress != _facetAddress,
                "LibDiamondCut: Can't replace function with same function"
            );
            require(
                oldFacetAddress != address(0),
                "LibDiamondCut: Can't replace function that doesn't exist"
            );
            // replace old facet address
            ds
                .facetAddressAndSelectorPosition[selector]
                .facetAddress = _facetAddress;
        }
    }

    function removeFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(
            _functionSelectors.length > 0,
            "LibDiamondCut: No selectors in facet to cut"
        );
        DiamondStorage storage ds = diamondStorage();
        uint256 selectorCount = ds.selectors.length;
        require(
            _facetAddress == address(0),
            "LibDiamondCut: Remove facet address must be address(0)"
        );
        for (
            uint256 selectorIndex;
            selectorIndex < _functionSelectors.length;
            selectorIndex++
        ) {
            bytes4 selector = _functionSelectors[selectorIndex];
            FacetAddressAndSelectorPosition
                memory oldFacetAddressAndSelectorPosition = ds
                    .facetAddressAndSelectorPosition[selector];
            require(
                oldFacetAddressAndSelectorPosition.facetAddress != address(0),
                "LibDiamondCut: Can't remove function that doesn't exist"
            );
            // can't remove immutable functions -- functions defined directly in the diamond
            require(
                oldFacetAddressAndSelectorPosition.facetAddress !=
                    address(this),
                "LibDiamondCut: Can't remove immutable function."
            );
            // replace selector with last selector
            selectorCount--;
            if (
                oldFacetAddressAndSelectorPosition.selectorPosition !=
                selectorCount
            ) {
                bytes4 lastSelector = ds.selectors[selectorCount];
                ds.selectors[
                    oldFacetAddressAndSelectorPosition.selectorPosition
                ] = lastSelector;
                ds
                    .facetAddressAndSelectorPosition[lastSelector]
                    .selectorPosition = oldFacetAddressAndSelectorPosition
                    .selectorPosition;
            }
            // delete last selector
            ds.selectors.pop();
            delete ds.facetAddressAndSelectorPosition[selector];
        }
    }

    function initializeDiamondCut(address _init, bytes memory _calldata)
        internal
    {
        if (_init == address(0)) {
            require(
                _calldata.length == 0,
                "LibDiamondCut: _init is address(0) but_calldata is not empty"
            );
        } else {
            require(
                _calldata.length > 0,
                "LibDiamondCut: _calldata is empty but _init is not address(0)"
            );
            if (_init != address(this)) {
                enforceHasContractCode(
                    _init,
                    "LibDiamondCut: _init address has no code"
                );
            }
            (bool success, bytes memory error) = _init.delegatecall(_calldata);
            if (!success) {
                if (error.length > 0) {
                    // bubble up the error
                    revert(string(error));
                } else {
                    revert("LibDiamondCut: _init function reverted");
                }
            }
        }
    }

    function enforceHasContractCode(
        address _contract,
        string memory _errorMessage
    ) internal view {
        uint256 contractSize;
        assembly {
            contractSize := extcodesize(_contract)
        }
        require(contractSize > 0, _errorMessage);
    }
}
