/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
import "@nomicfoundation/hardhat-verify";
import "hardhat-storage-layout";
import "solidity-coverage";

import dotenv from "dotenv";
dotenv.config();

// Import tasks
import "./misc/scripts/cmds";

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
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    morphTestnet: {
      url: process.env.RPC_URL,
      accounts: process.env.WALLET_KEY ? [process.env.WALLET_KEY] : [],
      chainId: 2810,
    },
    morphMainnet: {
      url: process.env.RPC_URL || "",
      accounts: process.env.WALLET_KEY ? [process.env.WALLET_KEY] : [],
      chainId: 17000,
    },
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
          apiURL: "https://explorer-api-holesky.morphl2.io/api",
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
