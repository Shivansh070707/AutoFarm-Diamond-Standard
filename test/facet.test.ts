import { assert, expect } from 'chai';
import { ethers } from 'hardhat';
import { initializer } from '../scripts/initFunction';
import { FacetCutAction, getSelectorsFromContract } from '../scripts/libraries';
import {
  AutoFarmFacet,
  AutoFarmV2GetterFacet,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  OwnershipFacet,
  StratX2Facet,
  StratX2GetterFacet,
  StratX2SetterFacet,
} from '../typechain-types';
import { Data } from '../scripts/interfaces/data';
import { Farm } from '../scripts/interfaces/farm';
import { Strat } from '../scripts/interfaces/strat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('Tests for Diamond ', () => {
  let diamondCutFacet: DiamondCutFacet;
  let diamondLoupeFacet: DiamondLoupeFacet;
  let diamondInit: DiamondInit;
  let stratX2Facet: StratX2Facet;
  let stratX2Setter: StratX2SetterFacet;
  let stratX2Getter: StratX2GetterFacet;
  let autoFarmFacet: AutoFarmFacet;
  let autoFarmGetter: AutoFarmV2GetterFacet;
  let OwnershipFacet: OwnershipFacet;
  let owner: SignerWithAddress;
  let farmA: Farm;
  let farmB: Farm;
  let stratB: Strat;
  let stratA: Strat;
  let data: Data;
  let facetAddresses: string[]; // DiamondCutFacet, DiamondLoupeFacet, StratX2Facet

  before(async () => {
    data = await initializer();
    farmA = data.farmA;
    farmB = data.farmB;
    stratA = data.stratA;
    stratB = data.stratB;
    owner = data.owner;
  });

  describe('DiamondLoupeFacet Tests', () => {
    describe('farmA', () => {
      it('should have 5 facets -- call to facetAddresses', async () => {
        facetAddresses = await farmA.diamondLoupeFacet.facetAddresses();
        assert(facetAddresses.length === 5);
      });

      it('should have the right function selectors -- call to faceFunctionSelectors', async () => {
        let selectors, result;
        diamondCutFacet = farmA.diamondCutFacet;
        diamondLoupeFacet = farmA.diamondLoupeFacet;
        autoFarmFacet = farmA.autoFarmFacet;
        autoFarmGetter = farmA.autoFarmV2GetterFacet;
        OwnershipFacet = farmA.OwnershipFacet;

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

        // test for Ownershipfacet
        selectors = getSelectorsFromContract(OwnershipFacet).getSelectors();
        result = await diamondLoupeFacet.facetFunctionSelectors(
          facetAddresses[2]
        );
        // test for autoFarmFacet
        selectors = getSelectorsFromContract(autoFarmFacet).getSelectors();
        result = await diamondLoupeFacet.facetFunctionSelectors(
          facetAddresses[3]
        );
        assert.sameMembers(result, selectors);

        // test for autoFarmGetter
        selectors = getSelectorsFromContract(autoFarmGetter).getSelectors();
        result = await diamondLoupeFacet.facetFunctionSelectors(
          facetAddresses[4]
        );
        assert.sameMembers(result, selectors);
      });
      describe('farmB', () => {
        it('should have 5 facets -- call to facetAddresses', async () => {
          facetAddresses = await farmB.diamondLoupeFacet.facetAddresses();
          assert(facetAddresses.length === 5);
        });

        it('should have the right function selectors -- call to faceFunctionSelectors', async () => {
          let selectors, result;
          diamondCutFacet = farmB.diamondCutFacet;
          diamondLoupeFacet = farmB.diamondLoupeFacet;
          autoFarmFacet = farmB.autoFarmFacet;
          autoFarmGetter = farmB.autoFarmV2GetterFacet;
          OwnershipFacet = farmB.OwnershipFacet;

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

          // test for Ownershipfacet
          selectors = getSelectorsFromContract(OwnershipFacet).getSelectors();
          result = await diamondLoupeFacet.facetFunctionSelectors(
            facetAddresses[2]
          );

          // test for autoFarmFacet
          selectors = getSelectorsFromContract(autoFarmFacet).getSelectors();
          result = await diamondLoupeFacet.facetFunctionSelectors(
            facetAddresses[3]
          );
          assert.sameMembers(result, selectors);

          // test for autoFarmGetter
          selectors = getSelectorsFromContract(autoFarmGetter).getSelectors();
          result = await diamondLoupeFacet.facetFunctionSelectors(
            facetAddresses[4]
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
    describe('DiamondCutFacet Tests (upgrading facets and functions)', () => {
      it('will remove facet in autofarm diamond', async () => {
        autoFarmGetter = farmA.autoFarmV2GetterFacet;
        const cut = [
          {
            facetAddress: ethers.constants.AddressZero,
            action: FacetCutAction.Remove,
            functionSelectors:
              getSelectorsFromContract(autoFarmGetter).getSelectors(),
          },
        ];
        diamondCutFacet = farmA.diamondCutFacet;
        const tx = await diamondCutFacet.diamondCut(
          cut,
          ethers.constants.AddressZero,
          '0x'
        );
        const receipt = await tx.wait();
        if (!receipt.status) {
          throw Error(`Diamond upgrade failed: ${tx.hash}`);
        }
        facetAddresses = await farmA.diamondLoupeFacet.facetAddresses();
        assert(facetAddresses.length === 4);
      });
      it('will throw error when calling invalid function', async () => {
        await expect(autoFarmGetter.autoV2()).to.be.revertedWith(
          'Diamond: Function does not exist'
        );
      });
      it('will add facet in autofarm', async () => {
        let AutoFarmV2Getter = await ethers.getContractFactory(
          'AutoFarmV2GetterFacet'
        );
        autoFarmGetter = await AutoFarmV2Getter.deploy();
        await autoFarmGetter.deployed();
        const cut = [
          {
            facetAddress: autoFarmGetter.address,
            action: FacetCutAction.Add,
            functionSelectors:
              getSelectorsFromContract(autoFarmGetter).getSelectors(),
          },
        ];
        const tx = await diamondCutFacet
          .connect(owner)
          .diamondCut(cut, ethers.constants.AddressZero, '0x');
        const receipt = await tx.wait();
        if (!receipt.status) {
          throw Error(`Diamond upgrade failed: ${tx.hash}`);
        }
        facetAddresses = await farmA.diamondLoupeFacet.facetAddresses();
        assert(facetAddresses.length === 5);
        autoFarmGetter = farmA.autoFarmV2GetterFacet;
        expect(await autoFarmGetter.startBlock()).to.equal(3888888);
      });
      it('will remove functions in autofarm', async () => {
        autoFarmGetter = farmA.autoFarmV2GetterFacet;
        diamondCutFacet = farmA.diamondCutFacet;
        diamondInit = farmA.diamondInit;
        let autov2_selector = getSelectorsFromContract(autoFarmGetter).get([
          'autoV2()',
        ]);

        const cut = [
          {
            facetAddress: ethers.constants.AddressZero,
            action: FacetCutAction.Remove,
            functionSelectors: autov2_selector,
          },
        ];
        const tx = await diamondCutFacet.diamondCut(
          cut,
          ethers.constants.AddressZero,
          '0x'
        );
        const receipt = await tx.wait();
        if (!receipt.status) {
          throw Error(`Diamond upgrade failed: ${tx.hash}`);
        }

        await expect(autoFarmGetter.autoV2()).to.be.revertedWith(
          'Diamond: Function does not exist'
        );
      });
      it('will add function in autofarm diamond', async () => {
        let AutoFarmV2Getter = await ethers.getContractFactory(
          'AutoFarmV2GetterFacet'
        );
        autoFarmGetter = await AutoFarmV2Getter.deploy();
        //autoFarmGetter = farmA.autoFarmV2GetterFacet;
        let autov2_selector = getSelectorsFromContract(autoFarmGetter).get([
          'autoV2()',
        ]);
        const cut = [
          {
            facetAddress: autoFarmGetter.address,
            action: FacetCutAction.Add,
            functionSelectors: autov2_selector,
          },
        ];
        diamondCutFacet = farmA.diamondCutFacet;
        const tx = await diamondCutFacet.diamondCut(
          cut,
          ethers.constants.AddressZero,
          '0x'
        );
        const receipt = await tx.wait();
        if (!receipt.status) {
          throw Error(`Diamond upgrade failed: ${tx.hash}`);
        }
        autoFarmGetter = AutoFarmV2Getter.attach(farmA.diamondAddress);
        expect(await autoFarmGetter.autoV2()).to.equal(data.autoV2.address);
      });
    });
    describe('Negative test cases - Diamond', async () => {
      it('will throw error when same functions added twice', async () => {
        let cut = [
          {
            facetAddress: autoFarmGetter.address,
            action: FacetCutAction.Add,
            functionSelectors: [
              getSelectorsFromContract(autoFarmGetter).getSelectors()[0],
            ],
          },
        ];
        await expect(
          diamondCutFacet
            .connect(owner)
            .diamondCut(cut, ethers.constants.AddressZero, '0x')
        ).to.be.revertedWith(
          "LibDiamondCut: Can't add function that already exists"
        );
      });
      it('will throw error when caller is not owner while removing functions', async () => {
        let signer: SignerWithAddress[] = await ethers.getSigners();
        let user1: SignerWithAddress = signer[5];
        autoFarmGetter = farmA.autoFarmV2GetterFacet;
        const cut = [
          {
            facetAddress: ethers.constants.AddressZero,
            action: FacetCutAction.Remove,
            functionSelectors:
              getSelectorsFromContract(autoFarmGetter).getSelectors(),
          },
        ];
        diamondCutFacet = farmA.diamondCutFacet;
        await expect(
          diamondCutFacet
            .connect(user1)
            .diamondCut(cut, ethers.constants.AddressZero, '0x')
        ).to.be.rejectedWith('LibDiamond: Must be contract owner');
      });
      it('will revert when we initialize function twice', async () => {
        let cut: any = [];
        const diamondCut: DiamondCutFacet = await ethers.getContractAt(
          'IDiamondCut',
          farmA.diamondAddress
        );
        const diamondInitFunctionCall =
          diamondInit.interface.encodeFunctionData('autofarmInit', [
            owner.address,
          ]);
        await expect(
          diamondCut.diamondCut(
            cut,
            diamondInit.address,
            diamondInitFunctionCall
          )
        ).to.be.rejectedWith('already initialized');
      });
      it('will revert when wrong facet action taken', async () => {
        let cut: any = [];
        const facet: StratX2GetterFacet = stratA.stratX2Getter;
        const selectors = getSelectorsFromContract(facet);
        cut.push({
          facetAddress: facet.address,
          action: 5,
          functionSelectors: selectors.getSelectors(),
        });

        const diamondCut: DiamondCutFacet = await ethers.getContractAt(
          'IDiamondCut',
          farmA.diamondAddress
        );
        const diamondInitFunctionCall =
          diamondInit.interface.encodeFunctionData('init');

        await expect(
          diamondCut.diamondCut(
            cut,
            diamondInit.address,
            diamondInitFunctionCall
          )
        ).to.be.reverted;
      });
      it("will revert when remove functions that doesn't exists", async () => {
        let selector = getSelectorsFromContract(stratA.stratX2Getter).get([
          'autoAddress()',
        ]);

        const cut = [
          {
            facetAddress: ethers.constants.AddressZero,
            action: FacetCutAction.Remove,
            functionSelectors: selector,
          },
        ];
        await expect(
          diamondCutFacet.diamondCut(cut, ethers.constants.AddressZero, '0x')
        ).to.be.revertedWith(
          "LibDiamondCut: Can't remove function that doesn't exist"
        );
      });
      it('will revert when facet address is address zero while adding function ', async () => {
        let autov2_selector = getSelectorsFromContract(autoFarmGetter).get([
          'autoV2()',
        ]);

        const cut = [
          {
            facetAddress: ethers.constants.AddressZero,
            action: FacetCutAction.Add,
            functionSelectors: autov2_selector,
          },
        ];
        await expect(
          diamondCutFacet.diamondCut(cut, ethers.constants.AddressZero, '0x')
        ).to.be.revertedWith("LibDiamondCut: Add facet can't be address(0)");
      });
      it('will revert when facet address is not address zero when remove functions in autofarm', async () => {
        autoFarmGetter = farmA.autoFarmV2GetterFacet;
        diamondCutFacet = farmA.diamondCutFacet;
        diamondInit = farmA.diamondInit;
        let autov2_selector = getSelectorsFromContract(autoFarmGetter).get([
          'autoV2()',
        ]);

        const cut = [
          {
            facetAddress: diamondInit.address,
            action: FacetCutAction.Remove,
            functionSelectors: autov2_selector,
          },
        ];
        await expect(
          diamondCutFacet.diamondCut(cut, ethers.constants.AddressZero, '0x')
        ).to.be.revertedWith(
          'LibDiamondCut: Remove facet address must be address(0)'
        );
      });
    });
  });
});
