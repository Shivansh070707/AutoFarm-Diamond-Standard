// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from 'hardhat';
import { getSelectorsFromContract, FacetCutAction } from './libraries';
import { storeContract } from './storeContract';
import {
  Diamond,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  OwnershipFacet,
  StratX2Facet,
  StratX2GetterFacet,
  StratX2SetterFacet,
} from '../typechain-types';

export async function deployStratDiamond(
  args: any,
  name: string,
  owner: string
) {
  let diamondAddress: string;
  let diamondCutFacet: DiamondCutFacet;
  let diamondLoupeFacet: DiamondLoupeFacet;
  let OwnershipFacet: OwnershipFacet;

  console.log('**** Deploying Strat diamond ...');

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();

  await storeContract(
    diamondCutFacet.address,
    JSON.parse(String(diamondCutFacet.interface.format('json'))),
    name,
    'DiamondCutFacet'
  );

  console.log('DiamondCutFacet deployed at: ', diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond');
  const diamond: Diamond = await Diamond.deploy(owner, diamondCutFacet.address);
  await diamond.deployed();
  diamondAddress = diamond.address;

  await storeContract(
    diamond.address,
    JSON.parse(String(diamond.interface.format('json'))),
    name,
    'Diamond'
  );

  console.log('Diamond deployed at: ', diamond.address);

  // deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory('DiamondInit');
  const diamondInit: DiamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();

  await storeContract(
    diamondInit.address,
    JSON.parse(String(diamondInit.interface.format('json'))),
    name,
    'DiamondInit'
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
      abi: JSON.parse(String(facet.interface.format('json'))),
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

  const tx = await diamondCut.diamondCut(
    cut,
    diamondInit.address,
    diamondInitFunctionCall
  );

  // console.log("Diamond cut tx: ", tx.hash);
  const receipt = await tx.wait();
  // console.log("returned status: ", receipt);
  if (!receipt.status) throw Error(`Diamond upgrade failed: ${tx.hash}`);

  let DiamondLoupeFacetData = {
    fileData: fileData[0],
  };
  await storeContract(
    DiamondLoupeFacetData.fileData.address,
    DiamondLoupeFacetData.fileData.abi,
    name,
    'DiamondLoupeFacet'
  );
  let OwnershipFacetData = {
    fileData: fileData[1],
  };
  await storeContract(
    OwnershipFacetData.fileData.address,
    OwnershipFacetData.fileData.abi,
    name,
    'OwnershipFacet'
  );

  let StratX2SetterData = {
    fileData: fileData[2],
  };
  await storeContract(
    StratX2SetterData.fileData.address,
    StratX2SetterData.fileData.abi,
    name,
    'StratX2Setter'
  );

  let StratX2FacetData = {
    fileData: fileData[3],
  };
  await storeContract(
    StratX2FacetData.fileData.address,
    StratX2FacetData.fileData.abi,
    name,
    'StratX2Facet'
  );

  let StratX2GetterData = {
    fileData: fileData[4],
  };
  await storeContract(
    StratX2GetterData.fileData.address,
    StratX2GetterData.fileData.abi,
    name,
    'StratX2GetterFacet'
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

  let stratX2Facet: StratX2Facet = await ethers.getContractAt(
    'StratX2Facet',
    diamondAddress
  );
  let stratX2Setter: StratX2SetterFacet = await ethers.getContractAt(
    'StratX2SetterFacet',
    diamondAddress
  );
  let stratX2Getter: StratX2GetterFacet = await ethers.getContractAt(
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
