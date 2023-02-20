import {
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  OwnershipFacet,
  StratX2Facet,
  StratX2GetterFacet,
  StratX2SetterFacet,
} from '../../typechain-types';

export interface Strat {
  diamondAddress: string;
  diamondInit: DiamondInit;
  stratX2Getter: StratX2GetterFacet;
  stratX2Facet: StratX2Facet;
  stratX2Setter: StratX2SetterFacet;
  diamondCutFacet: DiamondCutFacet;
  diamondLoupeFacet: DiamondLoupeFacet;
  OwnershipFacet: OwnershipFacet;
}
