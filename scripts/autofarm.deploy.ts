import { ethers } from 'hardhat';
import { deployAutofarmDiamond } from './autofarm';

async function main() {
  //Replace th autov2 and name  parameters with required args
  let autov2: string = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
  let name: string = 'farm-A';

  let [Owner] = await ethers.getSigners();
  let owner: string = Owner.address;
  /*
    -Replace line no 10 { Owner.address } by the address of which contract are deploying .
    -Owner address must be equal to the address of which contracts are deploying.
    -Comment line 9 by typing '//' at the beginning of line 9
    -Address will be in string "<Owner address>"

  */

  await deployAutofarmDiamond(autov2, name, owner);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
