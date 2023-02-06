import { ethers, network } from 'hardhat';
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

  const address = '0xF977814e90dA44bFA03b6295A0616a897441aceC';
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  });

  owner = await ethers.getSigner(address);

  [reward, otherAccount] = await ethers.getSigners();

  //Deploying Tokens
  const MATIC = await ethers.getContractFactory('Matic');
  matic = await MATIC.connect(owner).deploy();

  const BITCOIN = await ethers.getContractFactory('Bitcoin');
  bitcoin = await BITCOIN.connect(owner).deploy();

  const ADA = await ethers.getContractFactory('Cardano');
  ada = await ADA.connect(owner).deploy();

  const XRP = await ethers.getContractFactory('XRP');
  xrp = await XRP.connect(owner).deploy();

  /* Deploying Auto V2 Ownable
    autoV2 is used as a native token for autofarmA
    autov21 is used as native tokrn for autofarmB
    */

  const AUTOV2 = await ethers.getContractFactory('AUTOv2');
  autoV2 = await AUTOV2.connect(owner).deploy();
  autoV21 = await AUTOV2.connect(owner).deploy();
  /*
    Deploying Lp pool for creating lp-pair
    */
  const LP_POOL = await ethers.getContractFactory('Liquidity');
  pool = await LP_POOL.connect(owner).deploy();
  /*
    Approving Pool address various tokens 
    */
  await (matic as ERC20)
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  await (bitcoin as ERC20)
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('150'));
  await (autoV21 as ERC20)
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  await (ada as ERC20)
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('150'));
  await (xrp as ERC20)
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('150'));

  await (autoV2 as ERC20)
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  await (autoV21 as ERC20)
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  /*
    Creating LP-Pair of Various Tokens
    */
  await pool
    .connect(owner)
    .addLiquidity(
      autoV21.address,
      bitcoin.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      autoV21.address,
      matic.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      matic.address,
      bitcoin.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );

  await pool
    .connect(owner)
    .addLiquidity(
      bitcoin.address,
      autoV2.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      xrp.address,
      ada.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      matic.address,
      bitcoin.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      bitcoin.address,
      autoV21.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      matic.address,
      xrp.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
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
