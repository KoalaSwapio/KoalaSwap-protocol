/**
 * @title Contract Verification Script
 * @notice Utility script for verifying Croc Protocol contracts on block explorers
 * @dev Usage examples:
 *      Verify all contracts:
 *      `npx hardhat verify-all --network mainnet --delay 172800`
 * 
 *      Verify single contract:
 *      `npx hardhat verify-contract --network mainnet --name CrocDeployer --delay 172800`
 * 
 *      With SafeMode address:
 *      `npx hardhat verify-all --network mainnet --delay 172800 --safemode 0x1234...`
 */

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { writeFileSync } from "fs";
import { join } from "path";
import { CROC_ADDRS } from "../../constants/addrs";
import * as dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

/**
 * @notice Configuration for contract verification
 * @param timelockDelay Optional delay period for timelock in seconds
 * @param safeModeAddress Optional address of the SafeMode contract
 */
interface VerifyConfig {
  timelockDelay?: number;
  safeModeAddress?: string;
}

/**
 * @notice Configuration for each contract to be verified
 * @param address The deployed contract address
 * @param contract The contract path and name (e.g., "contracts/CrocDeployer.sol:CrocDeployer")
 * @param constructorArgs Optional array of constructor arguments
 * @param argsFile Optional flag to indicate if constructor args should be loaded from file
 */
interface ContractConfig {
  address: string;
  contract: string;
  constructorArgs?: string[] | (string | undefined)[];
  argsFile?: boolean;
}

const getAddresses = () => {
  const chainId = process.env.CHAIN_ID as keyof typeof CROC_ADDRS;
  if (!chainId) {
    throw new Error("CHAIN_ID not set in environment variables");
  }

  const addrs = CROC_ADDRS[chainId];
  if (!addrs) {
    throw new Error(`No addresses configured for chain ID ${chainId}`);
  }

  return addrs;
};

/**
 * @notice Creates verification configuration for all contracts
 * @param config Optional verification configuration
 * @return Record of contract configurations
 */
const createContractsConfig = (
  config: VerifyConfig = {}
): Record<string, ContractConfig> => {
  const addrs = getAddresses();

  return {
    CrocDeployer: {
      address: addrs.deployer,
      constructorArgs: [process.env.WALLET_ADDRESS],
      contract: "contracts/CrocDeployer.sol:CrocDeployer",
    },
    CrocSwapDex: {
      address: addrs.dex,
      contract: "contracts/CrocSwapDex.sol:CrocSwapDex",
    },
    CrocPolicy: {
      address: addrs.policy,
      constructorArgs: [addrs.dex],
      contract: "contracts/governance/CrocPolicy.sol:CrocPolicy",
    },
    ColdPath: {
      address: addrs.cold,
      contract: "contracts/callpaths/ColdPath.sol:ColdPath",
    },
    HotProxy: {
      address: addrs.hot,
      contract: "contracts/callpaths/HotPath.sol:HotPath",
    },
    KnockoutLiqPath: {
      address: addrs.knockout,
      contract: "contracts/callpaths/KnockoutPath.sol:KnockoutLiqPath",
    },
    KnockoutFlagPath: {
      address: addrs.koCross,
      contract: "contracts/callpaths/KnockoutPath.sol:KnockoutFlagPath",
    },
    LongPath: {
      address: addrs.long,
      contract: "contracts/callpaths/LongPath.sol:LongPath",
    },
    MicroPaths: {
      address: addrs.micro,
      contract: "contracts/callpaths/MicroPaths.sol:MicroPaths",
    },
    WarmPath: {
      address: addrs.warm,
      contract: "contracts/callpaths/WarmPath.sol:WarmPath",
    },
    CrocQuery: {
      address: addrs.query,
      constructorArgs: [addrs.dex],
      contract: "contracts/periphery/CrocQuery.sol:CrocQuery",
    },
    CrocImpact: {
      address: addrs.impact,
      constructorArgs: [addrs.dex],
      contract: "contracts/periphery/CrocImpact.sol:CrocImpact",
    },
    TimelockTreasury: {
      address: addrs.govern.timelockTreasury,
      argsFile: true,
      contract: "contracts/governance/TimelockTreasury.sol:TimelockTreasury",
    },
    SafeMode: {
      address: config.safeModeAddress || "",
      contract: "contracts/callpaths/SafeModePath.sol:SafeModePath",
    },
  };
};

/**
 * @notice Creates arguments file for TimelockTreasury verification
 * @param delay The timelock delay in seconds
 */
