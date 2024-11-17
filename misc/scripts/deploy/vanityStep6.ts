/**
 * @title CrocSwapDex Timelock Contract Deployment Script
 * @notice Deploys and configures timelock contracts for each governance role
 * (Treasury, Operations, Emergency)
 *
 * @dev This is step 6 of the deployment process. It deploys timelock contracts that
 * serve as intermediaries between multisig wallets and protocol governance.
 *
 *
 * Technical Details:
 * ----------------
 * 1. Uses TimelockAccepts contract for each governance role
 * 2. Each timelock has a configured delay period (START_DELAY)
 * 3. Links each timelock to its respective multisig wallet
 * 4. Uses inflateAddr utility for standardized contract deployment
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads authority wallet
 * 2. Deploys timelocks for each role:
 *    - Treasury timelock: Controls treasury operations
 *    - Operations timelock: Controls protocol operations
 *    - Emergency timelock: Controls emergency functions
 * 3. Each timelock is configured with:
 *    - Delay period (START_DELAY)
 *    - Proposer (multisig wallet)
 *    - Executor (multisig wallet)
 *
 * Requirements:
 * ------------
 * - Multisig wallets must be deployed and addresses configured
 * - Authority wallet must have deployment permissions
 * - Address registry must contain correct multisig addresses
 *
 * State Changes:
 * -------------
 * - Deploys three new TimelockAccepts contracts
 * - Links each timelock to its respective multisig
 * - Updates address registry with new timelock addresses
 *
 * Gas Considerations:
 * -----------------
 * - Three separate deployment transactions
 * - Each deployment requires approximately 1,000,000 gas
 * - Total gas usage approximately 3,000,000
 *
 * Example usage:
 *
 * # Deploy timelocks on local hardhat network
 * npx hardhat run scripts/deploy/vanityStep6.ts --network localhost
 *
 * # Deploy timelocks on mainnet
 * npx hardhat run scripts/deploy/vanityStep6.ts --network mainnet
 *
 */

import { inflateAddr, initChain } from "../../libs/chain";

async function install() {
  let { addrs, wallet: authority } = initChain();

  const START_DELAY = 30;

  addrs.govern.timelockTreasury = (
    await inflateAddr(
      "TimelockAccepts",
      addrs.govern.timelockTreasury,
      authority,
      START_DELAY,
      [addrs.govern.multisigTreasury],
      [addrs.govern.multisigTreasury]
    )
  ).address;
  console.log(addrs);

  addrs.govern.timelockOps = (
    await inflateAddr(
      "TimelockAccepts",
      addrs.govern.timelockOps,
      authority,
      START_DELAY,
      [addrs.govern.multisigOps],
      [addrs.govern.multisigOps]
    )
  ).address;
  console.log(addrs);

  addrs.govern.timelockEmergency = (
    await inflateAddr(
      "TimelockAccepts",
      addrs.govern.timelockTreasury,
      authority,
      START_DELAY,
      [addrs.govern.multisigEmergency],
      [addrs.govern.multisigEmergency]
    )
  ).address;
  console.log(addrs);
}

install();
