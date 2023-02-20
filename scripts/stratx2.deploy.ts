import { deployStratDiamond } from './stratx2';
import { ethers } from 'hardhat';

//Replace the parameters with required args
let wbnbAddress: string = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
let govAddress: string = '0xF977814e90dA44bFA03b6295A0616a897441aceC';
let autoFarmAddress: string = '0x631e7d43d1718b7E01b570ef6DbaB34d9049Acf2';
let AUTOAddress: string = '0x8Fde1BeCfaf972Ee02F28cA3bb58ff3bF27521c1';
let wantAddress: string = '0xaD7ddB448159e715A6C1168617705458AdABe4cf';
let token0Address: string = '0x1F5D876bf2fED760b13fd5F91e47a65E026DE977';
let token1Address: string = '0xDbA8DeFa731D0F95f3515D2E26B6d3C2d38705F2';
let earnedAddress: string = '0x8Fde1BeCfaf972Ee02F28cA3bb58ff3bF27521c1';
let farmContractAddress: string = '0x841e5a4E3c8748EFdAae4eb5B96E80B3012AF26e';
let pid: Number = 1;
let isCAKEStaking: Boolean = false;
let isSameAssetDeposit: Boolean = true;
let isAutoComp: Boolean = true;
let uniRouterAddress: string = '0xbc367b25f6f512AF177Be166392370ff32284068';
let earnedToAUTOPath: string[] = ['0xbc367b25f6f512AF177Be166392370ff32284068'];
let earnedToToken0Path: string[] = [
  '0xbc367b25f6f512AF177Be166392370ff32284068',
];
let earnedToToken1Path: string[] = [
  '0xbc367b25f6f512AF177Be166392370ff32284068',
];
let token0ToEarnedPath: string[] = [
  '0xbc367b25f6f512AF177Be166392370ff32284068',
];
let token1ToEarnedPath: string[] = [
  '0xbc367b25f6f512AF177Be166392370ff32284068',
];
let controllerFee: Number = 1;
let rewardsAddress: string = '0xbc367b25f6f512AF177Be166392370ff32284068';
let buyBackRate: Number = 1;
let buyBackAddress: string = '0x841e5a4e3c8748efdaae4eb5b96e80b3012af26e';
let entranceFeeFactor: Number = 1;
let withdrawFeeFactor: Number = 1;
let strat_name: string = 'StratA';

async function main() {
  let [Owner] = await ethers.getSigners();
  let owner: string = Owner.address;
  /*
    -Replace line no 42{ Owner.address } by the address of which contract are deploying .
    -Owner address must be equal to the address of which contracts are deploying.
    -Comment line 41 by typing '//' at the beginning of line 9
    -Address will be in string "<Owner address>"

  */
  let param = [
    [
      wbnbAddress,
      govAddress,
      autoFarmAddress,
      AUTOAddress,
      wantAddress,
      token0Address,
      token1Address,
      earnedAddress,
      farmContractAddress,
      uniRouterAddress,
      rewardsAddress,
      buyBackAddress,
    ],
    pid,
    isCAKEStaking,
    isSameAssetDeposit,
    isAutoComp,
    earnedToAUTOPath,
    earnedToToken0Path,
    earnedToToken1Path,
    token0ToEarnedPath,
    token1ToEarnedPath,
    [controllerFee, buyBackRate, entranceFeeFactor, withdrawFeeFactor],
  ];
  await deployStratDiamond(param, strat_name, owner);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
