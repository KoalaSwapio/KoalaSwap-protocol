import { MockERC20 } from "../../../../typechain/MockERC20";
import { ethers } from "hardhat";
import { Token } from "../../../constants/tokens";
import { CrocSwapDex } from "../../../../typechain";
import { BigNumber, ContractTransaction } from "ethers";

/**
 * @title Token Instance Helper
 * @notice Creates ERC20 contract instances from token objects
 * @dev Uses ethers contract factory to create MockERC20 instances for each token
 */
export async function tokenInstances(tokens: {
  [key: string]: Token;
}): Promise<{ [key: string]: MockERC20 }> {
  const factory = await ethers.getContractFactory("MockERC20");

  return Object.entries(tokens).reduce(
    (acc, [key, token]) => ({
      ...acc,
      [key]: factory.attach(token.address) as MockERC20,
    }),
    {} as { [key: string]: MockERC20 }
  );
}

/**
 * @title Dex Instance Helper
 * @notice Creates CrocSwapDex contract instance
 * @dev Uses ethers contract factory to create CrocSwapDex instance
 */
export async function dexInstance(dexAddr: string) {
  const factory = await ethers.getContractFactory("CrocSwapDex");
  const dex = factory.attach(dexAddr) as CrocSwapDex;

  return { dex };
}


export async function waitMine (tx: Promise<ContractTransaction>): Promise<ContractTransaction> {
  await (await tx).wait()
  return tx
}

export let override = { gasPrice: BigNumber.from("10").pow(9).mul(25), gasLimit: 1000000 }
 
