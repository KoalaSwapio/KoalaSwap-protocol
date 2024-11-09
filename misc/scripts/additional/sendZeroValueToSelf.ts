import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// npx ts-node misc/scripts/additional/sendZeroValueToSelf.ts
// Used when transaction fails to send on an L2. 

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Verify environment variables
  if (!process.env.MORPH_TESTNET_URL) {
    throw new Error("RPC not found in environment variables");
  }

  // Read private key from mainnet.secret
  const privateKey = fs
    .readFileSync(path.join(__dirname, "../../../mainnet.secret"), "utf8")
    .trim();

  // Connect to Base mainnet with explicit network configuration
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.MORPH_TESTNET_URL,
    {
      name: 'morphTestnet',
      chainId: 2810
    }
  );

  // Verify connection
  try {
    await provider.getNetwork();
    console.log("Successfully connected to network");
  } catch (error) {
    console.error("Failed to connect to network:", error);
    process.exit(1);
  }

  // Create wallet instance
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Wallet address:", wallet.address);

  // Create transaction
  const tx = {
    to: wallet.address, // Sending to self
    value: 0, // Zero ETH
    gasLimit: 21000, // Standard gas limit for ETH transfer
  };

  try {
    // Send transaction
    const transaction = await wallet.sendTransaction(tx);
    console.log("Transaction sent! Hash:", transaction.hash);

    // Wait for transaction to be mined
    const receipt = await transaction.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });