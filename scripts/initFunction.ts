import { ethers } from 'hardhat';
import { main } from './helpers/token';
import { ERC20, Ownable } from '../typechain-types';
import { deployAutofarmDiamond } from './autofarm.deploy';
import { deployStratDiamond } from './stratx2.deploy';

export async function initializer() {
  let data = await main();
  let matic: Ownable | ERC20 = data.matic;
  let bitcoin: Ownable | ERC20 = data.bitcoin;
  let autoV2: Ownable | ERC20 = data.autoV2;
  let owner = data.owner;
  let want: Ownable | ERC20 = data.want;
  let autoV21: Ownable | ERC20 = data.autoV21;
  let [reward, otherAccount] = await ethers.getSigners();
  let xrp: Ownable | ERC20 = data.xrp;
  let ada: Ownable | ERC20 = data.ada;
  let pool = data.pool;
  let farmA: object = await deployAutofarmDiamond(autoV2.address);
  let farmB: object = await deployAutofarmDiamond(autoV21.address);
  let farmAdiamondAddress: string = farmA.diamondAddress;
  let farmBdiamondAddress: string = farmB.diamondAddress;
  let stratA = await deployStratDiamond([
    [
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      owner.address,
      farmAdiamondAddress,
      autoV2.address,
      want.address,
      matic.address,
      bitcoin.address,
      autoV21.address,
      farmBdiamondAddress,
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      reward.address,
      '0x000000000000000000000000000000000000dEaD',
    ],
    0,
    false,
    false,
    true,
    [autoV21.address, bitcoin.address, autoV2.address],
    [autoV21.address, matic.address],
    [autoV21.address, bitcoin.address],
    [matic.address, autoV21.address],
    [bitcoin.address, autoV21.address],
    [70, 150, 9990, 10000],
  ]);
  let stratB = await deployStratDiamond([
    [
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      owner.address,
      farmBdiamondAddress,
      xrp.address,
      want.address,
      matic.address,
      bitcoin.address,
      xrp.address,
      farmAdiamondAddress,
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      reward.address,
      '0x000000000000000000000000000000000000dEaD',
    ],
    0,
    false,
    false,
    false,
    [xrp.address, bitcoin.address, autoV21.address],
    [xrp.address, matic.address],
    [xrp.address, bitcoin.address],
    [matic.address, xrp.address],
    [bitcoin.address, xrp.address],
    [70, 150, 9990, 10000],
  ]);
  return {
    matic,
    bitcoin,
    ada,
    xrp,
    autoV2,
    autoV21,
    owner,
    otherAccount,
    pool,
    want,
    reward,
    farmA,
    farmB,
    stratA,
    stratB,
  };
}
