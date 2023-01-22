import { assert } from 'chai';
import { Contract } from 'ethers';
import { initializer } from '../scripts/initFunction';
import { FacetCutAction, getSelectorsFromContract } from '../scripts/libraries';
import { DiamondCutFacet, DiamondLoupeFacet, IERC20 } from '../typechain-types';

describe('Test', () => {
  let diamondCutFacet: Contract | DiamondCutFacet;
  let diamondLoupeFacet: Contract | DiamondLoupeFacet;
  let stratX2Facet;
  let stratX2Setter: Contract;
  let stratX2Getter: Contract;
  let autoFarmFacet;
  let autoFarmGetter;
  let OwnershipFacet: Contract;
  let farmA;
  let farmB;
  let owner: any;
  let stratB: object;
  let stratA: any;
  let want: Contract | IERC20;
  let autoV21: Contract | IERC20;
  let data;
  let facetAddresses: string[]; // DiamondCutFacet, DiamondLoupeFacet, StratX2Facet

  before(async () => {
    data = await initializer();
    farmA = data.farmA;
    farmB = data.farmB;
    stratA = data.stratA;
    stratB = data.stratB;
    want = data.want;
    autoV21 = data.autoV21;
    owner = data.owner;
  });

  describe('test - diamond', () => {
    describe('farmA', () => {
      it('should have 4 facets -- call to facetAddresses', async () => {
        facetAddresses = await farmA.diamondLoupeFacet.facetAddresses();
        assert(facetAddresses.length === 4);
      });

      it('should have the right function selectors -- call to faceFunctionSelectors', async () => {
        let selectors, result;
        diamondCutFacet = farmA.diamondCutFacet;
        diamondLoupeFacet = farmA.diamondLoupeFacet;
        autoFarmFacet = farmA.autoFarmFacet;
        autoFarmGetter = farmA.autoFarmV2GetterFacet;

        // test for DiamondCutFacet
        selectors = getSelectorsFromContract(diamondCutFacet).getSelectors();
        result = await diamondLoupeFacet.facetFunctionSelectors(
          facetAddresses[0]
        );
        assert.sameMembers(result, selectors);

        // test for DiamondLoupeFacet
        selectors = getSelectorsFromContract(diamondLoupeFacet).getSelectors();
        result = await diamondLoupeFacet.facetFunctionSelectors(
          facetAddresses[1]
        );
        assert.sameMembers(result, selectors);

        // test for autoFarmFacet
        selectors = getSelectorsFromContract(autoFarmFacet).getSelectors();
        result = await diamondLoupeFacet.facetFunctionSelectors(
          facetAddresses[2]
        );
        assert.sameMembers(result, selectors);

        // test for autoFarmGetter
        selectors = getSelectorsFromContract(autoFarmGetter).getSelectors();
        result = await diamondLoupeFacet.facetFunctionSelectors(
          facetAddresses[3]
        );
        assert.sameMembers(result, selectors);
      });
      describe('farmB', () => {
        it('should have 4 facets -- call to facetAddresses', async () => {
          facetAddresses = await farmB.diamondLoupeFacet.facetAddresses();
          assert(facetAddresses.length === 4);
        });

        it('should have the right function selectors -- call to faceFunctionSelectors', async () => {
          let selectors, result;
          diamondCutFacet = farmB.diamondCutFacet;
          diamondLoupeFacet = farmB.diamondLoupeFacet;
          autoFarmFacet = farmB.autoFarmFacet;
          autoFarmGetter = farmB.autoFarmV2GetterFacet;

          // test for DiamondCutFacet
          selectors = getSelectorsFromContract(diamondCutFacet).getSelectors();
          result = await diamondLoupeFacet.facetFunctionSelectors(
            facetAddresses[0]
          );
          assert.sameMembers(result, selectors);

          // test for DiamondLoupeFacet
          selectors =
            getSelectorsFromContract(diamondLoupeFacet).getSelectors();
          result = await diamondLoupeFacet.facetFunctionSelectors(
            facetAddresses[1]
          );
          assert.sameMembers(result, selectors);

          // test for autoFarmFacet
          selectors = getSelectorsFromContract(autoFarmFacet).getSelectors();
          result = await diamondLoupeFacet.facetFunctionSelectors(
            facetAddresses[2]
          );
          assert.sameMembers(result, selectors);

          // test for autoFarmGetter
          selectors = getSelectorsFromContract(autoFarmGetter).getSelectors();
          result = await diamondLoupeFacet.facetFunctionSelectors(
            facetAddresses[3]
          );
          assert.sameMembers(result, selectors);
        });
        describe('stratA', () => {
          it('should have 6 facets -- call to facetAddresses', async () => {
            facetAddresses = await stratA.diamondLoupeFacet.facetAddresses();
            assert(facetAddresses.length === 6);
          });

          it('should have the right function selectors -- call to faceFunctionSelectors', async () => {
            let selectors, result;
            diamondCutFacet = stratA.diamondCutFacet;
            diamondLoupeFacet = stratA.diamondLoupeFacet;
            OwnershipFacet = stratA.OwnershipFacet;
            stratX2Facet = stratA.stratX2Facet;
            stratX2Setter = stratA.stratX2Setter;
            stratX2Getter = stratA.stratX2Getter;

            // test for DiamondCutFacet
            selectors =
              getSelectorsFromContract(diamondCutFacet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[0]
            );
            assert.sameMembers(result, selectors);

            // test for DiamondLoupeFacet
            selectors =
              getSelectorsFromContract(diamondLoupeFacet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[1]
            );
            assert.sameMembers(result, selectors);

            // test for Ownershipfacet
            selectors = getSelectorsFromContract(OwnershipFacet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[2]
            );

            // test for stratX2Setter
            selectors = getSelectorsFromContract(stratX2Setter).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[3]
            );
            assert.sameMembers(result, selectors);

            // test for stratX2Facet
            selectors = getSelectorsFromContract(stratX2Facet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[4]
            );
            assert.sameMembers(result, selectors);

            // test for stratX2Getter
            selectors = getSelectorsFromContract(stratX2Getter).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[5]
            );
            assert.sameMembers(result, selectors);
          });
        });
        describe('stratB', () => {
          it('should have 6 facets -- call to facetAddresses', async () => {
            facetAddresses = await stratB.diamondLoupeFacet.facetAddresses();
            assert(facetAddresses.length === 6);
          });

          it('should have the right function selectors -- call to faceFunctionSelectors', async () => {
            let selectors, result;
            diamondCutFacet = stratB.diamondCutFacet;
            diamondLoupeFacet = stratB.diamondLoupeFacet;
            OwnershipFacet = stratB.OwnershipFacet;
            stratX2Facet = stratB.stratX2Facet;
            stratX2Setter = stratB.stratX2Setter;
            stratX2Getter = stratB.stratX2Getter;

            // test for DiamondCutFacet
            selectors =
              getSelectorsFromContract(diamondCutFacet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[0]
            );
            assert.sameMembers(result, selectors);

            // test for DiamondLoupeFacet
            selectors =
              getSelectorsFromContract(diamondLoupeFacet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[1]
            );
            assert.sameMembers(result, selectors);

            // test for Ownershipfacet
            selectors = getSelectorsFromContract(OwnershipFacet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[2]
            );

            // test for stratX2Setter
            selectors = getSelectorsFromContract(stratX2Setter).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[3]
            );
            assert.sameMembers(result, selectors);

            // test for stratX2Facet
            selectors = getSelectorsFromContract(stratX2Facet).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[4]
            );
            assert.sameMembers(result, selectors);

            // test for stratX2Getter
            selectors = getSelectorsFromContract(stratX2Getter).getSelectors();
            result = await diamondLoupeFacet.facetFunctionSelectors(
              facetAddresses[5]
            );
            assert.sameMembers(result, selectors);
          });
        });
      });
    });
  });
});
