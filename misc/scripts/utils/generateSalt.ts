/**
 * @title CREATE2 Salt Generator Utility
 * @notice Generates and manages CREATE2 salts for deterministic contract deployments
 *
 * @dev This utility generates deterministic CREATE2 salts by taking the keccak256 hash
 * of a deployer address. These salts are used in the deployment process to ensure
 * consistent contract addresses across different networks.
 *
 * Technical Details:
 * ----------------
 * 1. Salt Generation:
 *    - Takes deployer address as input
 *    - Normalizes to checksum address
 *    - Converts to bytes
 *    - Generates keccak256 hash
 *
 * 2. File Management:
 *    - Can append new salts to misc/constants/salts.ts
 *    - Maintains NatSpec documentation for each entry
 *    - Preserves file structure and exports
 *
 * Process Flow:
 * ------------
 * 1. Validate input address
 * 2. Generate salt from address
 * 3. Format entry with NatSpec documentation
 * 4. Optionally save to salts.ts
 *
 * Command Line Arguments:
 * ---------------------
 * @param --address Required. The deployer address to generate salt for
 * @param --chain Required. Network identifier (e.g., "Mainnet", "Goerli")
 * @param --save Optional. Flag to save the generated salt to salts.ts
 *
 * Environment Variables:
 * --------------------
 * - CHAIN_ID: Fallback chain identifier if --chain not provided
 *
 * Example Usage:
 * -------------
 * ```bash
 * # Generate salt only
 * npx ts-node misc/scripts/utils/generateSalt.ts --address 0x123... --chain Mainnet
 *
 * # Generate and save to salts.ts
 * npx ts-node misc/scripts/utils/generateSalt.ts --address 0x123... --chain Mainnet --save
 * ```
 *
 * Output Format:
 * -------------
 * Generates NatSpec documented entries in salts.ts:
 * ```typescript
 * /**
 *  * @title CREATE2 Salt Entry
 *  * @notice ChainId: {chainId}
 *  * @dev Purpose: CREATE2 salt for deterministic CrocDeployer address
 *  * @dev Generated: {timestamp}
 *  * @param Key Deployer address used to generate salt
 *  * @param Value keccak256 hash of the deployer address
 *  * /
 * CREATE2_SALTS.set(
 *   "{deployer_address}",
 *   "{salt}"
 * );
 * ```
 *
 * @notice This script is part of the deployment workflow and should be run before
 * vanityStep2.ts to ensure proper CREATE2 salt configuration
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const address = args.find((arg, i) => args[i - 1] === "--address");
  const shouldSave = args.includes("--save");

  let chainId = process.env.CHAIN_ID;

  if (!address) {
    console.error("Please provide an address using --address");
    process.exit(1);
  }

  // Validate and normalize address
  let normalizedAddr: string;
  try {
    normalizedAddr = ethers.utils.getAddress(address).toLowerCase();
  } catch (e) {
    console.error("Invalid Ethereum address");
    process.exit(1);
  }

  // Generate salt directly from address bytes
  const salt = ethers.utils.keccak256(ethers.utils.arrayify(normalizedAddr));

  // Format output with chain comment
  const entry = `
/**
 * @title CREATE2 Salt Entry
 * @notice ChainId: ${chainId}
 * @dev Purpose: CREATE2 salt for deterministic CrocDeployer address
 * @dev Generated: ${new Date().toISOString()}
 * @param Key Deployer address used to generate salt
 * @param Value keccak256 hash of the deployer address
 */
CREATE2_SALTS.set(
  "${normalizedAddr}",
  "${salt}"         
);`;

  console.log("\nGenerated Salt Entry:");
  console.log(entry);

  if (shouldSave) {
    const saltsPath = path.join(__dirname, "../../constants/salts.ts");
    try {
      let content = fs.readFileSync(saltsPath, "utf8");
      const insertPos = content.lastIndexOf("export");
      content =
        content.slice(0, insertPos) + entry + "\n\n" + content.slice(insertPos);
      fs.writeFileSync(saltsPath, content);
      console.log("\nSuccessfully added to salts.ts");
    } catch (error) {
      console.error("\nError saving to salts.ts:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
