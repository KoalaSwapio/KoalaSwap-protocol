import { CrocPolicy, TimelockAccepts } from "../../../../typechain";
import { task } from "hardhat/config";
import { initChain, populateTimelockCalls } from "../helpers";
import chalk from "chalk";

/**
 * @notice This script is used to perform an emergency halt on the CrocSwapDex.
 *
 * @summary An out-of-band emergency measure to protect funds in the CrocSwapDex
 *          contract in case of a security issue. It works by disabling all the proxy
 *          contracts in CrocSwapDex (and disabling swap()'s in the hotpath), besides
 *          the "warm path" proxy. The warm path only includes functionality for flat
 *          mint, burn and harvest calls. An emergency halt would therefore allow LPs
 *          to withdraw their at-rest capital, while reducing the attack radius by
 *          disabling swaps and more complex long-form orders.
 *
 * @dev These calls can be batched if the delay is currently set to 0.
 *
 * @requires multisigTreasury to be the tx origin
 *
 * @requires process.env.CHAIN_ID to be exposed to the script
 * @requires process.env.WALLET_KEY to be exposed to the script
 * @requires proper RPC URL to be exposed to the script (see RPC_URLS in constants/rpcs.ts)
 *
 * @readonly Tx Flow:
 * - multisigTreasury -> timelockTreasury
 * - timelockTreasury -> CrocPolicy.sol
 *
 * @readonly Confirmation:
 * - After execution of the emergency halt, the hotpath will be disabled and safemode will be enabled. This can be verified by looking at the logs. Run this additional script to confirm.
 * - npx hardhat run misc/scripts/cmds/fetchOperationalStatus.ts --network sepolia
 *
 * @example usage: npx hardhat emergencyHalt --reason <reason> --network <network>
 */

task("emergencyHalt", "Perform an emergency halt on the CrocSwapDex.")
  .addOptionalParam("reason", "Reason for emergency halt")
  .setAction(async (taskArgs) => {
    const reason = taskArgs.reason;
    await emergencyHalt(reason);
  });

const emergencyHalt = async (reason: string): Promise<void> => {
  const { addrs, wallet: authority } = initChain();

  const multisigAddr = addrs.govern.multisigTreasury;
  const timelockAddr = addrs.govern.timelockTreasury;

  /**
   * @notice Prepare contract instances
   */
  let timelockFactory = await hre.ethers.getContractFactory("TimelockAccepts");
  timelockFactory.connect(authority);

  let crocPolicyFactory = await hre.ethers.getContractFactory("CrocPolicy");
  crocPolicyFactory.connect(authority);

  const timelockInstance = timelockFactory.attach(
    timelockAddr
  ) as TimelockAccepts;
  const crocPolicyInstance = crocPolicyFactory.attach(
    addrs.policy
  ) as CrocPolicy;

  /**
   * @notice Fetch the current time-lock min delay
   *
   * @dev If this returns 0, then the calls can be batched
   */
  const currentDelay = (
    await timelockInstance.callStatic.getMinDelay()
  ).toNumber();
  console.log(`Current ops timelock delay: ${currentDelay}`);

  /**
   * @notice Generate the calldata for the emergency halt method
   */
  const emergencyHaltCall =
    await crocPolicyInstance.populateTransaction.emergencyHalt(
      addrs.dex,
      reason
    );

  /**
   * @notice Prepare the resolution Instructions
   *
   * @dev We are not calling the `treasuryResolution` function because it will prepare and forward calls to a chosen proxy. We are calling `populateTimelockCalls` to generate the calldata that will be called directly on the `CrocPolicy` contract
   */
  const timelockCalls = await populateTimelockCalls(
    timelockInstance,
    addrs.policy,
    emergencyHaltCall.data as string,
    currentDelay
  );

  console.log();
  console.log("----");
  console.log(chalk.bold(chalk.yellow("Presenting instructions enabling emergency halt")));
  console.log();
  console.log(`Description: Halts the dex and disables proxy interaction`);
  console.log(`Execution instructions`);
  console.log();
  console.log(chalk.blue(`Step 1: Use the Gnosis Safe at ${multisigAddr}`));
  console.log(`Transaction to timelock contract at ${timelockAddr}`);
  console.log(`(Message value: 0)`);
  console.log(`With the following calldata: `);
  console.log(timelockCalls.scheduleCalldata);
  console.log();
  console.log(chalk.blue(`Step 2: Wait at least ${timelockCalls.delay}`));
  console.log(chalk.blue(`Use same Gnosis Safe at ${multisigAddr}`));
  console.log(
    `Transaction to timelock contract at ${timelockCalls.timelockAddr}`
  );
  console.log(`(Message value: 0)`);
  console.log(`With the following calldata: `);
  console.log(timelockCalls.execCalldata);
  console.log("-----");
};
