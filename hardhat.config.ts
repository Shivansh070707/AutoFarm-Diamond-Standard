import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import * as dotenv from 'dotenv';
dotenv.config();
const { ALCHEMY_API_KEY, GOERLI_API_KEY, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  paths: {
    artifacts: 'build/artifacts',
    cache: 'build/cache',
    sources: 'contracts',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 100000000,
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        blockNumber: 16139820,
      },
    },
    'truffle-dashboard': {
      url: 'http://localhost:24012/rpc',
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5,
    },
    mainnet: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5,
    },
  },
  etherscan: {
    apiKey: GOERLI_API_KEY,
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: ['diamond/'],
  },
};
export default config;
