import { Signer } from "ethers";
import { TimelockAccepts } from "../../typechain";
import { refContract } from "./chain";

export async function fetchTimelockDelay(
  timelockAddr: string,
  authority: Signer
) {
  const timelockInstance = (await refContract(
    "TimelockAccepts",
    timelockAddr,
    authority
  )) as TimelockAccepts;

  const timelockDelay = (
    await timelockInstance.callStatic.getMinDelay()
  ).toNumber();

  return timelockDelay;
}