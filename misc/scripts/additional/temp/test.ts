import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { initProvider, initChain } from "../../../libs/chain";
import commandLineArgs from "command-line-args";
import "@nomicfoundation/hardhat-ethers";
import { ethers } from "ethers";
import * as hre from "hardhat";

/**
 * Script to fetch SafeMode and HotPathOpen events from CrocSwap
 * 
 * Usage:
 *  node -r ts-node/register misc/scripts/additional/temp/test.ts --fromBlock <fromBlock>
 */

type FormattedEvent = {
  blockNumber: number;
  transactionHash: string;
  [key: string]: any;
};

/** ****************************************************************
 *  Command Line Arguments
 * *************************************************************** */

const optionDefinitions = [
    { name: "fromBlock", type: String },
  ];
  
  const { fromBlock } = commandLineArgs(optionDefinitions, {
    partial: true,
  }) as {
    fromBlock: string;
  };

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
//   hre: HardhatRuntimeEnvironment
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

async function main() {
    await fetchAllEvents(Number(fromBlock));
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
