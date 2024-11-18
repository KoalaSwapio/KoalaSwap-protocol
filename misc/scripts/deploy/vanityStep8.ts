/**
 * @title Governance Resolution Instruction Generator
 * @notice Formats and outputs step-by-step instructions for executing governance
 * actions through multisig and timelock contracts
 *
 * @dev Processes governance resolution objects and generates human-readable
 * instructions with complete transaction data for multisig execution
 *
 *
 * Technical Details:
 * ----------------
 * 1. Formats encoded protocol commands for readability
 * 2. Generates two-step execution process through timelock
 * 3. Provides complete calldata for both transactions
 *
 * Process Flow:
 * ------------
 * 1. Receives resolution object with command details
 * 2. Outputs formatted instructions including:
 *    - Resolution type and description
 *    - Target contract addresses
 *    - Protocol command details
 *    - Step 1: Scheduling transaction data
 *    - Step 2: Execution transaction data
 *
 * Requirements:
 * ------------
 * - Valid resolution object with complete parameters
 * - Properly encoded protocol command
 * - Valid contract addresses for:
 *   - CrocSwapDex
 *   - Gnosis Safe multisig
 *   - Timelock contract
 *
 * State Changes:
 * -------------
 * - No direct state changes (output only)
 * - Generated instructions will lead to state changes when executed
 *
 * Output Format:
 * -------------
 * - Human-readable instructions
 * - Complete transaction details for both steps
 * - Encoded calldata ready for multisig use
 *
 * Example usage:
 *
 * const resolution = {
 *   resolutionType: "treasury",
 *   dexContract: "0x...",
 *   protocolCmd: "0x...",
 *   multisigOrigin: "0x...",
 *   timelockCall: {
 *     timelockAddr: "0x...",
 *     delay: "48 hours",
 *     scheduleCalldata: "0x...",
 *     execCalldata: "0x..."
 *   }
 * };
 *
 * Example usage:
 *
 * # Installs WarmPath proxy through treasury resolution on local network
 * npx hardhat run scripts/deploy/vanityStep8.ts --network localhost
 *
 * # Installs WarmPath proxy through treasury resolution on mainnet
 * npx hardhat run scripts/deploy/vanityStep8.ts --network mainnet
 *
 */

import { initChain } from "../../libs/chain";
import { AbiCoder } from "@ethersproject/abi";
import { BOOT_PROXY_IDX, LP_PROXY_IDX } from "../../constants/addrs";
import { CrocProtocolCmd, treasuryResolution } from "../../libs/governance";

const abi = new AbiCoder();
let cmd;

/**
 * @notice Installs WarmPath proxy through treasury resolution
 *
 * Technical Details:
 * ----------------
 * 1. Uses protocol command 21 for proxy installation
 * 2. Targets LP_PROXY_IDX for WarmPath installation
 * 3. Executes through treasuryResolution with 30-day delay
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads contracts
 * 2. Encodes WarmPath installation command:
 *    - Command: 21 (Install proxy)
 *    - Target: WarmPath address
 *    - Index: LP_PROXY_IDX
 * 3. Submits treasury resolution for installation
 *
 * Requirements:
 * ------------
 * - WarmPath contract must be deployed
 * - Treasury timelock must have governance rights
 * - Address registry must contain correct WarmPath address
 */
async function install() {
  let { addrs } = initChain();

  // Warm path may have already been pre-installed, but install again to verify that
  // treasury resolutions are correctly enabled
  cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, addrs.warm, LP_PROXY_IDX]
  );
  let resolution: CrocProtocolCmd = {
    protocolCmd: cmd,
    callpath: BOOT_PROXY_IDX,
    sudo: true,
  };

  treasuryResolution(addrs, resolution, 30, "Install Warm path sidecar");
}

install();
