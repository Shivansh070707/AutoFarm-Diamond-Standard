import { expect } from 'chai';
import { ethers } from 'hardhat';
import { initializer } from '../scripts/initFunction';
import {
  AUTOv2,
  AutoFarmFacet,
  ERC20,
  Ownable,
  StratX2Facet,
  StratX2GetterFacet,
  StratX2SetterFacet,
} from '../typechain-types';
import { BigNumber } from 'ethers';

import { time } from '@nomicfoundation/hardhat-network-helpers';
import { Farm } from '../scripts/interfaces/farm';
import { Strat } from '../scripts/interfaces/strat';
import { Data } from '../scripts/interfaces/data';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Tests for StratX2', () => {
  let stratX2Facet: StratX2Facet;
  let stratX2Setter: StratX2SetterFacet;
  let stratX2Getter: StratX2GetterFacet;
  let autoFarmFacet: AutoFarmFacet;
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
  describe('Adding Strat to Autofarm ', () => {
    it('should pool new pool in Both Farms', async () => {
      await autoV2.connect(owner).transferOwnership(farmA.diamondAddress);
      await autoV21.connect(owner).transferOwnership(farmB.diamondAddress);
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
        .add(1, want.address, false, stratB.diamondAddress);
      expect(await autoFarmFacet.poolLength()).to.equal(1);
    });
  });
  describe('StratX2Getter Tests', () => {
    it('should return isCAKEStaking', async () => {
      stratX2Getter = stratA.stratX2Getter;
      let isCAKEStaking = false;
      expect(await stratX2Getter.isCAKEStaking()).to.be.equal(isCAKEStaking);
    });
    it('should return isPaused', async () => {
      let isPaused = false;
      expect(await stratX2Getter.isPaused()).to.be.equal(isPaused);
    });
    it('should return isAutoComp', async () => {
      let isAutoComp = true;
      expect(await stratX2Getter.isAutoComp()).to.be.equal(isAutoComp);
    });
    it('should return isSameAssetDeposit', async () => {
      let isSameAssetDeposit = false;
      expect(await stratX2Getter.isSameAssetDeposit()).to.be.equal(
        isSameAssetDeposit
      );
    });
    it('should return lastEarnBlock', async () => {
      let lastEarnBlock = 0;
      expect(await stratX2Getter.lastEarnBlock()).to.be.equal(lastEarnBlock);
    });
    it('should return farmContractAddress', async () => {
      let farmContractAddress = farmB.diamondAddress;
      expect(await stratX2Getter.farmContractAddress()).to.be.equal(
        farmContractAddress
      );
    });
    it('should return token0Address', async () => {
      let token0Address: String = data.matic.address;
      expect(await stratX2Getter.token0Address()).to.be.equal(token0Address);
    });
    it('should return pid', async () => {
      let pid = 0;
      expect(await stratX2Getter.pid()).to.be.equal(pid);
    });
    it('should return wantAddress', async () => {
      let wantAddress = want.address;
      expect(await stratX2Getter.wantAddress()).to.be.equal(wantAddress);
    });
    it('should return token1Address', async () => {
      let token1Address: String = data.bitcoin.address;
      expect(await stratX2Getter.token1Address()).to.be.equal(token1Address);
    });
    it('should return earnedAddress', async () => {
      let earnedAddress = autoV21.address;
      expect(await stratX2Getter.earnedAddress()).to.be.equal(earnedAddress);
    });
    it('should return uniRouterAddress', async () => {
      let uniRouterAddress = ethers.utils.getAddress(
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
      );
      expect(await stratX2Getter.uniRouterAddress()).to.be.equal(
        uniRouterAddress
      );
    });
    it('should return wbnbAddress', async () => {
      let wbnbAddress = ethers.utils.getAddress(
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
      );
      expect(await stratX2Getter.wbnbAddress()).to.be.equal(wbnbAddress);
    });
    it('should return autoFarmAddress', async () => {
      let autoFarmAddress = farmA.diamondAddress;
      expect(await stratX2Getter.autoFarmAddress()).to.be.equal(
        autoFarmAddress
      );
    });
    it('should return autoAddress', async () => {
      let autoAddress = autoV2.address;
      expect(await stratX2Getter.autoAddress()).to.be.equal(autoAddress);
    });
    it('should return govAddress', async () => {
      let govAddress = owner.address;
      expect(await stratX2Getter.govAddress()).to.be.equal(govAddress);
    });
    it('should return onlyGov', async () => {
      let onlyGov = true;
      expect(await stratX2Getter.onlyGov()).to.be.equal(onlyGov);
    });
    it('should return wantLockedTotal', async () => {
      let wantLockedTotal = 0;
      expect(await stratX2Getter.wantLockedTotal()).to.be.equal(
        wantLockedTotal
      );
    });
    it('should return sharesTotal', async () => {
      let sharesTotal = 0;
      expect(await stratX2Getter.sharesTotal()).to.be.equal(sharesTotal);
    });
    it('should return controllerFee', async () => {
      let controllerFee = 0;
      expect(await stratX2Getter.controllerFee()).to.be.equal(controllerFee);
    });
    it('should return controllerFeeMax', async () => {
      let controllerFeeMax = 10000;
      expect(await stratX2Getter.controllerFeeMax()).to.be.equal(
        controllerFeeMax
      );
    });
    it('should return buyBackRate', async () => {
      let buyBackRate = 0;
      expect(await stratX2Getter.buyBackRate()).to.be.equal(buyBackRate);
    });
    it('should return buyBackRateMax', async () => {
      let buyBackRateMax = 10000;
      expect(await stratX2Getter.buyBackRateMax()).to.be.equal(buyBackRateMax);
    });
    it('should return buyBackRateUL', async () => {
      let buyBackRateUL = 800;
      expect(await stratX2Getter.buyBackRateUL()).to.be.equal(buyBackRateUL);
    });
    it('should return buyBackAddress', async () => {
      let buyBackAddress = ethers.utils.getAddress(
        '0x000000000000000000000000000000000000dead'
      );
      expect(await stratX2Getter.buyBackAddress()).to.be.equal(buyBackAddress);
    });
    it('should return rewardsAddress', async () => {
      let rewardsAddress = data.reward.address;
      expect(await stratX2Getter.rewardsAddress()).to.be.equal(rewardsAddress);
    });
    it('should return entranceFeeFactor', async () => {
      let entranceFeeFactor = 9990;
      expect(await stratX2Getter.entranceFeeFactor()).to.be.equal(
        entranceFeeFactor
      );
    });
    it('should return entranceFeeFactorMax', async () => {
      let entranceFeeFactorMax = 10000;
      expect(await stratX2Getter.entranceFeeFactorMax()).to.be.equal(
        entranceFeeFactorMax
      );
    });
    it('should return withdrawFeeFactorMax', async () => {
      let withdrawFeeFactorMax = 10000;
      expect(await stratX2Getter.withdrawFeeFactorMax()).to.be.equal(
        withdrawFeeFactorMax
      );
    });
    it('should return entranceFeeFactorLL', async () => {
      let entranceFeeFactorLL = 9950;
      expect(await stratX2Getter.entranceFeeFactorLL()).to.be.equal(
        entranceFeeFactorLL
      );
    });
    it('should return slippageFactorUL', async () => {
      let slippageFactorUL = 995;
      expect(await stratX2Getter.slippageFactorUL()).to.be.equal(
        slippageFactorUL
      );
    });
    it('should return withdrawFeeFactorLL', async () => {
      let withdrawFeeFactorLL = 9950;
      expect(await stratX2Getter.withdrawFeeFactorLL()).to.be.equal(
        withdrawFeeFactorLL
      );
    });
    it('should return earnedToAUTOPath', async () => {
      let earnedToAUTOPath = [
        autoV21.address,
        data.bitcoin.address,
        autoV2.address,
      ];
      let output = await stratX2Getter.earnedToAUTOPath();
      for (let i = 0; i < output.length; i++) {
        expect(output[i]).to.equal(earnedToAUTOPath[i]);
      }
    });
    it('should return earnedToToken0Path', async () => {
      let earnedToToken0Path = [autoV21.address, data.matic.address];
      let output = await stratX2Getter.earnedToToken0Path();
      for (let i = 0; i < output.length; i++) {
        expect(output[i]).to.equal(earnedToToken0Path[i]);
      }
    });
    it('should return earnedToToken1Path', async () => {
      let earnedToToken1Path = [autoV21.address, data.bitcoin.address];
      let output = await stratX2Getter.earnedToToken1Path();
      for (let i = 0; i < output.length; i++) {
        expect(output[i]).to.equal(earnedToToken1Path[i]);
      }
    });
    it('should return token0ToEarnedPath', async () => {
      let token0ToEarnedPath = [data.matic.address, autoV21.address];
      let output = await stratX2Getter.token0ToEarnedPath();
      for (let i = 0; i < output.length; i++) {
        expect(output[i]).to.equal(token0ToEarnedPath[i]);
      }
    });
    it('should return token1ToEarnedPath', async () => {
      let token1ToEarnedPath = [data.bitcoin.address, autoV21.address];
      let output = await stratX2Getter.token1ToEarnedPath();
      for (let i = 0; i < output.length; i++) {
        expect(output[i]).to.equal(token1ToEarnedPath[i]);
      }
    });
  });
  describe('StratXFacet Tests', () => {
    it('should return correct pid', async () => {
      stratX2Getter = stratA.stratX2Getter;
      let pid = await stratX2Getter.pid();

      expect(pid).to.equal(0);
    });
    it('should return correct slippage factor', async () => {
      let slippageFactor = await stratX2Getter.slippageFactor();

      expect(slippageFactor).to.equal(950);
    });
    it('should deposit want tokens in diamond StratX', async () => {
      stratX2Facet = stratA.stratX2Facet;

      await (want as ERC20)
        .connect(owner)
        .approve(stratA.diamondAddress, ethers.utils.parseUnits('10', 'ether'));

      await expect(
        stratX2Facet.connect(owner).deposit(ethers.utils.parseEther('10'))
      ).to.changeTokenBalances(
        want,
        [owner.address, stratB.diamondAddress],
        [ethers.utils.parseEther('-10'), ethers.utils.parseEther('10')]
      );
    });
    it('Run earn and autocompound want tokens', async () => {
      stratX2Facet = stratA.stratX2Facet;
      /*
    Increasing blocktime to one year
     */
      const currentBlockTime = await time.latest();
      const one_year = currentBlockTime + 365 * 24 * 60 * 60;
      await time.increaseTo(one_year);

      let want_before: BigNumber = await (want as ERC20).balanceOf(
        stratB.diamondAddress
      );
      await stratX2Facet.connect(owner).earn();
      let want_after: BigNumber = await (want as ERC20).balanceOf(
        stratB.diamondAddress
      );
      expect(want_after.sub(want_before)).to.be.greaterThan(0);
    });
    it('Should convert dust to earn Tokens', async () => {
      let earn_before: BigNumber = await autoV21.balanceOf(
        stratA.diamondAddress
      );
      await stratX2Facet.convertDustToEarned();
      let earn_after: BigNumber = await autoV21.balanceOf(
        stratA.diamondAddress
      );
      expect(earn_after.sub(earn_before)).to.be.greaterThan(0);
    });
  });
  describe('StratX2Setter Tests', () => {
    it('Should set Settings', async () => {
      stratX2Setter = stratA.stratX2Setter;
      await stratX2Setter
        .connect(owner)
        .setSettings(10000, 9975, 250, 500, 500);
      expect(await stratX2Getter.entranceFeeFactor()).to.equal(10000);
      expect(await stratX2Getter.withdrawFeeFactor()).to.equal(9975);
      expect(await stratX2Getter.controllerFee()).to.equal(250);
      expect(await stratX2Getter.buyBackRate()).to.equal(500);
      expect(await stratX2Getter.slippageFactor()).to.equal(500);
    });
    it('should set setGov', async () => {
      stratX2Setter.connect(owner).setGov(owner.address);
      expect(await stratX2Getter.govAddress()).to.equal(owner.address);
    });
    it('should set onlyGov', async () => {
      stratX2Setter.connect(owner).setOnlyGov(true);
      expect(await stratX2Getter.onlyGov()).to.equal(true);
    });
    it('should set setUniRouterAddress', async () => {
      const uniRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
      stratX2Setter.connect(owner).setUniRouterAddress(uniRouterAddress);
      expect(await stratX2Getter.uniRouterAddress()).to.equal(uniRouterAddress);
    });
    it('should set setBuyBackAddress', async () => {
      const BuyBackAddress = '0x000000000000000000000000000000000000dEaD';
      stratX2Setter.connect(owner).setBuyBackAddress(BuyBackAddress);
      expect(await stratX2Getter.buyBackAddress()).to.equal(BuyBackAddress);
    });
    it('should set setRewardsAddress', async () => {
      stratX2Setter.connect(owner).setRewardsAddress(data.reward.address);
      expect(await stratX2Getter.rewardsAddress()).to.equal(
        data.reward.address
      );
    });
    it('should set pause and unpause', async () => {
      await stratX2Setter.connect(owner).pause();
      expect(await stratX2Getter.isPaused()).to.equal(true);
      await stratX2Setter.connect(owner).unpause();
      expect(await stratX2Getter.isPaused()).to.equal(false);
    });
  });
  describe('Negative Test Cases - Strat', () => {
    it('Should throw error when caller is not gov ', async () => {
      let signer: SignerWithAddress[] = await ethers.getSigners();
      let user1: SignerWithAddress = signer[5];
      await expect(
        stratX2Setter.connect(user1).setGov(owner.address)
      ).to.be.revertedWith('!gov');
    });
    it('should revert if entranceFeeFactor too low', async () => {
      await expect(
        stratX2Setter.connect(owner).setSettings(1000, 9975, 250, 500, 500)
      ).to.be.revertedWith('_entranceFeeFactor too low');
    });
    it('should revert if entranceFeeFactor too high', async () => {
      await expect(
        stratX2Setter.connect(owner).setSettings(100000, 9975, 250, 500, 500)
      ).to.be.revertedWith('_entranceFeeFactor too high');
    });
    it('should revert if withdrawFeeFactor too low', async () => {
      await expect(
        stratX2Setter.connect(owner).setSettings(10000, 975, 250, 500, 500)
      ).to.be.revertedWith('_withdrawFeeFactor too low');
    });
    it('should revert if withdrawFeeFactor too high', async () => {
      await expect(
        stratX2Setter.connect(owner).setSettings(10000, 99975, 250, 500, 500)
      ).to.be.revertedWith('_withdrawFeeFactor too high');
    });
    it('should revert if controllerFeeFactor too high', async () => {
      await expect(
        stratX2Setter.connect(owner).setSettings(10000, 9975, 2500, 500, 500)
      ).to.be.revertedWith('_controllerFee too high');
    });
    it('should revert if buybackRate too high', async () => {
      await expect(
        stratX2Setter.connect(owner).setSettings(10000, 9975, 250, 5000, 500)
      ).to.be.revertedWith('_buyBackRate too high');
    });
    it('should revert if slippageFactor too high', async () => {
      await expect(
        stratX2Setter.connect(owner).setSettings(10000, 9975, 250, 500, 50000)
      ).to.be.revertedWith('_slippageFactor too high');
    });
    // it('should throw error when enter two fun', async () => {
    //   let Check = await ethers.getContractFactory('ReentrancyChecker');
    //   let check = await Check.deploy(diamondAddress);
    //   await check.attack();
    //   let tx = await check.attack();
    //   let receipt = await tx.wait();
    //   console.log(
    //     receipt.events?.filter((data) => {
    //       return data.event == 'Response';
    //     })
    //   );
    //   console.log(await stratX2Facet.getnum());
    // });
    it('should revert if withdraw amount is zero', async () => {
      await expect(stratX2Facet.withdraw(0)).to.be.rejectedWith(
        '_wantAmt <= 0'
      );
    });
    it('should throw error when paused', async () => {
      await stratX2Setter.connect(owner).pause();
      await expect(
        stratX2Facet.connect(owner).deposit(ethers.utils.parseEther('1'))
      ).to.be.revertedWith('Pausable: paused');
    });
  });
});
