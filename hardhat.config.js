require("hardhat-gas-reporter");
require('@nomicfoundation/hardhat-toolbox')
require('@openzeppelin/hardhat-upgrades')
module.exports = {
  solidity: {
    compilers: [{
      version: "0.8.9",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }]
  },
  defaultNetwork: "hardhat",
  mocha: {
    timeout: 20000000000
  },
  chai: {
    timeout: 20000000000
  },
  networks: {
    // https://hardhat.org/hardhat-network/reference/#config
    hardhat: {
      gasPrice: 5 * 10**9,
      accountsBalance: 1000000000*10**18
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    token: 'BNB',
    coinmarketcap: '9d2cdfba-6dc0-4738-8792-a1c1035f7ee4',
    gasPrice: 5
  },
  path: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
