# Code Improvisations

Autofarm-Diamond is the implementation of autofarm and strat contracts in the diamond standard. Although the whole implementation of state variables is different from the original contracts but logic throughout the contracts is same, however, in some cases, we improvised the logic. Below are the changes in the contracts:

## Code changes from the original autofarm contract

1- Changes in `withdrawAll()` function:

- original function implementation:

  ```solidity
  function withdrawAll(uint256 _pid) public nonReentrant {
          withdraw(_pid, uint256(-1));
      }
  ```

  Here, in the original implementation, `withdraw()` and `withdrawAll()` function has a `nonReentrant` modifier that acts as a reentrancy guard thus the `withdrawAll()` function will revert due to reentrancy. To avoid this error we removed the non-reentrant guard as shown below.

- modified function Implementation:

  ```solidity
  function withdrawAll(uint256 _pid) external {
          withdraw(_pid, type(uint256).max);
      }
  ```

2- changes in `updatePool()` function:

- original implementation

  ```solidity
    uint256 AUTOReward =
        multiplier.mul(AUTOPerBlock).mul(pool.allocPoint).div(
            totalAllocPoint
        );

    AUTOToken(AUTOv2).mint(
        owner(),
        AUTOReward.mul(ownerAUTOReward).div(1000)
        );
        AUTOToken(AUTOv2).mint(address(this), AUTOReward);
  ```

- modified implementation

  ```solidity
   uint256 autoReward = (multiplier *
        (a.autoPerBlock) *
        (pool.allocPoint)) / (a.totalAllocPoint);
    uint256 ownerReward = (autoReward * (a.ownerAUTOReward)) / (1000);

    IAutoToken(a.autoV2).mint(_owner(), ownerReward);

    IAutoToken(a.autoV2).mint(address(this), autoReward - ownerReward);
  ```

  autoToken rewards should be minted like this:

  - A percentage of AUTOReward will be minted to the owner (ownerAUTOReward = 12%)

  - remaining tokens will be minted to the farmContract

  In the original implementation, an additional 12% (ownerAUTOReward) of AUTOReward are minted, whereas in the modified implementation 12% of tokens are minted to the owner and the remaining 88% of autoReward are minted to autofarm contract address.

3- changes in `add()` function :

```solidity
  require(!a.iswantAdded[_want], "want added already!");
      a.iswantAdded[_want] = true;
      a.wantToPid[_want] = a.poolInfo.length;
```

- original contracts can't have the ability to check if the same want pools are added or not. To solve this problem we have two mappings:-

  ```solidity
    mapping(address => uint256) wantToPid;
    mapping(address => bool) iswantAdded;

  ```

  wanttoPid returns the poolId or pid of a given want address.\
  iswantAdded returns a bool value whether the want address is added in pid or not.

  - To interact with these two mappings we have two functions :

  ```solidity
  function iswantAdded(address want) external view returns (bool)
  function wantToPid(address want) external view returns (uint256)
  ```

  `wantToPid()` will revert if the user has given an address that is not added to the pool.

---

## Code changes from the original stratx2 contract

1- Removed unused variables in the deposit function

- original Implementation

  ```solidity
  function deposit(address _userAddress, uint256 _wantAmt)
          public
          virtual
          onlyOwner
          nonReentrant
          whenNotPaused
          returns (uint256)
  ```

- modified implementation

  ```solidity
  function deposit(uint256 _wantAmt) external nonReentrant returns (uint256)
  ```

2- Removed unused variables in the deposit function

- original Implementation

  ```solidity
  function withdraw(address _userAddress, uint256 _wantAmt)
        public
        virtual
        onlyOwner
        nonReentrant
        returns (uint256)
  ```

- modified implementation

  ```solidity
   function withdraw(uint256 _wantAmt) external nonReentrant returns (uint256)
  ```
