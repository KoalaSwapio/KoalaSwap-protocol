
/**
 * @title CrocSwapDex Timelock Delay Configuration Script
 * @notice Sets the operational timelock delays for both operations and treasury
 * governance actions
 *
 * @dev Configures the standard delay periods that will be used for governance
 * actions after initial deployment period
 *
 *
 * Technical Details:
 * ----------------
 * 1. Sets operations timelock delay period
 * 2. Sets treasury timelock delay period
 * 3. Uses timelock contracts deployed in previous steps
 *
 * Process Flow:
 * ------------
 * 1. Initializes provider and loads timelock contracts
 * 2. Sets operations timelock delay:
 *    - Default: 2 days
 *    - Test: 2 minutes
 * 3. Sets treasury timelock delay:
 *    - Default: 2 days
 *    - Test: 2 minutes
 *
 * Requirements:
 * ------------
 * - Timelock contracts must be deployed
 * - Authority must have rights to set delays
 * - Address registry must contain correct timelock addresses
 *
 * State Changes:
 * -------------
 * - Updates operations timelock delay period
 * - Updates treasury timelock delay period
 *
 * Gas Considerations:
 * -----------------
 * - Two separate transactions
 * - Each delay setting requires ~100,000 gas
 *
 * Example usage:
 *
 * # Set timelock delays on local hardhat network
 * npx hardhat run misc/scripts/deploy/vanityStep11.ts --network localhost
 *
 * # Set timelock delays on mainnet
 * npx hardhat run misc/scripts/deploy/vanityStep11.ts --network mainnet
 *
 */
import { initProvider } from "../../libs/chain";
import {
  INIT_TIMELOCK_DELAY,
  opsTimelockSet,
  treasuryTimelockSet,
} from "../../libs/governance";

async function install() {
  let { addrs } = initProvider();

//   const timeDelay = 2 * 24 * 3600 // Two days
  const timeDelay = 30 // 30 seconds
  await opsTimelockSet(addrs, timeDelay, INIT_TIMELOCK_DELAY);
  await treasuryTimelockSet(addrs, timeDelay, INIT_TIMELOCK_DELAY);
}

install();
