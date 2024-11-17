/**
 * @title CREATE2 Salt Generator
 * @notice Generates deterministic CREATE2 salts from deployer addresses
 *
 * @dev This utility script generates a keccak256 hash of an input address to be used
 * as a CREATE2 salt. The salt is generated directly from the address bytes, not from
 * its string representation.
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
