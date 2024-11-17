/**
 * @title CrocSwapDex SafeMode Path Installation Script
 * @notice Installs the SafeMode proxy path into CrocSwapDex through treasury
 * resolution
 *
 * @dev Generates and outputs step-by-step instructions for installing the SafeMode
 * path through multisig and timelock execution
 *
 *
 * Technical Details:
 * ----------------
 * 1. Uses protocol command 21 for proxy installation
 * 2. Targets SAFE_MODE_PROXY_PATH index
 * 3. Executes through treasury timelock with delay
 *
 * Process Flow:
 * ------------
 * 1. Initializes chain connection and loads contracts
 * 2. Deploys SafeMode path contract
 * 3. Encodes installation command:
 *    - Command: 21 (Install proxy)
 *    - Target: SafeMode address
 *    - Index: SAFE_MODE_PROXY_PATH
 * 4. Submits treasury resolution
 *
 * Requirements:
 * ------------
 * - CrocSwapDex must be deployed
 * - Treasury timelock must have governance rights
 * - Authority wallet must have deployment permissions
 *
 * State Changes:
 * -------------
 * - Deploys new SafeMode path contract
 * - Will install SafeMode proxy after timelock delay
 *
 * Gas Considerations:
 * -----------------
 * - Initial deployment transaction (~2,000,000 gas)
 * - Resolution creation (~1,000,000 gas)
 * - Additional gas needed for eventual execution
 *
 * Example usage:
 *
 * # Install SafeMode path on local hardhat network
 * npx hardhat run misc/scripts/deploy/vanityStep11.ts --network localhost
 *
 * # Install SafeMode path on mainnet
 * npx hardhat run misc/scripts/deploy/vanityStep11.ts --network mainnet
 *
 */

import { BOOT_PROXY_IDX, SAFE_MODE_PROXY_PATH } from "../../constants/addrs";
import { inflateAddr, initChain } from "../../libs/chain";
import { AbiCoder } from "@ethersproject/abi";
import { CrocProtocolCmd, treasuryResolution } from "../../libs/governance";
import { fetchTimelockDelay } from "../../libs/timelockDelay";

const abi = new AbiCoder();

async function install() {
  let { addrs, wallet: authority } = initChain();

  // Deploy safe mode contract
  const safeAddr = (await inflateAddr("SafeModePath", "", authority)).address;
  console.log("safeAddr", safeAddr);

  const currentDelay = await fetchTimelockDelay(
    addrs.govern.timelockTreasury,
    authority
  );

  // Install safe mode proxy
  const cmd = abi.encode(
    ["uint8", "address", "uint16"],
    [21, safeAddr, SAFE_MODE_PROXY_PATH]
  );
  let resolution: CrocProtocolCmd = {
    protocolCmd: cmd,
    callpath: BOOT_PROXY_IDX,
    sudo: true,
  };

  treasuryResolution(
    addrs,
    resolution,
    currentDelay,
    "Install Safe path sidecar"
  );
}

install();
