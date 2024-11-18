/**
 * @title CrocSwapDex Pool Configuration Script
 * @notice Sets initial pool parameters and standard pool template through operations
 * resolutions with timelock execution
 *
 * @dev Generates and outputs step-by-step instructions for executing pool
 * configuration commands through multisig and timelock contracts
 *
 *
 * Technical Details:
 * ----------------
 * 1. Formats encoded pool configuration commands
 * 2. Generates two separate operations resolutions:
 *    - Initial liquidity parameters
 *    - Standard pool template
 * 3. Provides complete calldata for timelock transactions
 *
 * Process Flow:
 * ------------
 * 1. Initializes provider and loads pool parameters
 * 2. Generates initial liquidity resolution:
 *    - Resolution type: operations
 *    - Target: CrocSwapDex
 *    - Command: Set initial liquidity
 *    - Step 1: Scheduling transaction
 *    - Step 2: Execution transaction
 * 3. Generates pool template resolution:
 *    - Resolution type: operations
 *    - Target: CrocSwapDex
 *    - Command: Set pool template
 *    - Step 1: Scheduling transaction
 *    - Step 2: Execution transaction
 *
 * Requirements:
 * ------------
 * - Valid pool parameters configuration
 * - Properly encoded protocol commands
 * - Valid contract addresses for:
 *   - CrocSwapDex
 *   - Operations multisig
 *   - Operations timelock
 *
 * State Changes:
 * -------------
 * - No direct state changes (output only)
 * - Generated instructions will lead to:
 *   1. Initial liquidity parameters being set
 *   2. Standard pool template being configured
 *
 * Output Format:
 * -------------
 * - Human-readable instructions for both resolutions
 * - Complete transaction details for all steps
 * - Encoded calldata ready for multisig use
 *
 * Example usage:
 * 
 * npx hardhat run misc/scripts/deploy/vanityStep9.ts --network localhost
 *
 * npx hardhat run misc/scripts/deploy/vanityStep9.ts --network mainnet
 *
 */

import {  initProvider } from '../../libs/chain';
import { INIT_TIMELOCK_DELAY, opsResolution } from '../../libs/governance';
import { initLiqCmd, poolStdTemplCmd } from '../../libs/pool';

/**
 * @notice Configures pool parameters through operations resolutions
 * 
 * Technical Details:
 * ----------------
 * 1. Uses operations timelock for execution
 * 2. Sets both initial liquidity and template parameters
 * 3. Executes through opsResolution with standard delay
 *
 * Process Flow:
 * ------------
 * 1. Initializes provider and loads parameters
 * 2. Creates initial liquidity resolution
 * 3. Creates pool template resolution
 * 4. Outputs execution instructions for both
 *
 * Requirements:
 * ------------
 * - Operations timelock must have governance rights
 * - Pool parameters must be properly configured
 * - Address registry must contain correct addresses
 */
async function install() {
    let { addrs, poolParams } = initProvider()

    let initCmd = initLiqCmd(poolParams)
    await opsResolution(addrs, initCmd, INIT_TIMELOCK_DELAY, "Set pool init liquidity")

    let templCmd = poolStdTemplCmd(poolParams)
    await opsResolution(addrs, templCmd, INIT_TIMELOCK_DELAY, "Set standard pool template")
}

install()

