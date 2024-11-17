import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";
import { initProvider, initChain } from "../helpers";

type FormattedEvent = {
  blockNumber: number;
  transactionHash: string;
  [key: string]: any;
};

/**
 * @notice This script fetches and displays the operational status events of the CrocSwapDex contract.
 *
 * @summary Monitors the SafeMode and HotPathOpen events from the CrocSwapDex contract to determine
 *          its operational status. The script processes events in chunks to handle large block ranges
 *          efficiently and removes duplicate events to ensure accurate reporting.
 *
 * @dev Events are fetched in blocks of ~9900 to stay within provider limits.
 *      The script specifically looks for two types of events:
 *      - SafeMode: Indicates if the contract is operating in safe mode
 *      - HotPathOpen: Indicates if the hotpath is enabled
 *
 * @requires process.env.CHAIN_ID to be exposed to the script
 * @requires proper RPC URL to be exposed to the script (see RPC_URLS in constants/rpcs.ts)
 *
 * @readonly Event Processing:
 * - Fetches all events from specified start block to latest
 * - Decodes events using CrocEvents ABI
 * - Filters for SafeMode and HotPathOpen events
 * - Removes duplicate events
 * - Sorts events by block number (descending)
 *
 * @example usage: npx hardhat fetchOperationalStatus --from <blockNumber> --network <network>
 */

async function parseEvents(
  logs: any[],
  blockNumber: number,
  transactionHash: string
): Promise<FormattedEvent[]> {
  const CrocEvents = require("../../../../artifacts/contracts/CrocEvents.sol/CrocEvents.json");
  const contractInterface = new ethers.utils.Interface(CrocEvents.abi);
  const decodedLogs: FormattedEvent[] = [];

  for (const log of logs) {
    try {
      const parsedLog = contractInterface.parseLog(log);
      if (parsedLog.name === "SafeMode" || parsedLog.name === "HotPathOpen") {
        const formattedEvent: FormattedEvent = {
          blockNumber,
          transactionHash,
          [parsedLog.name]: parsedLog.args,
        };
        decodedLogs.push(formattedEvent);
      }
    } catch (error) {
      console.error("Error parsing log:", error);
    }
  }

  return decodedLogs;
}

async function fetchAllEvents(
  fromBlock: number = 5000000,
  hre: HardhatRuntimeEnvironment
) {
  const { provider: readOnlyProvider } = initProvider();
  const { addrs } = initChain();

  const crocSwapDexAbi = (
    await hre.ethers.getContractFactory("CrocSwapDex")
  ).interface.format(ethers.utils.FormatTypes.full);
  const contract = new ethers.Contract(
    addrs.dex,
    crocSwapDexAbi,
    readOnlyProvider
  );

  console.log();
  console.log(`Fetching events from ${fromBlock} to latest`);
  console.log();

  const latestBlock = await readOnlyProvider.getBlockNumber();
  const BLOCK_RANGE = 9900; // Slightly under 10000 to be safe
  const processedEvents: FormattedEvent[] = [];

  // Fetch events in chunks
  for (
    let currentBlock = Number(fromBlock);
    currentBlock < latestBlock;
    currentBlock += BLOCK_RANGE
  ) {
    const endBlock = Math.min(currentBlock + BLOCK_RANGE, latestBlock);
    try {
      const logs = await contract.queryFilter("*", currentBlock, endBlock);

      for (const log of logs) {
        const events = await parseEvents(
          [log],
          log.blockNumber,
          log.transactionHash
        );
        processedEvents.push(...events);
      }

      console.log(`Processed blocks ${currentBlock} to ${endBlock}`);
    } catch (error) {
      console.error(
        `Error processing blocks ${currentBlock} to ${endBlock}:`,
        error
      );
    }
  }

  // Remove duplicates
  processedEvents.forEach((event, index) => {
    processedEvents.forEach((event2, index2) => {
      if (
        index !== index2 &&
        event.blockNumber === event2.blockNumber &&
        event.transactionHash === event2.transactionHash &&
        event.SafeMode &&
        event2.SafeMode
      ) {
        processedEvents.splice(index2, 1);
      }
    });
  });

  console.log(processedEvents.sort((a, b) => b.blockNumber - a.blockNumber));
}

task(
  "fetchOperationalStatus",
  "Fetches the operational status of the CrocSwapDex contract."
)
  .addParam("from", "Starting Block")
  .setAction(async (taskArgs, hre) => {
    await fetchAllEvents(taskArgs.from, hre);
  });
