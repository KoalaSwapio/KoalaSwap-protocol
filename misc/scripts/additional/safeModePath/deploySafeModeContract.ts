import {
    BOOT_PROXY_IDX,
    SAFE_MODE_PROXY_PATH,
  } from "../../../constants/addrs";
  import {
    inflateAddr,
    initChain,
  } from "../../../libs/chain";
  import { AbiCoder } from "@ethersproject/abi";
  import { CrocProtocolCmd, treasuryResolution } from "../../../libs/governance";
  import { fetchTimelockDelay } from "../../../libs/timelockDelay";

  // example usage: npx hardhat run misc/scripts/additional/safeModePath/deploySafeModeContract.ts --network <network>
  
  const abi = new AbiCoder();
  
  async function install() {
    let { addrs, chainId, wallet: authority } = initChain();
  
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
  