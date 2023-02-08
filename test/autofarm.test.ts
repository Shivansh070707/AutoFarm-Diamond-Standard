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

describe('Test', () => {
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
    it('Should deposit want token for second time', async () => {
      await autoFarmFacet
        .connect(owner)
        .deposit(0, ethers.utils.parseEther('1'));
      await expect(
        autoFarmFacet.connect(owner).deposit(0, ethers.utils.parseEther('1'))
      ).to.changeTokenBalance(autoV2, farmA.diamondAddress, 10 ** 6);
    });
    it('Should deposit zero want tokens', async () => {
      await expect(autoFarmFacet.connect(owner).deposit(0, 0)).not.to.be
        .rejected;
    });

    it('Should withdraw want tokens and that tokens will be transferred to user', async () => {
      await expect(
        autoFarmFacet
          .connect(owner)
          .withdraw(0, ethers.utils.parseUnits('1', 'ether'))
      ).to.changeTokenBalances(
        want,
        [owner.address, stratB.diamondAddress],
        [ethers.utils.parseEther('1'), ethers.utils.parseEther('-1')]
      );
    });
    it('Should Withdraw want token and after withdrawing ,user will get some autoV21 tokens', async () => {
      let currentBlockTime = await time.latest();
      let one_day = currentBlockTime + 24 * 60 * 60;
      await time.increaseTo(one_day);
      let earn_balance_before: BigNumber = await autoV21.balanceOf(
        owner.address
      );

      await autoFarmFacet
        .connect(owner)
        .withdraw(0, ethers.utils.parseUnits('1', 'ether'));
      let earn_balance_after: BigNumber = await autoV21.balanceOf(
        owner.address
      );

      expect(earn_balance_after.sub(earn_balance_before)).to.be.greaterThan(0);
    });
    it('should withdraw all', async () => {
      await expect(
        autoFarmFacet.connect(owner).withdrawAll(0)
      ).to.changeTokenBalance(
        want,
        owner.address,
        ethers.utils.parseEther('1')
      );
    });
    it('should send stucked tokens', async () => {
      let xrp: XRP = data.xrp;
      let bal = await xrp.balanceOf(owner.address);

      await xrp.connect(owner).transfer(farmA.diamondAddress, bal);
      await expect(
        autoFarmFacet.connect(owner).inCaseTokensGetStuck(xrp.address, bal)
      ).to.changeTokenBalance(xrp, owner.address, bal);
    });
    it('should emergency withdraw', async () => {
      await autoFarmFacet
        .connect(owner)
        .deposit(0, ethers.utils.parseEther('1'));
      await expect(
        autoFarmFacet.connect(owner).emergencyWithdraw(0)
      ).to.changeTokenBalance(
        want,
        owner.address,
        ethers.utils.parseEther('1')
      );
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
  describe('AutoFarm Getter Test', () => {
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
  });
  describe('Negative test cases', () => {
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
      await expect(
        autoFarmFacet.inCaseTokensGetStuck(
          autoV2.address,
          ethers.utils.parseEther('1')
        )
      ).to.be.rejectedWith('Not Owner');
    });
  });
});
