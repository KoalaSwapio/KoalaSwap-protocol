/**
 * @title CrocSwapDex Governance Transfer Script
 * @notice Transfers CrocPolicy control to the timelock contracts, establishing the
 * final governance structure
 *
 * @dev This is step 7 (final step) of the deployment process. It transfers control
 * of the CrocPolicy contract to the respective timelock contracts deployed in step 6.
 *
 *
 * Technical Details:
 * ----------------
 * 1. Transfers governance rights to three separate timelocks:
 *    - Operations timelock: Protocol parameter changes
 *    - Treasury timelock: Fee and treasury management
 *    - Emergency timelock: Critical security functions
 * 2. Uses CrocPolicy.transferGovernance() for the transfer
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads CrocPolicy contract
 * 2. Transfers governance rights to:
 *    - timelockOps: Operations control
 *    - timelockTreasury: Treasury control
 *    - timelockEmergency: Emergency control
 * 3. Verifies transfer completion
 *
 * Requirements:
 * ------------
 * - All timelock contracts must be deployed (from step 6)
 * - Authority wallet must still have control of CrocPolicy
 * - Address registry must contain correct timelock addresses
 *
 * State Changes:
 * -------------
 * - Transfers CrocPolicy control from authority to timelocks
 * - Establishes final governance structure
 * - Completes the deployment process
 *
 * Gas Considerations:
 * -----------------
 * - Single transaction for governance transfer
 * - Gas limit set to 1,000,000
 *
 * Example usage:
 *
 * # Transfer governance on local hardhat network
 * npx hardhat run scripts/deploy/vanityStep7.ts --network localhost
 *
 * # Transfer governance on mainnet
 * npx hardhat run scripts/deploy/vanityStep7.ts --network mainnet
 *
 */

import { initChain, refContract, traceContractTx } from "../../libs/chain";
import { CrocPolicy } from "../../../typechain";

const txArgs = { gasLimit: 1000000 };

async function install() {
  let { addrs, wallet: authority } = initChain();

  let policy = (await refContract(
    "CrocPolicy",
    addrs.policy,
    authority
  )) as CrocPolicy;
  await traceContractTx(
    policy.transferGovernance(
      addrs.govern.timelockOps,
      addrs.govern.timelockTreasury,
      addrs.govern.timelockEmergency,
      txArgs
    ),
    "Transfer CrocPolicy to Timelocks"
  );
}

install();
