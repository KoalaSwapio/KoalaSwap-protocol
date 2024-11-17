import { SAFE_MODE_PROXY_PATH } from "../../../constants/addrs";
import { AbiCoder } from "@ethersproject/abi";
import { BytesLike } from "ethers";
import { task } from "hardhat/config";
import { initChain, CrocProtocolCmd, treasuryResolution } from "../helpers";
import { TimelockAccepts } from "../../../../typechain";


 // example usage: npx hardhat disableSafeMode --network <network>
 

task("disableSafeMode", "Disable safe mode on the CrocSwapDex.").setAction(
  async () => {
    await disableSafeMode();
  }
);

const disableSafeMode = async (): Promise<void> => {
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
  console.log(`Current treasury timelock delay: ${currentDelay}`);

  // 1. Disable safe mode first
  const safeModeDisableCmd = abi.encode(
    ["uint8", "bool"],
    [SAFE_MODE_CODE, false]
  ) as BytesLike;

  await treasuryResolution(
    addrs,
    {
      protocolCmd: safeModeDisableCmd,
      callpath: SAFE_MODE_PROXY_PATH,
      sudo: true,
    },
    currentDelay,
    "Disable Safe Mode"
  );
};
