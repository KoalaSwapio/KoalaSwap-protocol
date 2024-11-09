import { ethers } from "hardhat";
import { initProvider } from "../../../libs/chain";
import { contractInstances, makePoolFrom, tokenInstances } from "./helpers";
import { tokens } from "../../../constants/tokens";
import { CURRENT_PRICE } from "./config";
import chalk from "chalk";

// Example: npx hardhat run --network morphTestnet misc/scripts/additional/pools/deploy.ts

let { addrs } = initProvider();

async function deploy() {
  try {
    const authority = (await ethers.getSigners())[0];

    console.log(`\n${chalk.blue("Deploying Pools...")}`);
    console.log("Protocol Authority:", authority.address, "\n");

    const { dex } = await contractInstances(addrs.cold, addrs.dex);
    const { usdc, weth } = await tokenInstances(tokens);

    /// @dev see `makePoolFrom` from `helpers.ts` for more details
    await makePoolFrom(dex, weth, usdc, CURRENT_PRICE);
  } catch (error) {
    console.error(chalk.red("Error during pool deployment:", error));
    process.exit(1);
  }
}

// Execute deployment
deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
