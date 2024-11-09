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
 */
export async function makePoolFrom(
  dex: CrocSwapDex,
  tokenX: MockERC20,
  tokenY: MockERC20,
  price: number
) {
  try {
    let initPrice;
    let baseDecs = await tokenX.decimals();
    let quoteDecs = await tokenY.decimals();

    // Calculate price ratio considering token decimals
    let priceRatio = price * Math.pow(10, baseDecs - quoteDecs);

    // Order tokens by lexicographical order
    const { base, quote } = await orderTokens(tokenX, tokenY);

    // Symbols
    const baseSymbol = await tokenX.symbol();
    const quoteSymbol = await tokenY.symbol();

    // Addresses
    const baseAddress = base.address;
    const quoteAddress = quote.address;

    // Initialize price based on token order
    addrLessThan(base.address, quote.address)
      ? (initPrice = priceRatio)
      : (initPrice = 1.0 / priceRatio);

    // Confirmation details
    console.log(chalk.yellow("\n--- Pool Initialization Details ---"));
    console.log(chalk.blue("=== Pool Information ==="));
    console.log(`POOL_IDX:          ${POOL_IDX}`);
    // console.log(`Deflator:          ${deflator}`);
    console.log(`price Ratio:       ${initPrice}`);
    console.log(`Sqrt Price:        ${toSqrtPrice(initPrice)}\n`);
    console.log(chalk.blue("=== Token Details ==="));
    console.log(`Base Token Symbol:   ${baseSymbol}`);
    console.log(`Base Token Address:  ${baseAddress}`);
    console.log(`Quote Token Symbol:  ${quoteSymbol}`);
    console.log(`Quote Token Address: ${quoteAddress}\n`);

    // User confirmation
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Allow the user to confirm the details
    const getUserConfirmation = () => {
      return new Promise((resolve) => {
        readline.question(
          "Is the above data correct? (yes/no): ",
          (answer: string) => {
            readline.close();
            resolve(answer.toLowerCase() === "yes");
          }
        );
      });
    };

    // Get user confirmation
    const isConfirmed = await getUserConfirmation();
    if (!isConfirmed) {
      console.log(chalk.red("\n", "Operation cancelled by the user."));
      return;
    }

    // Encode the initialization command
    const initPoolCmd = ethers.utils.defaultAbiCoder.encode(
      ["uint8", "address", "address", "uint256", "uint128"],
      [71, baseAddress, quoteAddress, POOL_IDX, toSqrtPrice(initPrice)]
    );

    // send the initialization command
    const tx = await dex.userCmd(COLD_PROXY_IDX, initPoolCmd, {
      value: ethers.BigNumber.from(10).pow(15),
      gasLimit: await dex.estimateGas.userCmd(COLD_PROXY_IDX, initPoolCmd),
    });

    // Log the initialization details
    console.log(
      `Initializing ${baseSymbol}<->${quoteSymbol} pool with sqrtPrice: ${toSqrtPrice(
        initPrice
      ).toString()}...\n`
    );

    await tx.wait();

    // Log the transaction details
    console.log(chalk.blue("Transaction:", JSON.stringify(tx, null, 2), "\n"));

    console.log(chalk.green("Pool initialized successfully!"));
  } catch (error) {
    console.error(chalk.red("Error initializing pool:", error));
    throw error;
  }
}
