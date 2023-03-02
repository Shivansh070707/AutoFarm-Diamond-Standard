import { ethers } from 'hardhat';
import { main } from './helpers/token';
import {
  AUTOv2,
  Bitcoin,
  Cardano,
  ERC20,
  Liquidity,
  Matic,
  Ownable,
  XRP,
} from '../typechain-types';
import { deployAutofarmDiamond } from './autofarm';
import { deployStratDiamond } from './stratx2';
import { Farm } from './interfaces/farm';
import { Strat } from './interfaces/strat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export async function initializer() {
  let data = await main();
  let matic: Matic = data.matic;
  let bitcoin: Bitcoin = data.bitcoin;
  let autoV2: AUTOv2 = data.autoV2;
  let owner: SignerWithAddress = data.owner;
  let want: Ownable | ERC20 = data.want;
  let autoV21: AUTOv2 = data.autoV21;
  let [reward, otherAccount]: SignerWithAddress[] = await ethers.getSigners();
  let xrp: XRP = data.xrp;
  let ada: Cardano = data.ada;
  let pool: Liquidity = data.pool;
  let farmA: Farm = await deployAutofarmDiamond(
    autoV2.address,
    'farmA',
    owner.address
  );
  let farmB: Farm = await deployAutofarmDiamond(
    autoV21.address,
    'farmB',
    owner.address
  );
  let wbnbAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
  const uniRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const burnAddress = '0x000000000000000000000000000000000000dEaD';
  const stratA: Strat = await deployStratDiamond(
    [
      [
        wbnbAddress,
        owner.address,
        farmA.diamondAddress,
        autoV2.address,
        want.address,
        matic.address,
        bitcoin.address,
        autoV21.address,
        farmB.diamondAddress,
        uniRouterAddress,
        reward.address,
        burnAddress,
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
    ],
    'stratA',
    owner.address
  );
  let stratB: Strat = await deployStratDiamond(
    [
      [
        wbnbAddress,
        owner.address,
        farmB.diamondAddress,
        xrp.address,
        want.address,
        matic.address,
        bitcoin.address,
        xrp.address,
        farmA.diamondAddress,
        uniRouterAddress,
        reward.address,
        burnAddress,
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
    ],
    'stratB',
    owner.address
  );
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
