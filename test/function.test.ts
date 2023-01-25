import { expect } from 'chai';
import { ethers } from 'hardhat';
import { initializer } from '../scripts/initFunction';
import {
  AutoFarmFacet,
  AutoFarmV2GetterFacet,
  ERC20,
  IERC20,
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

describe('Test', () => {
  let stratX2Facet: StratX2Facet;
  let stratX2Setter: StratX2SetterFacet;
  let stratX2Getter: StratX2GetterFacet;
  let autoFarmFacet: AutoFarmFacet;
  let autoFarmGetter: AutoFarmV2GetterFacet;
  let farmA: Farm;
  let farmB: Farm;
  let owner: SignerWithAddress;
  let stratB: Strat;
  let stratA: Strat;
  let want: Ownable | IERC20;
  let autoV2: IERC20 | Ownable;
  let autoV21: IERC20 | Ownable;
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
      await (autoV2 as Ownable)
        .connect(owner)
        .transferOwnership(farmA.diamondAddress);
      await (autoV21 as Ownable)
        .connect(owner)
        .transferOwnership(farmB.diamondAddress);
      expect(await (autoV2 as Ownable).owner()).to.equal(farmA.diamondAddress);
      expect(await (autoV21 as Ownable).owner()).to.equal(farmB.diamondAddress);
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
        .add(1, want.address, false, stratB.diamondAddress);
      expect(await autoFarmFacet.poolLength()).to.equal(1);
    });
    it('Should deposit want tokens in farmA and want tokens will be stored in FarmB', async () => {
      //Approving want tokens to Farm address
      await (want as ERC20)
        .connect(owner)
        .approve(farmA.diamondAddress, ethers.utils.parseUnits('10', 'ether'));

      autoFarmFacet = farmA.autoFarmFacet;

      //depositing want tokens
      await expect(
        autoFarmFacet.connect(owner).deposit(0, ethers.utils.parseEther('10'))
      ).to.changeTokenBalances(
        want,
        [owner.address, stratB.diamondAddress],
        [ethers.utils.parseEther('-10'), ethers.utils.parseEther('10')]
      );
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
      let earn_balance_before: BigNumber = await (autoV21 as ERC20).balanceOf(
        owner.address
      );

      await autoFarmFacet
        .connect(owner)
        .withdraw(0, ethers.utils.parseUnits('1', 'ether'));
      let earn_balance_after: BigNumber = await (autoV21 as ERC20).balanceOf(
        owner.address
      );

      expect(earn_balance_after.sub(earn_balance_before)).to.be.greaterThan(0);
    });
  });
  describe('AutoFarm Getter Test', () => {
    it('should return autov2 address', async () => {
      autoFarmGetter = farmA.autoFarmV2GetterFacet;
      expect(await autoFarmGetter.autoV2()).to.equal(autoV2.address);
    });
  });
  describe('StratXFacet', () => {
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
      console.log(await (want as ERC20).balanceOf(owner.address));
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
      let earn_before: BigNumber = await (autoV21 as ERC20).balanceOf(
        stratA.diamondAddress
      );
      await stratX2Facet.convertDustToEarned();
      let earn_after: BigNumber = await (autoV21 as ERC20).balanceOf(
        stratA.diamondAddress
      );
      expect(earn_after.sub(earn_before)).to.be.greaterThan(0);
    });
  });
  describe('stratX2Setter', () => {
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
  });
  describe('Errors', () => {
    it('Should throw error when caller is not gov ', async () => {
      await expect(stratX2Setter.setGov(owner.address)).to.be.revertedWith(
        '!gov'
      );
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
    it('should throw error when paused', async () => {
      await stratX2Setter.connect(owner).pause();
      expect(
        stratX2Facet.connect(owner).deposit(ethers.utils.parseEther('1'))
      ).to.be.revertedWith('Pausable: paused');
    });
  });
});
