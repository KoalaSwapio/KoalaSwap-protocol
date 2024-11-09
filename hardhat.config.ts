/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
import "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";

dotenv.config();

require("hardhat-storage-layout");
require("solidity-coverage");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
      },
    ],
    overrides: {},
  },
  // typechain: {
  //   outDir: 'typechain', // This matches the project structure
  //   target: 'ethers-v5',
  //   alwaysGenerateOverloads: false,
  //   externalArtifacts: ['externalArtifacts/*.json'],
  // },

  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/cf3bc905d88d4f248c6be347adc8a1d8",
      chainId: 3,
      accounts: [
        "0x7c5e2cfbba7b00ba95e5ed7cd80566021da709442e147ad3e08f23f5044a3d5a",
      ],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/cf3bc905d88d4f248c6be347adc8a1d8",
      chainId: 4,
      accounts: [
        "0x7c5e2cfbba7b00ba95e5ed7cd80566021da709442e147ad3e08f23f5044a3d5a",
      ],
    },
    kovan: {
      url: "https://kovan.infura.io/v3/cf3bc905d88d4f248c6be347adc8a1d8",
      chainId: 42,
      accounts: [
        "0x7c5e2cfbba7b00ba95e5ed7cd80566021da709442e147ad3e08f23f5044a3d5a",
      ],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/cf3bc905d88d4f248c6be347adc8a1d8",
      chainId: 5,
      accounts: [
        "0x7c5e2cfbba7b00ba95e5ed7cd80566021da709442e147ad3e08f23f5044a3d5a",
      ],
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/360ea5fda45b4a22883de8522ebd639e",
      chainId: 1,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
    },

    morphTestnet: {
      url: process.env.MORPH_TESTNET_URL,
      accounts: process.env.WALLET_KEY ? [process.env.WALLET_KEY] : [],
      chainId: 2810,
    },
  },
  morphMainnet: {
    url: process.env.MORPH_MAINNET_URL || "",
    accounts: process.env.WALLET_KEY ? [process.env.WALLET_KEY] : [],
    chainId: 17000,
  },
  etherscan: {
    apiKey: {
      morphTestnet: "anything",
      morphMainnet: "anything",
    },
    customChains: [
      {
        network: "morphTestnet",
        chainId: 2810,
        urls: {
          apiURL: "https://explorer-api-holesky.morphl2.io/api? ",
          browserURL: "https://explorer-holesky.morphl2.io/",
        },
      },
      {
        network: "morphMainnet",
        chainId: 17000,
      },
    ],
  },
};
