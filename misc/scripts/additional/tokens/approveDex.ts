import { ethers } from "hardhat";
import { initProvider } from "../../../libs/chain";
import { tokenInstances, dexInstance } from "./helpers";
import { TransactionResponse } from "@ethersproject/providers";
import { tokens } from "../../../constants/tokens";

// Example: npx hardhat run --network morphTestnet misc/scripts/additional/tokens/approveDex.ts

let { addrs } = initProvider();

async function deploy() {
  try {
    const authority = (await ethers.getSigners())[0];
    let tx: TransactionResponse;

    console.log("Deploying Tokens...");
    console.log("Protocol Authority:", authority.address);

    const { dex } = await dexInstance(addrs.dex);
    const { dai, usdc, weth, wbtc, usdt } = await tokenInstances(tokens);
    
    const approvalAmount = ethers.constants.MaxUint256;
    const gasLimit = 10000000;

    console.log(`Approving dai for dex...`);
    tx = await dai.approve(dex.address, approvalAmount, { gasLimit });
    await tx.wait();

    console.log(`Approving usdc for dex...`);
    tx = await usdc.approve(dex.address, approvalAmount, { gasLimit });
    await tx.wait();

    console.log(`Approving usdt for dex...`);
    tx = await usdt.approve(dex.address, approvalAmount, { gasLimit });
    await tx.wait();

    console.log(`Approving weth for dex...`);
    tx = await weth.approve(dex.address, approvalAmount, { gasLimit });
    await tx.wait();

    console.log(`Approving wbtc for dex...`);
    tx = await wbtc.approve(dex.address, approvalAmount, { gasLimit });
    await tx.wait();

    console.log("All approvals completed successfully!");
  } catch (error) {
    console.error("Error during pool deployment:", error);
    process.exit(1);
  }
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
