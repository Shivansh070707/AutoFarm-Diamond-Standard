# Autofarm-Diamond Project

## Project Description

---

- The DApp (Decentralised Application) was designed with the purpose of optimising DeFi (Decentralised Finance) users yields as they interact with the other DApps in the DeFi space.
- Reference -(https://autofarm.gitbook.io/autofarm-network/)

## Technologies used

- solidity compiler version : `0.8.17`
- [Hardhat](https://hardhat.org/) smart contracts architecture
- [OpenZeppelin contracts](https://openzeppelin.com/)
- [chai](https://www.chaijs.com/) for testing
- [solidity-coverage](https://github.com/sc-forks/solidity-coverage) for generating code coverage
- [truffle dashboard](https://trufflesuite.com/docs/truffle/how-to/use-the-truffle-dashboard/) for deplyment of the smart contracts

## A typical top-level directory layout

```shell
.
├── build                 # deployed addresses and the ABI of the smart contract (scripts/deploy.ts)
├── contracts            # smart contracts solidity files
├── scripts               # deployment scripts (deploy.ts) and other tasks
├── test                  # test scripts
├── .env.example          # environment variables template
├── .gitignore
├── hardhat-config.ts     # hardhat configuration
├── package.json          # project details and dependencies
├── README.md

```

## Instructions and hardhat commands

- Install the autofarm project dependencies. \
  This will install the packages mentioned inside the `package.json` file.

  ```shell
  npm i
  ```

- Create the `.env` file following the `.env.example` file and fill in the contents. The values for the `ALCHEMY_API_KEY` can be obtained from the [Alchemy](https://www.alchemy.com/) website. If you don't have an account, you can create one for free.

  ```shell
  cp .env.example .env
  ```

  Else, you can comment out the places in the `hardhat.config.ts` file where the `ALCHEMY_API_KEY` is used, to be able to compile the smart contracts.

- Compile the smart contracts. \
  This will compile the smart contract files using the specified soilidity compiler in `hardhat.config.ts`.

  ```shell
  npx hardhat compile
  ```

- Instantiate the hardhat local node.

  ```shell
  npx hardhat node
  ```

- Run the autofarm project tests using the local node.

  ```shell
  npx hardhat test --network localhost
  ```

- Generate the code coverage report. \
  After generating the report, you can open the `coverage/index.html` file to see the results.

  ```shell
  npx hardhat coverage
  ```

- Deployment of the smart contracts. \
  There are two ways of deploying the smart contracts:

  - Using private keys: \
    The private key needs to be pasted in the .env file and the `accounts` property in the `networks` properties in the `hardhat.config.ts` file needs to be uncommented for the network on which the smart contracts need to deployed, as follows.

    ```shell
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5,
    },
    ```

  - Without using private keys: \
    This lets you deploy the contracts without the need of pasting the private key anywhere in the project and is the preferred way of deployment.

    - Install truffle globally

      ```shell
      npm install -g truffle
      ```

    - Run the truffle dashboard

      ```shell
      truffle dashboard
      ```

    - The browser will open up and then you have to connect with the MetaMask extension. Select the preferred network and the account to deploy the smart contract.

- Deploy the autofarm project smart contracts using either of the two ways mentioned above.

  ```shell
  npx hardhat run .\scripts\autofarm.deploy.ts --network <NETWORK>  param1 param2
  ```

  //param1 is autov2 address - example - <'0x20F5f006a0184883068bBF58fb0c526A8EEa8BFD'>
  // param2 is farm name - example -<'AutoFarm Name>

  `````shell
  //for deploying stratx2 diamond you need to modify the variables in './scripts/stratx2.pcs.ts'

  npx hardhat run .\scripts\stratx2.pcs.ts --network <NETWORK>
  ``

  ````shell
  npx hardhat run .\scripts\initFunction.ts --network <NETWORK>

  `````

  `<NETWORK>` can be `localhost`, `goerli`, `plsTest`, `plsMain`, `mainnet` or any other network that is supported and defined in the `hardhat.config.ts`.

- If the deployment uses the truffle dashboard method, then, switch to the browser and sign the deployment transactions from the MetaMask extension. For the deployment of the `initFunction.ts`, there will be **multiple transactions** that need to be signed via Metamask.

- Unless `Done` is being shown in the terminal, the deployment process of the strategies are not over.

- Otherwise, if the deployment uses the private key, the transactions will be signed automatically and will be shown in the terminal.

- After the succesful deployment of the smart contracts, a `build` folder comprising the addresses and the ABIs of the deployed smart contracts will be generated.

## Smart contracts size

- To generate the sizes of the smart contracts.

  ```shell
  npx hardhat size-contracts
  ```

  ![size](./smart-contract-size.png)

## Code coverage

- To generate the code coverage report for the test cases of the smart contracts.

  ```shell
  npx hardhat coverage
  ```

  ![coverage](./code-coverage.png)
