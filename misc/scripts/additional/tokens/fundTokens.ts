import { ethers } from "hardhat";
import { initProvider } from "../../../libs/chain";
import { tokenInstances, dexInstance, waitMine, override } from "./helpers";
import { tokens } from "../../../constants/tokens";
import chalk from "chalk";

// Example: npx hardhat run --network morphTestnet misc/scripts/additional/tokens/fundTokens.ts
// Note: process.env.WALLET_KEY must be set to the private key of the trader

let { addrs } = initProvider();

async function fundTokens() {
  try {
    const authority = (await ethers.getSigners())[0];

    const ethAmount = "1000000"; // 1,000,000 ETH
    let quantity = ethers.utils.parseEther(ethAmount);

    console.log(`\nFunding Tokens...`);
    console.log(chalk.yellow(`Trader: ${authority.address}`));

    const { dex } = await dexInstance(addrs.dex);
    const { dai, usdc, weth, wbtc, usdt } = await tokenInstances(tokens);

    for (let token of [dai, usdc, usdt, weth, wbtc]) {
      const symbol = await token.symbol();

      console.log(
        chalk.blue(
          `\nFunding ${symbol} with ${quantity} for trader and approving for dex...`
        )
      );
      await waitMine(
        token.deposit(await authority.getAddress(), quantity, override)
      );
      await waitMine(
        token.connect(authority).approve(dex.address, quantity, override)
      );
      console.log(chalk.green(symbol + " funded"));
    }

    console.log("\n" + chalk.green("Funding complete!"));
  } catch (error) {
    console.error("\n" + chalk.red("Error during funding:", error));
    process.exit(1);
  }
}

fundTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
