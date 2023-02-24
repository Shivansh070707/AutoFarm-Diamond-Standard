import { ethers } from 'hardhat';
import {
  Bitcoin,
  ERC20,
  Liquidity,
  Matic,
  Ownable,
  XRP,
  Cardano,
  AUTOv2,
} from '../../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export async function main() {
  let matic: Matic;
  let bitcoin: Bitcoin;
  let ada: Cardano;
  let xrp: XRP;
  let autoV2: AUTOv2;
  let owner: SignerWithAddress;
  let otherAccount: SignerWithAddress;
  let pool: Liquidity;
  let want: Ownable | ERC20;
  let autoV21: AUTOv2;
  let reward: SignerWithAddress;

  [owner, reward, otherAccount] = await ethers.getSigners();

  //Deploying Tokens
  const MATIC = await ethers.getContractFactory('Matic');
  matic = await MATIC.deploy();
  await matic.deployed();

  const BITCOIN = await ethers.getContractFactory('Bitcoin');
  bitcoin = await BITCOIN.deploy();
  await bitcoin.deployed();

  const ADA = await ethers.getContractFactory('Cardano');
  ada = await ADA.deploy();
  await ada.deployed();

  const XRP = await ethers.getContractFactory('XRP');
  xrp = await XRP.deploy();
  await xrp.deployed();

  /* Deploying Auto V2 Ownable
    autoV2 is used as a native token for autofarmA
    autov21 is used as native tokrn for autofarmB
    */

  const AUTOV2 = await ethers.getContractFactory('AUTOv2');
  autoV2 = await AUTOV2.deploy();
  await autoV2.deployed();
  autoV21 = await AUTOV2.deploy();
  await autoV21.deployed();
  /*
    Deploying Lp pool for creating lp-pair
    */
  const LP_POOL = await ethers.getContractFactory('Liquidity');
  pool = await LP_POOL.deploy();
  await pool.deployed();
  /*
    Approving Pool address various tokens 
    */
  await matic.approve(pool.address, ethers.utils.parseEther('100'));
  await bitcoin.approve(pool.address, ethers.utils.parseEther('150'));
  await autoV21.approve(pool.address, ethers.utils.parseEther('100'));
  await ada.approve(pool.address, ethers.utils.parseEther('150'));
  await xrp.approve(pool.address, ethers.utils.parseEther('150'));

  await autoV2.approve(pool.address, ethers.utils.parseEther('100'));
  await autoV21.approve(pool.address, ethers.utils.parseEther('100'));
  /*
    Creating LP-Pair of Various Tokens
    */
  await pool.addLiquidity(
    autoV21.address,
    bitcoin.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );
  await pool.addLiquidity(
    autoV21.address,
    matic.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );
  await pool.addLiquidity(
    matic.address,
    bitcoin.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );

  await pool.addLiquidity(
    bitcoin.address,
    autoV2.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );
  await pool.addLiquidity(
    xrp.address,
    ada.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );
  await pool.addLiquidity(
    matic.address,
    bitcoin.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );
  await pool.addLiquidity(
    bitcoin.address,
    autoV21.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );
  await pool.addLiquidity(
    matic.address,
    xrp.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );
  await pool.addLiquidity(
    xrp.address,
    bitcoin.address,
    ethers.utils.parseUnits('10', 'ether'),
    ethers.utils.parseUnits('15', 'ether')
  );

  // want is lp pair of matic and bitcoin
  const wantaddress = await pool.getPair(matic.address, bitcoin.address);
  want = await ethers.getContractAt('ERC20', wantaddress);

  console.log(`
    matic address = ${matic.address};
    bitcoin address= ${bitcoin.address};
    ada address=${ada.address};
    xrp address =${xrp.address}
    autoV2 address =${autoV2.address},
    autoV21 address =${autoV21.address},
    owner address =${owner.address};
    otherAccount address =${otherAccount.address};
    pool address =${pool.address};
    want address =${want.address};
    reward address =${reward.address};
    `);
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
  };
}