const createTimelockArgs = (delay: number) => {
  const addrs = getAddresses();

  const args = [
    delay, // minDelay (configurable)
    [addrs.govern.multisigTreasury], // proposers
    [addrs.govern.multisigTreasury], // executors
    addrs.govern.multisigTreasury, // admin
  ];

  const content = `module.exports = ${JSON.stringify(args, null, 2)};`;
  writeFileSync(join(__dirname, "../../../args.js"), content);
};

/**
 * @notice Task to verify all deployed contracts
 * @param delay Optional timelock delay in seconds (default: 172800)
 * @param safemode Optional SafeMode contract address
 * @example npx hardhat verify-all --network mainnet --delay 172800
 */
task("verify-all", "Verify all contracts")
  .addOptionalParam("delay", "Timelock delay in seconds", "172800")
  .addOptionalParam("safemode", "SafeMode contract address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("Starting contract verification...");
    console.log(`Chain ID: ${process.env.CHAIN_ID}`);
    console.log(`Timelock Delay: ${taskArgs.delay} seconds`);
    if (taskArgs.safemode) {
      console.log(`SafeMode Address: ${taskArgs.safemode}`);
    }

    const CONTRACTS = createContractsConfig({
      timelockDelay: parseInt(taskArgs.delay),
      safeModeAddress: taskArgs.safemode,
    });

    // Create args.js file for TimelockTreasury
    if (CONTRACTS.TimelockTreasury.argsFile) {
      createTimelockArgs(parseInt(taskArgs.delay));
      console.log("Created args.js for TimelockTreasury");
    }

    for (const [name, config] of Object.entries(CONTRACTS)) {
      try {
        // Skip if address is empty string
        if (!config.address || config.address === "") {
          console.log(`⚠️ Skipping ${name} - No address configured`);
          continue;
        }

        console.log(chalk.blue(`\nVerifying ${name}...`));
        console.log(`Address: ${config.address}`);

        const verifyArgs: any = {
          address: config.address,
          contract: config.contract,
        };

        if (config.constructorArgs) {
          verifyArgs.constructorArguments = config.constructorArgs;
          console.log(`Constructor Args: ${config.constructorArgs}`);
        }

        if (config.argsFile) {
          verifyArgs.constructorArgsParams = "--constructor-args args.js";
        }

        await hre.run("verify:verify", verifyArgs);

        console.log(`✅ ${name} verified successfully`);
      } catch (error) {
        console.error(`❌ Failed to verify ${name}:`, error);
      }
    }
  });

/**
 * @notice Task to verify a single contract
 * @param name The name of the contract to verify
 * @param delay Optional timelock delay in seconds (default: 172800)
 * @param safemode Optional SafeMode contract address
 * @example npx hardhat verify-contract --network mainnet --name CrocDeployer
 */
task("verify-contract", "Verify a specific contract")
  .addParam("name", "Contract name to verify")
  .addOptionalParam("delay", "Timelock delay in seconds", "172800")
  .addOptionalParam("safemode", "SafeMode contract address")
  .setAction(async (taskArgs, hre) => {
    const CONTRACTS = createContractsConfig({
      timelockDelay: parseInt(taskArgs.delay),
      safeModeAddress: taskArgs.safemode,
    });

    const config = CONTRACTS[taskArgs.name as keyof typeof CONTRACTS];

    if (!config) {
      console.error(`Contract ${taskArgs.name} not found in configuration`);
      return;
    }

    try {
      if (!config.address || config.address === "") {
        console.log(`⚠️ Skipping ${taskArgs.name} - No address configured`);
        return;
      }

      console.log(`\nVerifying ${taskArgs.name}...`);
      console.log(`Address: ${config.address}`);

      const verifyArgs: any = {
        address: config.address,
        contract: config.contract,
      };

      if (config.constructorArgs) {
        verifyArgs.constructorArguments = config.constructorArgs;
        console.log(`Constructor Args: ${config.constructorArgs}`);
      }

      if (config.argsFile) {
        if (taskArgs.name === "TimelockTreasury") {
          createTimelockArgs(parseInt(taskArgs.delay));
          console.log("Created args.js for TimelockTreasury");
        }
        verifyArgs.constructorArgsParams = "--constructor-args args.js";
      }

      await hre.run("verify:verify", verifyArgs);

      console.log(`✅ ${taskArgs.name} verified successfully`);
    } catch (error) {
      console.error(`❌ Failed to verify ${taskArgs.name}:`, error);
    }
  });
