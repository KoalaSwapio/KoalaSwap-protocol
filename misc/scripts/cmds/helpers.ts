import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { CROC_ADDRS, CrocAddrs } from "../../constants/addrs";
import { RPC_URLS } from "../../constants/rpcs";
import { ethers, BytesLike, BigNumber } from "ethers";
import { CrocPolicy, TimelockAccepts } from "../../../typechain";
import chalk from "chalk";

interface TimelockCalls {
  timelockAddr: string;
  scheduleCalldata: string;
  execCalldata: string;
  delay: number;
  salt: BytesLike;
}

export interface CrocProtocolCmd {
  callpath: number;
  protocolCmd: BytesLike;
  sudo?: boolean;
}

export interface GovernanceResolution {
  resolutionType: "ops" | "treasury";
  protocolCmd: CrocProtocolCmd;
  multisigOrigin: string;
  policyContract: string;
  dexContract: string;
  timelockCall: TimelockCalls;
}

export function initProvider(chainId?: string): {
  addrs: CrocAddrs;
  provider: Provider;
  chainId: string;
} {
  chainId = chainId || process.env.CHAIN_ID || "mock";
  const addrs = CROC_ADDRS[chainId as keyof typeof CROC_ADDRS];
  const rpcUrl = RPC_URLS[chainId as keyof typeof RPC_URLS];
  const provider = new JsonRpcProvider(rpcUrl);
  return { addrs, provider, chainId };
}

export function initChain(chainId?: string): {
  wallet: ethers.Wallet;
  addrs: CrocAddrs;
  chainId: string;
} {
  chainId = chainId || process.env.CHAIN_ID || "mock";
  const addrs = CROC_ADDRS[chainId as keyof typeof CROC_ADDRS];
  const rpcUrl = RPC_URLS[chainId as keyof typeof RPC_URLS];
  const provider = new JsonRpcProvider(rpcUrl);
  const key = process.env.WALLET_KEY as string;
  const wallet = new ethers.Wallet(key.toLowerCase()).connect(provider);
  return { addrs, wallet, chainId };
}

export async function populateTimelockCalls(
  timelock: TimelockAccepts,
  target: string,
  calldata: string,
  delay: number
): Promise<TimelockCalls> {
  const salt = ethers.utils.hexZeroPad(
    BigNumber.from(Date.now()).toHexString(),
    32
  );

  let sched = await timelock.populateTransaction.schedule(
    target,
    0,
    calldata as BytesLike,
    ethers.constants.HashZero,
    salt,
    delay
  );
  let exec = timelock.populateTransaction.execute(
    target,
    0,
    calldata as BytesLike,
    ethers.constants.HashZero,
    salt
  );

  return {
    timelockAddr: timelock.address,
    scheduleCalldata: (await sched).data as string,
    execCalldata: (await exec).data as string,
    delay: delay,
    salt,
  };
}

export function printResolution (res: GovernanceResolution, tag: string): GovernanceResolution {
    console.log()
    console.log("-----")
    console.log(chalk.bold(chalk.yellow("Presenting instructions for governance resolution")))
    console.log()
    console.log("Description:", tag)
    console.log(`Execution instructions for ${res.resolutionType} resolution`)
    console.log()
    console.log(`Will execute a protocolCmd() call on CrocSwapDex contract at ${res.dexContract}`)
    console.log("protocolCmd() will be called with args: ", res.protocolCmd)
    console.log()
    console.log(chalk.blue(`Step 1: Use the Gnosis Safe at ${res.multisigOrigin}`))
    console.log(`Transaction to timelock contract at ${res.timelockCall.timelockAddr}`)
    console.log(`(Message value: 0)`)
    console.log(`With the following calldata: `)
    console.log(res.timelockCall.scheduleCalldata)
    console.log()
    console.log(chalk.blue(`Step 2: Wait at least ${res.timelockCall.delay}`))
    console.log(chalk.blue(`Use same Gnosis Safe at ${res.multisigOrigin}`))
    console.log(`Transaction to timelock contract at ${res.timelockCall.timelockAddr}`)
    console.log(`(Message value: 0)`)
    console.log(`With the following calldata: `)
    console.log(res.timelockCall.execCalldata)
    console.log("-----")
    return res
}

export async function treasuryResolution(
  addrs: CrocAddrs,
  cmd: CrocProtocolCmd,
  delay: number,
  tag: string
): Promise<GovernanceResolution> {
  const { wallet: authority } = initChain();
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

  let policyCall =
    await crocPolicyInstance.populateTransaction.treasuryResolution(
      addrs.dex,
      cmd.callpath,
      cmd.protocolCmd,
      cmd.sudo ? cmd.sudo : false
    );
  let timelockCalls = await populateTimelockCalls(
    timelockInstance,
    addrs.policy,
    policyCall.data as string,
    delay
  );

  return printResolution(
    {
      resolutionType: "treasury",
      protocolCmd: cmd,
      policyContract: addrs.policy,
      dexContract: addrs.dex,
      multisigOrigin: addrs.govern.multisigTreasury,
      timelockCall: await timelockCalls,
    },
    tag
  );
}
