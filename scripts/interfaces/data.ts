import { ERC20, Liquidity, Ownable } from '../../typechain-types';
import { Farm } from './farm';
import { Strat } from './strat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export interface Data {
  matic: Ownable | ERC20;
  bitcoin: Ownable | ERC20;
  ada: Ownable | ERC20;
  xrp: Ownable | ERC20;
  autoV2: Ownable | ERC20;
  autoV21: Ownable | ERC20;
  owner: SignerWithAddress;
  otherAccount: SignerWithAddress;
  pool: Liquidity;
  want: Ownable | ERC20;
  reward: SignerWithAddress;
  farmA: Farm;
  farmB: Farm;
  stratA: Strat;
  stratB: Strat;
}
