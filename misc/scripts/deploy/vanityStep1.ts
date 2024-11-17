/**
 * @title CrocDeployer Contract Deployment Script
 * @notice Deploys the CrocDeployer contract which serves as the factory for creating
 * CrocSwap protocol contracts and managing protocol upgrades
 *
 * @dev This is step 1 of the deployment process, creating the base deployer contract
 * that will be used to deploy other protocol components. The deployer contract acts
 * as a proxy factory and maintains upgrade authority over the protocol.
 *
 * The deployment process:
 * 1. Initializes chain connection and wallet
 * 2. Deploys CrocDeployer contract
 * 3. Provides an updated address registry with the new deployer address
 *
 * @notice The deploying wallet will become the initial authority with upgrade rights
 * @notice After deployment, the address registry in misc/constants/addrs.ts must be 
 * manually updated with the new deployer address for subsequent deployment steps
 * 
 *
 * Example usage:
 * 
 * # Deploy to local hardhat network
 * npx hardhat run misc/scripts/deploy/vanityStep1.ts --network localhost
 *
 * # Deploy to mainnet
 * npx hardhat run misc/scripts/deploy/vanityStep1.ts --network mainnet
 * 
 */


import { inflateAddr, initChain } from "../../libs/chain";
import chalk from "chalk";

async function deploy() {
  let { addrs, chainId, wallet: authority } = initChain();
  console.log(`\nDeploying CrocSwapDeployer Contract to chain ${chainId}...`);
  console.log("Initial Authority: ");

  let crocDeployer = inflateAddr(
    "CrocDeployer",
    addrs.deployer,
    authority,
    authority.address
  );
  addrs.deployer = (await crocDeployer).address;

  console.log(chalk.blue(`\nCrocDeployer: ${addrs.deployer}\n`));
  console.log(`Updated addresses for ${chainId}`, addrs, "\n");
}

deploy();
