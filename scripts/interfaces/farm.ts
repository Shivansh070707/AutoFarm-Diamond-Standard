import {
  AutoFarmFacet,
  AutoFarmV2GetterFacet,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  OwnershipFacet,
} from '../../typechain-types';

export interface Farm {
  diamondAddress: string;
  diamondInit: DiamondInit;
  diamondCutFacet: DiamondCutFacet;
  autoFarmV2GetterFacet: AutoFarmV2GetterFacet;
  autoFarmFacet: AutoFarmFacet;
  OwnershipFacet: OwnershipFacet;
  diamondLoupeFacet: DiamondLoupeFacet;
}
