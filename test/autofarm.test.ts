import { expect } from 'chai';
import { ethers } from 'hardhat';
import { initializer } from '../scripts/initFunction';
import {
  AUTOv2,
  AutoFarmFacet,
  AutoFarmV2GetterFacet,
  ERC20,
  Ownable,
  XRP,
} from '../typechain-types';
import { BigNumber } from 'ethers';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { Farm } from '../scripts/interfaces/farm';
import { Strat } from '../scripts/interfaces/strat';
import { Data } from '../scripts/interfaces/data';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Tests for Autofarm', () => {
  let autoFarmFacet: AutoFarmFacet;
  let autoFarmGetter: AutoFarmV2GetterFacet;
  let farmA: Farm;
  let farmB: Farm;
  let owner: SignerWithAddress;
  let stratB: Strat;
  let stratA: Strat;
  let want: Ownable | ERC20;
  let autoV2: AUTOv2;
  let autoV21: AUTOv2;
  let data: Data;
  let user2: SignerWithAddress;

  before(async () => {
    data = await initializer();
    farmA = data.farmA;
    farmB = data.farmB;
    stratA = data.stratA;
    stratB = data.stratB;
    want = data.want;
    autoV2 = data.autoV2;
    autoV21 = data.autoV21;
    owner = data.owner;
    user2 = data.otherAccount;
  });
  describe('AutoFarm Facet Tests ', () => {
    it('should transfer ownership of both autotokens to autofarm contract', async () => {
      await autoV2.connect(owner).transferOwnership(farmA.diamondAddress);
      await autoV21.connect(owner).transferOwnership(farmB.diamondAddress);
      expect(await autoV2.owner()).to.equal(farmA.diamondAddress);
      expect(await autoV21.owner()).to.equal(farmB.diamondAddress);
    });
    it('should pool new pool in Both Farms', async () => {
      // Adding First Pool in Both the Farm A
      autoFarmFacet = farmA.autoFarmFacet;

      await autoFarmFacet
        .connect(owner)
        .add(1, want.address, false, stratA.diamondAddress);
      expect(await autoFarmFacet.poolLength()).to.equal(1);
      // Adding First Pool in Both the Farm B

      autoFarmFacet = farmB.autoFarmFacet;
      await autoFarmFacet
        .connect(owner)
        .add(1, want.address, true, stratB.diamondAddress);
      expect(await autoFarmFacet.poolLength()).to.equal(1);
    });
    it('Should deposit want tokens in farmA for first time and want tokens will be stored in FarmB', async () => {
      autoFarmGetter = farmA.autoFarmV2GetterFacet;
      //Approving want tokens to Farm address
      await (want as ERC20)
        .connect(owner)
        .approve(farmA.diamondAddress, ethers.utils.parseUnits('10', 'ether'));

      autoFarmFacet = farmA.autoFarmFacet;

      //depositing want tokens
      await expect(
        autoFarmFacet.connect(owner).deposit(0, ethers.utils.parseEther('1'))
      ).to.changeTokenBalances(
        want,
        [owner.address, stratB.diamondAddress],
        [ethers.utils.parseEther('-1'), ethers.utils.parseEther('1')]
      );
      expect((await autoFarmGetter.userInfo(0, owner.address)).shares).to.equal(
        ethers.utils.parseEther('1')
      );
    });
    it('Should deposit want token with another user', async () => {
      await (want as ERC20).transfer(
        user2.address,
        ethers.utils.parseEther('2')
      );
      await (want as ERC20)
        .connect(user2)
        .approve(farmA.diamondAddress, ethers.utils.parseEther('2'));
      await expect(
        autoFarmFacet.connect(user2).deposit(0, ethers.utils.parseEther('1'))
      ).to.changeTokenBalances(
        want,
        [user2.address, stratB.diamondAddress],
        [ethers.utils.parseEther('-1'), ethers.utils.parseEther('1')]
      );
    });
    it('Should deposit zero want tokens', async () => {
      await expect(autoFarmFacet.connect(owner).deposit(0, 0)).not.to.be
        .rejected;
      await stratA.stratX2Facet.earn();
    });

    it('Should withdraw want tokens and that tokens will be transferred to user', async () => {
      let want_bal_before: any = await (want as ERC20).balanceOf(owner.address);
      await autoFarmFacet
        .connect(owner)
        .withdraw(0, ethers.utils.parseUnits('1', 'ether'));
      let want_bal_after: any = await (want as ERC20).balanceOf(owner.address);
      let eth: any = ethers.utils.parseUnits('1', 'ether');
      expect(want_bal_after - want_bal_before - eth).to.be.greaterThanOrEqual(
        0
      );
    });
    it('Should Withdraw want token and after withdrawing ,user will get some autoV21 tokens', async () => {
      let want_bal_before: any = await (want as ERC20).balanceOf(owner.address);
      let remainingShares: any = (
        await autoFarmGetter.userInfo(0, owner.address)
      ).shares;

      let currentBlockTime = await time.latest();
      let one_day = currentBlockTime + 24 * 60 * 60;
      await time.increaseTo(one_day);
      let earn_balance_before: BigNumber = await autoV21.balanceOf(
        owner.address
      );
      await autoFarmFacet
        .connect(owner)
        .withdraw(0, ethers.utils.parseUnits('1', 'ether'));
      let want_bal_after: any = await (want as ERC20).balanceOf(owner.address);

      let earn_balance_after: BigNumber = await autoV21.balanceOf(
        owner.address
      );
      expect(earn_balance_after.sub(earn_balance_before)).to.be.greaterThan(0);
      expect(
        want_bal_after - want_bal_before - remainingShares
      ).to.be.greaterThanOrEqual(0);
    });
    it('should withdraw all from owner', async () => {
      // from owner-
      let owner_shares_before: any = (
        await autoFarmGetter.userInfo(0, owner.address)
      ).shares;
      await autoFarmFacet.connect(owner).withdrawAll(0);
      let owner_shares_after: any = (
        await autoFarmGetter.userInfo(0, owner.address)
      ).shares;
      expect(owner_shares_before - owner_shares_after).to.be.equal(0);
    });
    it('should withdraw all from user2', async () => {
      await autoFarmFacet
        .connect(user2)
        .deposit(0, ethers.utils.parseEther('1'));
      // from owner-
      let user2_shares_before: any = (
        await autoFarmGetter.userInfo(0, user2.address)
      ).shares;
      let user2_want_bal_before: any = await (want as ERC20).balanceOf(
        user2.address
      );
      await autoFarmFacet.connect(user2).withdrawAll(0);
      let user2_want_bal_after: any = await (want as ERC20).balanceOf(
        user2.address
      );
      expect(
        user2_want_bal_after - user2_want_bal_before - user2_shares_before
      ).to.be.greaterThan(0);

      let user2_shares_after: any = (
        await autoFarmGetter.userInfo(0, user2.address)
      ).shares;
      expect(user2_shares_after).to.lessThanOrEqual(1);
    });
    it('should send stucked tokens', async () => {
      let xrp: XRP = data.xrp;
      let bal = await xrp.balanceOf(owner.address);

      await xrp.connect(owner).transfer(farmA.diamondAddress, bal);
      await expect(
        autoFarmFacet.connect(owner).inCaseTokensGetStuck(xrp.address, bal)
      ).to.changeTokenBalance(xrp, owner.address, bal);
    });
    it('should emergency withdraw from owner', async () => {
      await autoFarmFacet
        .connect(owner)
        .deposit(0, ethers.utils.parseEther('1'));

      await autoFarmFacet.connect(owner).emergencyWithdraw(0);
      let owner_shares = (await autoFarmGetter.userInfo(0, owner.address))
        .shares;
      expect(owner_shares).to.equal(0);
    });
    it('should emergency withdraw from user2', async () => {
      await autoFarmFacet.connect(user2).emergencyWithdraw(0);

      let owner_shares = (await autoFarmGetter.userInfo(0, owner.address))
        .shares;
      expect(owner_shares).to.equal(0);
    });
    it('should return pending auto', async () => {
      let pendingAuto = await autoFarmFacet.pendingAUTO(0, owner.address);
      expect(pendingAuto).to.be.equal(0);
    });
    it('should return staked want', async () => {
      let stakedWant = await autoFarmFacet.stakedWantTokens(0, owner.address);
      expect(stakedWant).to.be.equal(0);
    });
    it('should set the pool', async () => {
      autoFarmFacet = farmB.autoFarmFacet;
      await autoFarmFacet.connect(owner).set(0, 1, false);
      autoFarmGetter = farmB.autoFarmV2GetterFacet;
      expect((await autoFarmGetter.poolInfo(0)).allocPoint).to.equal(1);
    });
  });
  describe('AutoFarm Getter Tests', () => {
    it('should return autov2 address', async () => {
      autoFarmGetter = farmA.autoFarmV2GetterFacet;
      expect(await autoFarmGetter.autoV2()).to.equal(autoV2.address);
    });
    it('should return burn address', async () => {
      let burnAddress = '0x000000000000000000000000000000000000dEaD';
      expect(await autoFarmGetter.burnAddress()).to.equal(burnAddress);
    });
    it('should return ownerAUTOReward', async () => {
      let ownerAUTOReward = 138;
      expect(await autoFarmGetter.ownerAUTOReward()).to.equal(ownerAUTOReward);
    });
    it('should return autoMaxSupply', async () => {
      let autoMaxSupply = ethers.utils.parseEther('80000');
      expect(await autoFarmGetter.autoMaxSupply()).to.equal(autoMaxSupply);
    });
    it('should return totalAllocPoint ', async () => {
      let totalAllocPoint = 1;
      expect(await autoFarmGetter.totalAllocPoint()).to.equal(totalAllocPoint);
    });
    it('should return autoPerBlock ', async () => {
      let autoPerBlock = 8000000000000000;
      expect(await autoFarmGetter.autoPerBlock()).to.equal(autoPerBlock);
    });
    it('should return startBlock ', async () => {
      let startBlock = 3888888;
      expect(await autoFarmGetter.startBlock()).to.equal(startBlock);
    });
    it('should return poolInfo ', async () => {
      let poolInfo = await autoFarmGetter.poolInfo(0);
      expect(poolInfo.strat).to.equal(stratA.diamondAddress);
    });
    it('should return userInfo ', async () => {
      let userInfo = await autoFarmGetter.userInfo(0, owner.address);
      expect(userInfo.shares).to.be.equal(0);
    });
    it('should return iswantAdded ', async () => {
      let iswantAdded = await autoFarmGetter.iswantAdded(want.address);
      expect(iswantAdded).to.be.equal(true);
    });
    it('should return wantToPid ', async () => {
      let wantToPid = await autoFarmGetter.wantToPid(want.address);
      expect(wantToPid).to.be.equal(0);
    });
  });
  describe('Negative Test Cases - Autofarm', () => {
    it('should revert when stucked token is autov2 token', async () => {
      autoFarmFacet = farmA.autoFarmFacet;
      await autoV2
        .connect(owner)
        .transfer(farmA.diamondAddress, ethers.utils.parseEther('1'));
      await expect(
        autoFarmFacet
          .connect(owner)
          .inCaseTokensGetStuck(autoV2.address, ethers.utils.parseEther('1'))
      ).to.be.rejectedWith('!safe');
    });
    it('will revert if caller is not owner', async () => {
      let signer: SignerWithAddress[] = await ethers.getSigners();
      let user1: SignerWithAddress = signer[5];
      await expect(
        autoFarmFacet
          .connect(user1)
          .inCaseTokensGetStuck(autoV2.address, ethers.utils.parseEther('1'))
      ).to.be.rejectedWith('Not Owner');
    });
    it('will revert when withdraw want amount is zero', async () => {
      await expect(
        autoFarmFacet.connect(user2).emergencyWithdraw(0)
      ).to.be.rejectedWith('_wantAmt <= 0');
    });
    it('will revert when same want pool added to autofarm', async () => {
      await expect(
        autoFarmFacet
          .connect(owner)
          .add(1, want.address, true, stratB.diamondAddress)
      ).to.be.revertedWith('want added already!');
    });
    it('will revert when pool not found', async () => {
      await expect(
        autoFarmGetter.wantToPid(data.bitcoin.address)
      ).to.be.rejectedWith('pid not found');
    });
  });
});
