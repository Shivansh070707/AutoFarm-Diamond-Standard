// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from 'hardhat';
import { getSelectorsFromContract, FacetCutAction } from './libraries';
import * as fs from 'fs';
import { Contract } from 'ethers';
import { DiamondCutFacet } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

fs.mkdir('Build', (err) => {
  console.log('File created');
});

export async function deployAutofarmDiamond(args: any) {
  const address = '0xF977814e90dA44bFA03b6295A0616a897441aceC';
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  });
  const owner: SignerWithAddress = await ethers.getSigner(address);
  console.log('**** Deploying AutoFarm diamond ...');
  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  let diamondCutFacet: DiamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();

  let diamondCutFacetData = {
    address: diamondCutFacet.address,
    network: {
      name: (await diamondCutFacet.provider.getNetwork()).name,
      chainId: (await diamondCutFacet.provider.getNetwork()).chainId,
    },
    abi: JSON.parse(String(diamondCutFacet.interface.format('json'))),
  };
  fs.writeFileSync(
    'Build/DiamondCutFacet.json',
    JSON.stringify(diamondCutFacetData, null, 2)
  );

  console.log('DiamondCutFacet deployed at: ', diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond');
  const diamond = await Diamond.connect(owner).deploy(
    owner.address,
    diamondCutFacet.address
  );
  await diamond.deployed();

  let diamondAddress: string = diamond.address.toString();

  let diamondFacetData = {
    address: diamond.address,
    network: {
      name: (await diamond.provider.getNetwork()).name,
      chainId: (await diamond.provider.getNetwork()).chainId,
    },
    abi: JSON.parse(String(diamond.interface.format('json'))),
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
      name: (await diamondInit.provider.getNetwork()).name,
      chainId: (await diamondInit.provider.getNetwork()).chainId,
    },
    abi: JSON.parse(String(diamondInit.interface.format('json'))),
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
    'AutoFarmFacet',
    'AutoFarmV2GetterFacet',
  ];
  const cut = [];
  let fileData = [];
  for (const facetName of FacetNames) {
    const Facet = await ethers.getContractFactory(facetName);
    const facet = await Facet.connect(owner).deploy();
    await facet.connect(owner).deployed();
    fileData.push({
      address: facet.address,
      network: {
        name: (await facet.provider.getNetwork()).name,
        chainId: (await facet.provider.getNetwork()).chainId,
      },
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
    'autofarmInit',
    [args]
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

  let AutoFarmFacetData = {
    fileData: fileData[2],
  };
  fs.writeFileSync(
    'Build/AutoFarmFacet.json',
    JSON.stringify(AutoFarmFacetData, null, 2)
  );
  let AutoFarmV2GetterFacetData = {
    fileData: fileData[3],
  };
  fs.writeFileSync(
    'Build/AutoFarmV2GetterFacet.json',
    JSON.stringify(AutoFarmV2GetterFacetData, null, 2)
  );

  console.log('**** Autofarm Diamond deploy end');

  diamondCutFacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamondAddress
  );

  let diamondLoupeFacet = await ethers.getContractAt(
    'DiamondLoupeFacet',
    diamondAddress
  );
  let OwnershipFacet = await ethers.getContractAt(
    'OwnershipFacet',
    diamondAddress
  );

  let autoFarmFacet = await ethers.getContractAt(
    'AutoFarmFacet',
    diamondAddress
  );
  let autoFarmV2GetterFacet = await ethers.getContractAt(
    'AutoFarmV2GetterFacet',
    diamondAddress
  );

  return {
    diamondAddress,
    diamondInit,
    diamondCutFacet,
    autoFarmV2GetterFacet,
    autoFarmFacet,
    OwnershipFacet,
    diamondLoupeFacet,
  };
}
