/**
 * @title CrocSwapDex Proxy Path Installation Script
 * @notice Installs all proxy path contracts into the CrocSwapDex through the CrocPolicy
 * governance contract
 *
 * @dev This is step 5 of the deployment process. It installs all proxy paths deployed
 * in step 4 using protocol command 21 through treasury resolutions.
 *
 *
 * Technical Details:
 * ----------------
 * 1. Uses protocol command 21 for each proxy path installation
 * 2. Executes through CrocPolicy treasuryResolution function
 * 3. Each path is assigned a specific proxy index from constants
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads CrocPolicy contract
 * 2. Installs proxy paths in sequence:
 *    - LongPath (LONG_PROXY_IDX)
 *    - WarmPath (LP_PROXY_IDX)
 *    - HotProxy (SWAP_PROXY_IDX)
 *    - MicroPaths (MICRO_PROXY_IDX)
 *    - KnockoutLiqPath (KNOCKOUT_LP_PROXY_IDX)
 *    - KnockoutFlagPath (FLAG_CROSS_PROXY_IDX)
 *
 * Requirements:
 * ------------
 * - All proxy path contracts must be deployed (from step 4)
 * - CrocPolicy must have control of CrocSwapDex
 * - Authority wallet must have governance rights on CrocPolicy
 *
 * State Changes:
 * -------------
 * - Installs each proxy path into CrocSwapDex
 * - Associates each path with its designated proxy index
 * - Enables respective functionality for each installed path
 *
 * Gas Considerations:
 * -----------------
 * - Six separate installation transactions
 * - Each installation uses 1,000,000 gas limit
 * - Total gas usage approximately 6,000,000
 *
 * Example usage:
 *
 * # Install proxy paths on local hardhat network
 * npx hardhat run scripts/deploy/vanityStep5.ts --network localhost
 *
 * # Install proxy paths on mainnet
 * npx hardhat run scripts/deploy/vanityStep5.ts --network mainnet
 *
 */

import { CrocPolicy } from "../../../typechain";
import {
  BOOT_PROXY_IDX,
  FLAG_CROSS_PROXY_IDX,
  KNOCKOUT_LP_PROXY_IDX,
  LONG_PROXY_IDX,
  LP_PROXY_IDX,
  MICRO_PROXY_IDX,
  SWAP_PROXY_IDX,
} from "../../constants/addrs";
import { inflateAddr, initChain, traceContractTx } from "../../libs/chain";
import { AbiCoder } from "@ethersproject/abi";

const abi = new AbiCoder();
let cmd;

const txArgs = { gasLimit: 1000000 };

async function install() {
  let { addrs, wallet: authority } = initChain();

  let policy = (await inflateAddr(
    "CrocPolicy",
    addrs.policy,
    authority
  )) as CrocPolicy;

  cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, addrs.long, LONG_PROXY_IDX]
  );
  await traceContractTx(
    policy.treasuryResolution(addrs.dex, BOOT_PROXY_IDX, cmd, true, txArgs),
    "Install long path"
  );

  cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, addrs.warm, LP_PROXY_IDX]
  );
  await traceContractTx(
    policy.treasuryResolution(addrs.dex, BOOT_PROXY_IDX, cmd, true, txArgs),
    "Install warm path"
  );

  cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, addrs.hot, SWAP_PROXY_IDX]
  );
  await traceContractTx(
    policy.treasuryResolution(addrs.dex, BOOT_PROXY_IDX, cmd, true, txArgs),
    "Install hot proxy path"
  );

  cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, addrs.micro, MICRO_PROXY_IDX]
  );
  await traceContractTx(
    policy.treasuryResolution(addrs.dex, BOOT_PROXY_IDX, cmd, true, txArgs),
    "Install micro paths"
  );

  cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, addrs.knockout, KNOCKOUT_LP_PROXY_IDX]
  );
  await traceContractTx(
    policy.treasuryResolution(addrs.dex, BOOT_PROXY_IDX, cmd, true, txArgs),
    "Install knockout liquidity proxy path"
  );

  cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, addrs.koCross, FLAG_CROSS_PROXY_IDX]
  );
  await traceContractTx(
    policy.treasuryResolution(addrs.dex, BOOT_PROXY_IDX, cmd, true, txArgs),
    "Install knockout cross proxy path"
  );
}

install();
