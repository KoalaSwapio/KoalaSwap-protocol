import { ethers } from "hardhat";
import { ColdPath, CrocSwapDex, MockERC20 } from "../../../../typechain";
import { POOL_IDX, COLD_PROXY_IDX } from "./config";
import { PRECISION, Q_64 } from "../../../../test/FixedPoint";
import { BigNumber } from "ethers";
import { Token } from "../../../constants/tokens";
import chalk from "chalk";

/**
 * @title Base Token Sorting Helper
 * @notice Sorts two tokens based on their addresses
 * @param tokenX - The first token
 * @param tokenY - The second token
 * @returns Token - The sorted token
 */
export function sortBaseToken(tokenX: MockERC20, tokenY: MockERC20): MockERC20 {
  return addrLessThan(tokenX.address, tokenY.address) ? tokenX : tokenY;
}

/**
 * @title Quote Token Sorting Helper
 * @notice Sorts two tokens based on their addresses
 * @param tokenX - The first token
 * @param tokenY - The second token
 * @returns Token - The sorted token
 */
export function sortQuoteToken(
  tokenX: MockERC20,
  tokenY: MockERC20
): MockERC20 {
  return addrLessThan(tokenX.address, tokenY.address) ? tokenY : tokenX;
}

/**
 * @title Address Comparison Helper
 * @notice Compares two addresses lexicographically
 * @param addrX - The first address
 * @param addrY - The second address
 * @returns boolean - True if addrX is less than addrY, false otherwise
 */
export function addrLessThan(addrX: string, addrY: string): boolean {
  return addrX.toLowerCase().localeCompare(addrY.toLowerCase()) < 0;
}

/**
 * @title Contract Instance Helper
 * @notice Creates ColdPath and CrocSwapDex contract instances
 * @dev Uses ethers contract factory to create ColdPath and CrocSwapDex instances
 */
export async function contractInstances(coldPathAddr: string, dexAddr: string) {
  const factory = await ethers.getContractFactory("ColdPath");
  const coldPath = factory.attach(coldPathAddr) as ColdPath;

  const dexFactory = await ethers.getContractFactory("CrocSwapDex");
  const dex = dexFactory.attach(dexAddr) as CrocSwapDex;

  return { coldPath, dex };
}

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
 * @notice Orders tokens for pool initialization
 * @dev Ensures consistent token ordering based on addresses
 */
export async function orderTokens(
  tokenX: MockERC20,
  tokenY: MockERC20
): Promise<{ base: MockERC20; quote: MockERC20 }> {
  const base = sortBaseToken(tokenX, tokenY);
  const quote = sortQuoteToken(tokenX, tokenY);
  return { base, quote };
}

export function toSqrtPrice(price: number) {
  let sqrtFixed = Math.round(Math.sqrt(price) * PRECISION);
  return BigNumber.from(sqrtFixed).mul(Q_64).div(PRECISION);
}


/**
 * @notice Initializes a pool
 * @param dex - The CrocSwapDex instance
 * @param tokenX - The first token
 * @param tokenY - The second token
 * @param price - The price to initialize the pool with. Use current price of tokenX. (No decimals)
 * @param isNativeEth - Whether the first token is native ETH
 */
export async function makePoolFrom(
  dex: CrocSwapDex,
  tokenX: MockERC20 | string,
  tokenY: MockERC20,
  price: number,
  isNativeEth: boolean = false
) {
  try {
    // Handle token contracts and decimals
    const tokenXContract = typeof tokenX === 'string' 
      ? (await ethers.getContractFactory("MockERC20")).attach(tokenX)
      : tokenX;
    
    const baseDecs = isNativeEth ? 18 : await tokenXContract.decimals();
    const quoteDecs = await tokenY.decimals();
    const priceRatio = price * Math.pow(10, baseDecs - quoteDecs);

    // Handle token ordering and symbols
    const baseAddress = isNativeEth ? ethers.constants.AddressZero : tokenXContract.address;
    const quoteAddress = tokenY.address;
    const baseSymbol = isNativeEth ? "ETH" : await tokenXContract.symbol();
    const quoteSymbol = await tokenY.symbol();

    // Calculate final price based on address ordering
    const initPrice = addrLessThan(baseAddress, quoteAddress) ? priceRatio : 1.0 / priceRatio;
    const sqrtPrice = toSqrtPrice(initPrice);

    // Display pool details
    console.log(chalk.yellow("\n--- Pool Initialization Details ---"));
    console.log(chalk.blue("=== Pool Information ==="));
    console.log(`POOL_IDX: ${POOL_IDX}`);
    console.log(`Price Ratio: ${initPrice}`);
    console.log(`Sqrt Price: ${sqrtPrice}\n`);
    console.log(chalk.blue("=== Token Details ==="));
    console.log(`Base Token: ${baseSymbol} (${baseAddress})`);
    console.log(`Quote Token: ${quoteSymbol} (${quoteAddress})\n`);

    // Get user confirmation
    const isConfirmed = await new Promise<boolean>((resolve) => {
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      readline.question("Is the above data correct? (yes/no): ", (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === "yes");
      });
    });

    if (!isConfirmed) {
      console.log(chalk.red("\nOperation cancelled by the user."));
      return;
    }

    // Initialize pool
    const initPoolCmd = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "address", "address", "uint256", "uint128"],
      [71, baseAddress, quoteAddress, POOL_IDX, sqrtPrice]
    );

    console.log(`\nInitializing ${baseSymbol}<->${quoteSymbol} pool...`);
    
    const tx = await dex.userCmd(COLD_PROXY_IDX, initPoolCmd, {
      value: ethers.utils.parseEther("0.00001"),
      gasLimit: 6000000,
    });

    await tx.wait();
    console.log(chalk.green("Pool initialized successfully!"));
    
  } catch (error) {
    console.error(chalk.red("Error initializing pool:", error));
    throw error;
  }
}
