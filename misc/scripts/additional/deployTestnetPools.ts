import { ethers } from "hardhat";
import { toSqrtPrice } from "../../../test/FixedPoint";
import { CrocQuery } from "../../../typechain/CrocQuery";
import { CrocProtocolCmd, INIT_TIMELOCK_DELAY, opsResolution, populateTimelockCalls, treasuryResolution } from '../../libs/governance';


async function createPool(query: CrocQuery, abiCoder: any, base: string, quote: string, price: number, poolIdx: number, estimate: boolean = false) {
    const [tokenA, tokenB] = base.toLowerCase() < quote.toLowerCase() 
        ? [base, quote] 
        : [quote, base];
    const priceValue = base.toLowerCase() < quote.toLowerCase() ? price : 1/price;

    const sqrtPrice = toSqrtPrice(priceValue);
    if (sqrtPrice.gt(ethers.constants.MaxUint256.shr(128))) {
        throw new Error("Price overflow uint128");
    }
    console.log(`sqrtPrice: ${sqrtPrice}`);
    console.log(`sqrtPrice.toString(): ${sqrtPrice.toString()}`);
    console.log(`tokenA: ${tokenA}`);
    console.log(`tokenB: ${tokenB}`);
    console.log(`poolIdx: ${poolIdx}`);

    const initPoolCmd = abiCoder.encode(
        ["uint8", "address", "address", "uint256", "uint128"],
        [71, tokenA, tokenB, poolIdx, sqrtPrice]
    );


    const poolExists = await query.callStatic.queryPoolParams(tokenA, tokenB, poolIdx);
    console.log("Pool query result:", poolExists);
    
    if (poolExists[0] === 0) {
        if (!estimate) {
            // Just execute the command directly since we're not using timelock
            const tx = await query.protocolCmd(initPoolCmd);
            await tx.wait();
            console.log("Pool created successfully");
        } else {
            console.log("Would create pool (estimate only)");
        }
    } else {
        console.log("Pool already exists, skipping creation");
    }
}

async function main() {
    const CONFIG = {
        query: "0xcd5f6Fa8d2f3DEAaf51b721dF0B109554D8853aF",
        QUERY: "0x248f259E685f6977C797E93c4FCC83cBE5556633",
        POOL_IDX: 420,
        ESTIMATE_ONLY: true,
        POOLS: [
            {
                base: "0x06298F71C039b592AE4389DE48223Efa11B0D80a",  // WETH
                quote: "0x0a456D68FFf40AED33579D43970968b07ac00FF0", // USDC
                price: 7864
            }
        ]
    };

    const query = await ethers.getContractAt("CrocQuery", CONFIG.QUERY) as CrocQuery;
    const abiCoder = new ethers.utils.AbiCoder();

    // Create pools sequentially
    for (const pool of CONFIG.POOLS) {
        await createPool(query, abiCoder, pool.base, pool.quote, pool.price, CONFIG.POOL_IDX, CONFIG.ESTIMATE_ONLY);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });