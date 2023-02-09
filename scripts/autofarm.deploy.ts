// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from 'hardhat';
import { getSelectorsFromContract, FacetCutAction } from './libraries';
import * as fs from 'fs';
import {
  AutoFarmFacet,
  AutoFarmV2GetterFacet,
  Diamond,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  OwnershipFacet,
} from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
const CHAIN = process.env.CHAIN;
const ENV = process.env.ENV;

export async function deployAutofarmDiamond(args: any, name: string) {
  if (!Boolean(CHAIN) || !Boolean(ENV)) {
    console.log(
      `First set the "CHAIN" and "ENV" variables in .env file at the root folder`
    );
    process.exit(1);
  }

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
  fs.mkdir(`./build/${CHAIN}/${ENV}/${name}`, { recursive: true }, (err) => {
    if (err) console.error(err);
  });
  fs.writeFileSync(
    `./build/${CHAIN}/${ENV}/${name}/DiamondCutFacet.json`,
    JSON.stringify(diamondCutFacetData, null, 2),
    (err) => {
      if (err) console.error(err);
    }
  );

  console.log('DiamondCutFacet deployed at: ', diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond');
  const diamond: Diamond = await Diamond.connect(owner).deploy(
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

  fs.mkdir(`./build/${CHAIN}/${ENV}/${name}`, { recursive: true }, (err) => {
    if (err) console.error(err);
  });
  fs.writeFileSync(
    `./build/${CHAIN}/${ENV}/${name}/Diamond.json`,
    JSON.stringify(diamondFacetData, null, 2),
    (err) => {
      if (err) console.error(err);
    }
  );

  console.log('Diamond deployed at: ', diamond.address);

  // deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory('DiamondInit');
  const diamondInit: DiamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();

  let diamondInitFacetData = {
    address: diamondInit.address,
    network: {
      name: (await diamondInit.provider.getNetwork()).name,
      chainId: (await diamondInit.provider.getNetwork()).chainId,
    },
    abi: JSON.parse(String(diamondInit.interface.format('json'))),
  };
  fs.mkdir(`./build/${CHAIN}/${ENV}/${name}`, { recursive: true }, (err) => {
    if (err) console.error(err);
  });
  fs.writeFileSync(
    `./build/${CHAIN}/${ENV}/${name}/DiamondInit.json`,
    JSON.stringify(diamondInitFacetData, null, 2),
    (err) => {
      if (err) console.error(err);
    }
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
  const diamondCut: DiamondCutFacet = await ethers.getContractAt(
    'IDiamondCut',
    diamond.address
  );
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
  fs.mkdir(`./build/${CHAIN}/${ENV}/${name}`, { recursive: true }, (err) => {
    if (err) console.error(err);
  });
  fs.writeFileSync(
    `./build/${CHAIN}/${ENV}/${name}/DiamondLoupeFacet.json`,
    JSON.stringify(DiamondLoupeFacetData, null, 2),
    (err) => {
      if (err) console.error(err);
    }
  );
  let AutoFarmFacetData = {
    fileData: fileData[2],
  };
  fs.mkdir(`./build/${CHAIN}/${ENV}/${name}`, { recursive: true }, (err) => {
    if (err) console.error(err);
  });
  fs.writeFileSync(
    `./build/${CHAIN}/${ENV}/${name}/AutoFarmFacet.json`,
    JSON.stringify(AutoFarmFacetData, null, 2),
    (err) => {
      if (err) console.error(err);
    }
  );

  let AutoFarmV2GetterFacetData = {
    fileData: fileData[3],
  };
  fs.mkdir(`./build/${CHAIN}/${ENV}/${name}`, { recursive: true }, (err) => {
    if (err) console.error(err);
  });
  fs.writeFileSync(
    `./build/${CHAIN}/${ENV}/${name}/AutoFarmV2GetterFacet.json`,
    JSON.stringify(AutoFarmV2GetterFacetData, null, 2),
    (err) => {
      if (err) console.error(err);
    }
  );

  console.log('**** Autofarm Diamond deploy end');

  diamondCutFacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamondAddress
  );

  let diamondLoupeFacet: DiamondLoupeFacet = await ethers.getContractAt(
    'DiamondLoupeFacet',
    diamondAddress
  );
  let OwnershipFacet: OwnershipFacet = await ethers.getContractAt(
    'OwnershipFacet',
    diamondAddress
  );

  let autoFarmFacet: AutoFarmFacet = await ethers.getContractAt(
    'AutoFarmFacet',
    diamondAddress
  );
  let autoFarmV2GetterFacet: AutoFarmV2GetterFacet = await ethers.getContractAt(
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
