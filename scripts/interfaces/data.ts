import {
  AUTOv2,
  Bitcoin,
  Cardano,
  ERC20,
  Liquidity,
  Matic,
  Ownable,
  XRP,
} from '../../typechain-types';
import { Farm } from './farm';
import { Strat } from './strat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export interface Data {
  matic: Matic;
  bitcoin: Bitcoin;
  ada: Cardano;
  xrp: XRP;
  autoV2: AUTOv2;
  autoV21: AUTOv2;
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
