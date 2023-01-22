// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from 'hardhat';
import { getSelectorsFromContract, FacetCutAction } from './libraries';
import { main } from './helpers/token';
import { Contract } from 'ethers';
import { deployAutofarmDiamond } from './autofarm.deploy';
import { DiamondCutFacet, DiamondLoupeFacet, IERC20 } from '../typechain-types';
import * as fs from 'fs';

// if (!fs.existsSync('Build')) {
//   fs.mkdir('Build', (err) => {
//     console.log('File created');
//   });

fs.mkdir('Build', (err) => {
  console.log('File created');
});
// }

export async function deployStratDiamond(args) {
  let diamondAddress;

  let diamondCutFacet: Contract | DiamondCutFacet;
  let diamondLoupeFacet: Contract | DiamondLoupeFacet;

  let OwnershipFacet: Contract;
  const address = '0xF977814e90dA44bFA03b6295A0616a897441aceC';
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  });
  const owner = await ethers.getSigner(address);

  console.log('**** Deploying Strat diamond ...');

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();

  let diamondCutFacetData = {
    address: diamondCutFacet.address,
    network: {
      name: diamondCutFacet.provider._network.name,
      chainId: diamondCutFacet.provider.network.chainId,
    },
    abi: JSON.parse(diamondCutFacet.interface.format('json')),
  };
  fs.writeFileSync(
    'Build/DiamondCutFacet.json',
    JSON.stringify(diamondCutFacetData, null, 2)
  );

  console.log('DiamondCutFacet deployed at: ', diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond');
  const diamond = await Diamond.deploy(owner.address, diamondCutFacet.address);
  await diamond.deployed();
  diamondAddress = diamond.address;

  let diamondFacetData = {
    address: diamond.address,
    network: {
      name: diamond.provider._network.name,
      chainId: diamond.provider.network.chainId,
    },
    abi: JSON.parse(diamond.interface.format('json')),
  };
  fs.writeFileSync(
    'Build/Diamond.json',
    JSON.stringify(diamondFacetData, null, 2)
  );

  console.log('Diamond deployed at: ', diamond.address);

  // deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory('DiamondInit');
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();

  let diamondInitFacetData = {
    address: diamondInit.address,
    network: {
      name: diamondInit.provider._network.name,
      chainId: diamondInit.provider.network.chainId,
    },
    abi: JSON.parse(diamondInit.interface.format('json')),
  };
  fs.writeFileSync(
    'Build/DiamondInit.json',
    JSON.stringify(diamondInitFacetData, null, 2)
  );
  console.log('DiamondInit deployed at: ', diamondInit.address);
  // deploy facets
  // console.log("Deploying facets");
  const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'StratX2SetterFacet',
    'StratX2Facet',
    'StratX2GetterFacet',
  ];
  const cut = [];
  let fileData = [];
  for (const facetName of FacetNames) {
    const Facet = await ethers.getContractFactory(facetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    fileData.push({
      address: facet.address,
      network: {
        name: facet.provider._network.name,
        chainId: facet.provider.network.chainId,
      },
      abi: JSON.parse(facet.interface.format('json')),
    });

    console.log(`${facetName} deployed at ${facet.address}`);

    const selectors = getSelectorsFromContract(facet);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: selectors.getSelectors(),
    });
  }

  //console.log('Diamond Cut: ', cut);
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address);
  const diamondInitFunctionCall = diamondInit.interface.encodeFunctionData(
    'stratx2Init',
    args
  );

  const tx = await diamondCut
    .connect(owner)
    .diamondCut(cut, diamondInit.address, diamondInitFunctionCall);

  // console.log("Diamond cut tx: ", tx.hash);
  const receipt = await tx.wait();
  // console.log("returned status: ", receipt);
  if (!receipt.status) throw Error(`Diamond upgrade failed: ${tx.hash}`);

  let DiamondLoupeFacetData = {
    fileData: fileData[0],
  };
  fs.writeFileSync(
    'Build/DiamondLoupeFacet.json',
    JSON.stringify(DiamondLoupeFacetData, null, 2)
  );

  let StratX2SetterData = {
    fileData: fileData[2],
  };
  fs.writeFileSync(
    'Build/StratX2Setter.json',
    JSON.stringify(StratX2SetterData, null, 2)
  );
  let StratX2FacetData = {
    fileData: fileData[3],
  };
  fs.writeFileSync(
    'Build/StratX2Facet.json',
    JSON.stringify(StratX2FacetData, null, 2)
  );

  let StratX2GetterData = {
    fileData: fileData[4],
  };
  fs.writeFileSync(
    'Build/StratX2GetterFacet.json',
    JSON.stringify(StratX2GetterData, null, 2)
  );

  console.log('**** Diamond deploy end');

  diamondCutFacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamondAddress
  );

  diamondLoupeFacet = await ethers.getContractAt(
    'DiamondLoupeFacet',
    diamondAddress
  );
  OwnershipFacet = await ethers.getContractAt('OwnershipFacet', diamondAddress);

  let stratX2Facet = await ethers.getContractAt('StratX2Facet', diamondAddress);
  let stratX2Setter = await ethers.getContractAt(
    'StratX2SetterFacet',
    diamondAddress
  );
  let stratX2Getter = await ethers.getContractAt(
    'StratX2GetterFacet',
    diamondAddress
  );
  return {
    diamondAddress,
    diamondInit,
    stratX2Getter,
    stratX2Facet,
    stratX2Setter,
    diamondCutFacet,
    diamondLoupeFacet,
    OwnershipFacet,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// if (require.main === module) {
//   deployDiamond()
//     .then(() => console.log('deployment success'))
//     .catch((error) => {
//       console.error(error);
//     });
// }
