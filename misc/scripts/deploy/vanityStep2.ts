/**
 * @title CrocSwapDex Deployment with CREATE2 Script
 * @notice Deploys the CrocSwapDex contract using a pre-determined CREATE2 salt through
 * the CrocDeployer contract
 *
 * @dev This is step 2 of the deployment process. It uses the CrocDeployer contract
 * deployed in step 1 to deploy the main CrocSwapDex contract with a specific CREATE2
 * salt for deterministic addressing.
 *
 *
 * Technical Details:
 * ----------------
 * 1. Uses CREATE2 for deterministic contract addresses across networks
 * 2. Salt values are mapped to specific deployer addresses in misc/constants/salts.ts
 * 3. Requires CrocDeployer contract to be already deployed (from step 1)
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads deployer address
 * 2. Maps the deployer address to its predetermined CREATE2 salt
 * 3. Deploys CrocSwapDex through CrocDeployer using the salt
 * 4. Outputs updated address registry with new dex address
 *
 * Requirements:
 * ------------
 * - CrocDeployer must be deployed and its address stored in addrs.deployer
 * - Deploying wallet must have authority rights on CrocDeployer
 * - CREATE2 salt must be configured for the deployer address. Use generateSalt.ts to generate. Refer to misc/constants/salts.ts for existing salts.
 *
 * State Changes:
 * -------------
 * - Deploys new CrocSwapDex contract
 * - Outputs updated address registry with new dex address
 * - Note: The address registry in misc/constants/addrs.ts must be manually updated
 *   with the new dex address for subsequent deployment steps
 *
 * Gas Considerations:
 * -----------------
 * - Includes a gas limit of 10,000,000 for the deployment transaction
 * - May need adjustment based on network conditions and contract size
 *
 * Example usage:
 *
 * # Deploy to local hardhat network
 * npx hardhat run scripts/deploy/vanityStep2.ts --network localhost
 *
 * # Deploy to mainnet
 * npx hardhat run scripts/deploy/vanityStep2.ts --network mainnet
 *
 */

import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { CrocDeployer } from "../../../typechain";
import { mapSalt } from "../../constants/salts";
import { initChain, refContract, traceContractTx } from "../../libs/chain";
import chalk from "chalk";

async function vanityDeploy() {
  let { addrs, chainId, wallet: authority } = initChain();

  const salt = mapSalt(addrs.deployer);

  console.log(chalk.bold.yellow(`Deploying with the following addresses...`));
  console.log("Protocol Authority: ", authority.address);
  console.log("Using CREATE2 salt", salt.toString(), "\n");

  let crocDeployer = (await refContract(
    "CrocDeployer",
    addrs.deployer,
    authority
  )) as CrocDeployer;

  const factory = await ethers.getContractFactory("CrocSwapDex");
  console.log(await crocDeployer.callStatic.deploy(factory.bytecode, salt));

  await traceContractTx(
    crocDeployer.deploy(factory.bytecode, salt, {
      gasLimit: BigNumber.from(10000000),
    }),
    "Salted Deploy"
  );

  addrs.dex = await crocDeployer.dex_();

  console.log(chalk.blue(`\nCrocSwapDex deployed at: ${addrs.dex}\n`));
  console.log(`Updated addresses for ${chainId}`, addrs, "\n");
}

vanityDeploy();
