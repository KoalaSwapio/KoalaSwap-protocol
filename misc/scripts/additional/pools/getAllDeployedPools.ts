import { initProvider } from "../../../libs/chain";
import { RPC_URLS } from "../../../constants/rpcs";
import chalk from "chalk";
import { ethers } from "ethers";

// Example: npx hardhat run --network morphTestnet misc/scripts/additional/pools/getAllDeployedPools.ts

let { addrs, chainId } = initProvider();

const rpcUrl = RPC_URLS[chainId as keyof typeof RPC_URLS];
console.log(chalk.blue("RPC URL:", rpcUrl));
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

const crocSwapDexAddress = addrs.dex;

const abi = [
  "event PoolInitialized(address indexed base, address indexed quote, uint256 indexed poolIdx)",
];

// Create a contract instance
const crocSwapDex = new ethers.Contract(crocSwapDexAddress, abi, provider);

async function fetchPoolInitializedLogs() {
  // Define the filter for the PoolInitialized event
  const filter = crocSwapDex.filters.PoolInitialized();

  console.log(chalk.blue("Fetching Pool Initialized Logs..."));

  // Fetch logs for the event
  const logs = await provider.getLogs(filter);
  console.log(chalk.green("Fetched Pool Initialized Logs:", logs.length));

  // Parse the logs to get meaningful data
  const parsedLogs = logs
    .map((log: any) => {
      try {
        const parsedLog = crocSwapDex.interface.parseLog(log);
        return {
          base: parsedLog.args.base,
          quote: parsedLog.args.quote,
          poolIdx: parsedLog.args.poolIdx.toString(),
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
        };
      } catch (error) {
        console.error("Error parsing log:", error); // Added error logging
        return null; // Return null or handle the error as needed
      }
    })
    .filter((log: any) => log !== null); // Filter out any null entries

  console.log("Fetched Pool Initialized Logs:", parsedLogs);
}

// Call the function to fetch logs
fetchPoolInitializedLogs()
  .then(() => console.log("Logs fetched successfully"))
  .catch((error) => console.error("Error fetching logs:", error));
