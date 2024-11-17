/**
 * @title CrocSwapDex Periphery Contract Deployment Script
 * @notice Deploys and inflates all sidecar proxy contracts and periphery contracts for
 * the CrocSwapDex ecosystem
 *
 * @dev This is step 4 of the deployment process. It deploys all supporting contracts
 * needed for the full CrocSwap protocol functionality.
 *
 *
 * Technical Details:
 * ----------------
 * 1. Deploys and inflates multiple proxy path contracts for different trading types
 * 2. Deploys and inflates utility contracts for queries and impact calculations
 * 3. Uses inflateAddr utility for standardized contract deployment
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads authority wallet
 * 2. Deploys trading path contracts:
 *    - ColdPath: Cold storage operations
 *    - HotProxy: Hot wallet operations
 *    - KnockoutLiqPath: Knockout pool liquidity
 *    - KnockoutFlagPath: Knockout flag operations
 *    - LongPath: Long-term operations
 *    - MicroPaths: Micro transaction paths
 *    - WarmPath: Warm storage operations
 * 3. Deploys utility contracts:
 *    - CrocPolicy: Governance policy
 *    - CrocQuery: Protocol queries
 *    - CrocImpact: Price impact calculations
 *
 * Requirements:
 * ------------
 * - CrocSwapDex must be deployed (from step 2)
 * - Authority wallet must have necessary permissions
 * - Address registry must contain correct base addresses
 *
 * State Changes:
 * -------------
 * - Deploys multiple new proxy path contracts
 * - Deploys new utility contracts
 * - Outputs address registry with all new contract addresses
 * - @dev The address registry in misc/constants/addrs.ts must be manually updated
 *   with the new dex address for subsequent deployment steps
 *
 * Gas Considerations:
 * -----------------
 * - Multiple separate deployment transactions
 * - Each contract deployment requires its own gas allocation
 * - Total gas usage significant due to number of contracts
 *
 * Example usage:
 *
 * # Deploy periphery contracts on local hardhat network
 * npx hardhat run scripts/deploy/vanityStep4.ts --network localhost
 *
 * # Deploy periphery contracts on mainnet
 * npx hardhat run scripts/deploy/vanityStep4.ts --network mainnet
 *
 */
import { inflateAddr, initChain } from "../../libs/chain";

async function install() {
  let { addrs, wallet: authority } = initChain();

  addrs.cold = (await inflateAddr("ColdPath", addrs.cold, authority)).address;
  console.log(addrs);

  addrs.hot = (await inflateAddr("HotProxy", addrs.hot, authority)).address;
  console.log(addrs);

  addrs.knockout = (
    await inflateAddr("KnockoutLiqPath", addrs.knockout, authority)
  ).address;
  console.log(addrs);

  addrs.koCross = (
    await inflateAddr("KnockoutFlagPath", addrs.koCross, authority)
  ).address;
  console.log(addrs);

  addrs.long = (await inflateAddr("LongPath", addrs.long, authority)).address;
  console.log(addrs);

  addrs.micro = (
    await inflateAddr("MicroPaths", addrs.micro, authority)
  ).address;
  console.log(addrs);

  addrs.warm = (await inflateAddr("WarmPath", addrs.warm, authority)).address;
  console.log(addrs);

  addrs.policy = (
    await inflateAddr("CrocPolicy", addrs.policy, authority, addrs.dex)
  ).address;
  console.log(addrs);

  addrs.query = (
    await inflateAddr("CrocQuery", addrs.query, authority, addrs.dex)
  ).address;
  console.log(addrs);

  addrs.impact = (
    await inflateAddr("CrocImpact", addrs.impact, authority, addrs.dex)
  ).address;
  console.log(addrs);
}

install();
