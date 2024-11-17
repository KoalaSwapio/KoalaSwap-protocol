import { SAFE_MODE_PROXY_PATH } from "../../../constants/addrs";
import { AbiCoder } from "@ethersproject/abi";
import { BytesLike } from "ethers";
import { task } from "hardhat/config";
import { initChain, CrocProtocolCmd, treasuryResolution } from "../helpers";
import { TimelockAccepts } from "../../../../typechain";

/**
 * @notice This script is used to restore operations on the CrocSwapDex.
 *
 * @summary This will revert the actions perform by the emergency halt. It will
 *          enable the hotpath and disable the safemode.
 *
 * @dev These calls can be batched if the delay is currently set to 0.
 *
 * @requires multisigTreasury to be the tx origin
 *
 * @requires process.env.CHAIN_ID to be exposed to the script
 * @requires process.env.WALLET_KEY to be exposed to the script
* @requires proper RPC URL to be exposed to the script (see RPC_URLS in constants/rpcs.ts)
 *
 * @requires safeModePath.sol to be deployed and the proxy to be installed.
 *
 * @readonly Tx Flow:
 * - multisigTreasury -> timelockTreasury
 * - timelockTreasury -> safeModePath.sol
 *
 * @example usage: npx hardhat restoreOperations --network <network>
 *
 * @confirmation After restoring operations run:
 * - npx hardhat run misc/scripts/cmds/fetchOperationalStatus.ts --network sepolia.
 *
 */

task("restoreOperations", "Restore operations on the CrocSwapDex.").setAction(
  async () => {
    await restoreOperations();
  }
);

const restoreOperations = async (): Promise<void> => {
  const { addrs, wallet: authority } = initChain(); // Sepolia
  const abi = new AbiCoder();

  const timelockAddr = addrs.govern.timelockTreasury;

  const HOT_OPEN_CODE = 22;
  const SAFE_MODE_CODE = 23;

  /**
   * @notice Prepare contract instances
   */
  let timelockFactory = await hre.ethers.getContractFactory("TimelockAccepts");
  timelockFactory.connect(authority);

  const timelockInstance = timelockFactory.attach(
    timelockAddr
  ) as TimelockAccepts;

  const currentDelay = (
    await timelockInstance.callStatic.getMinDelay()
  ).toNumber();
  console.log(`Current ops timelock delay: ${currentDelay}`);

  /**
   * @notice Encode the protocol cmds for the hotpath and safemode methods
   */
  const encodeHotPathCode = abi.encode(
    ["uint8", "bool"],
    [HOT_OPEN_CODE, true]
  ) as BytesLike;

  console.log("encodeHotPathCode", encodeHotPathCode);

  const encodeSafeModeCode = abi.encode(
    ["uint8", "bool"],
    [SAFE_MODE_CODE, false]
  ) as BytesLike;

  console.log("encodeSafeModeCode", encodeSafeModeCode);

  /**
   * @notice Prepare the resolution payloads
   */
  let hotPathResolution: CrocProtocolCmd = {
    protocolCmd: encodeHotPathCode,
    callpath: SAFE_MODE_PROXY_PATH,
    sudo: true,
  };

  console.log("hotPathResolution", hotPathResolution);

  let safeModeResolution: CrocProtocolCmd = {
    protocolCmd: encodeSafeModeCode,
    callpath: SAFE_MODE_PROXY_PATH,
    sudo: true,
  };

  console.log("safeModeResolution", safeModeResolution);

  /**
   * @notice Generate the resolution instructions
   */
  await treasuryResolution(
    addrs,
    hotPathResolution,
    currentDelay,
    "Enable Hot Path"
  );

  await treasuryResolution(
    addrs,
    safeModeResolution,
    currentDelay,
    "Disable Safe Mode"
  );
};
