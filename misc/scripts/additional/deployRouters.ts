/**
 * Script to deploy and verify CrocSwap router contracts
 *
 * Example usage:
 * ```bash
 * npx hardhat run misc/scripts/additional/deployRouters.ts --network mainnet
 * ```
 *
 * Required .env variables:
 * - CHAIN_ID: The chain identifier (e.g., '0x1' for mainnet, '0x5' for goerli)
 */

import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";
import { CROC_ADDRS } from "../../constants/addrs";
import { getExplorerUrl } from "../../libs/web3";
import chalk from "chalk";

dotenvConfig();

/**
 * Retrieves the DEX contract address for the current chain from environment variables
 * @returns The DEX contract address for the specified chain
 * @throws {Error} If CHAIN_ID is not set or if no addresses are configured for the chain
 */
const getDexAddress = () => {
  const chainId = process.env.CHAIN_ID as keyof typeof CROC_ADDRS;
  if (!chainId) {
    throw new Error("CHAIN_ID not set in environment variables");
  }

  const addrs = CROC_ADDRS[chainId];
  if (!addrs) {
    throw new Error(`No addresses configured for chain ID ${chainId}`);
  }

  return addrs.dex;
};

/**
 * Deploys a new CrocSwapRouter contract
 * @param dexAddress - The address of the DEX contract that the router will interact with
 * @returns The deployed router contract instance
 */
async function deployRouter(dexAddress: string) {
  console.log();
  console.log(chalk.yellow("Deploying CrocSwapRouter..."));
  const RouterFactory = await ethers.getContractFactory("CrocSwapRouter");
  const router = await RouterFactory.deploy(dexAddress);
  await router.deployed();
  console.log(`CrocSwapRouter deployed to: ${router.address}\n`);
  return router;
}

/**
 * Deploys a new CrocSwapRouterBypass contract
 * @param dexAddress - The address of the DEX contract that the router will interact with
 * @returns The deployed router bypass contract instance
 */
async function deployRouterBypass(dexAddress: string) {
  console.log(chalk.yellow("Deploying CrocSwapRouterBypass..."));
  const RouterBypassFactory = await ethers.getContractFactory(
    "CrocSwapRouterBypass"
  );
  const routerBypass = await RouterBypassFactory.deploy(dexAddress);
  await routerBypass.deployed();
  console.log(`CrocSwapRouterBypass deployed to: ${routerBypass.address}\n`);
  return routerBypass;
}

/**
 * Verifies a contract on the network's block explorer
 * @param address - The address of the deployed contract to verify
 * @param constructorArgs - Array of constructor arguments used in deployment
 * @throws {Error} If verification fails
 */
async function verifyContract(address: string, constructorArgs: any[]) {
  console.log(chalk.yellow(`Verifying contract at ${address}...`));
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: constructorArgs,
  });
}

async function main() {
  const dexAddress = getDexAddress();

  const router = await deployRouter(dexAddress);
  const routerBypass = await deployRouterBypass(dexAddress);

  // Add markdown table output
  console.log("\n| Contract Name | Address |");
  console.log("|--------------|---------|");
  console.log(
    `| [CrocSwapRouter](${getExplorerUrl(
      process.env.CHAIN_ID!,
      router.address
    )}) | ${router.address} |`
  );
  console.log(
    `| [CrocSwapRouterBypass](${getExplorerUrl(
      process.env.CHAIN_ID!,
      routerBypass.address
    )}) | ${routerBypass.address} |`
  );

  console.log("\nVerifying contracts on Etherscan...");
  await verifyContract(router.address, [dexAddress]);
  await verifyContract(routerBypass.address, [dexAddress]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
