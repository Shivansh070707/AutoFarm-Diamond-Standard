# Code Improvisations

The Autofarm-Diamond is implementation of autofarm and strat contracts in diamond standard.
though whole implementation is different from original contracts but logic throughout the contracts are same,
however in some cases we improvised the logic . below are the changes in the contracts .

## Code changes from original autofarm contract

1- Changes in withdrawAll() function:

- Original Function Implementation:

  ```solidity
  function withdrawAll(uint256 _pid) public nonReentrant {
          withdraw(_pid, uint256(-1));
      }
  ```

  Here in Original imlementation , withdraw and withdraw function has nonReentrant guard thus the withdrawAll function will revert due to reentrancy . To avoid this error we removed nonreentrant guard as shown below.

- Modified Function Implementation:

  ```solidity
  function withdrawAll(uint256 _pid) external {
          withdraw(_pid, type(uint256).max);
      }
  ```

2- changes in updatepool() function:

- Original implementation

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

- Modified implementtaion

  ```solidity
   uint256 autoReward = (multiplier *
        (a.autoPerBlock) *
        (pool.allocPoint)) / (a.totalAllocPoint);
    uint256 ownerReward = (autoReward * (a.ownerAUTOReward)) / (1000);

    IAutoToken(a.autoV2).mint(_owner(), ownerReward);

    IAutoToken(a.autoV2).mint(address(this), autoReward - ownerReward);
  ```

  AutoToken Rewards should be minted like this:

  - A percentage of AUTOReward will be minted to owner (ownerAUTOReward = 12%)

  - Remaining tokens will be minted to the farmContract

  In original implementation ,additional 12% (ownerAUTOReward) of AUTOReward are minted whereas in modified implementation 12% tokens are minted to owner and remaining 88% of autoReward are minted to autofarm contract address.

---

## Code changes from original stratx2 contract

1- Removed unused variables in deposit function

- Original Implementation

  ```solidity
  function deposit(address _userAddress, uint256 _wantAmt)
          public
          virtual
          onlyOwner
          nonReentrant
          whenNotPaused
          returns (uint256)
  ```

- Modified implementation

  ```solidity
  function deposit(uint256 _wantAmt) external nonReentrant returns (uint256)
  ```

2- Removed unused variables in deposit function

- Original Implementation

  ```solidity
  function withdraw(address _userAddress, uint256 _wantAmt)
        public
        virtual
        onlyOwner
        nonReentrant
        returns (uint256)
  ```

- Modified implementation

  ```solidity
   function withdraw(uint256 _wantAmt) external nonReentrant returns (uint256)
  ```
