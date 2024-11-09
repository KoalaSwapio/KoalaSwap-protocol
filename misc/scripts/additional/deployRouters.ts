import { ethers } from "hardhat";

async function main() {
    // Get network specific DEX address
    const NETWORK = await ethers.provider.getNetwork();
    const DEX_ADDRESSES: { [key: number]: string } = {
        // Mainnet
        1: "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688",
        // Scroll
        534352: "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688"
    };

    const dexAddress = DEX_ADDRESSES[NETWORK.chainId];
    if (!dexAddress) {
        throw new Error(`No DEX address configured for network ${NETWORK.chainId}`);
    }

    // Deploy Router
    console.log("Deploying CrocSwapRouter...");
    const RouterFactory = await ethers.getContractFactory("CrocSwapRouter");
    const router = await RouterFactory.deploy(dexAddress);
    await router.deployed();

    console.log(`CrocSwapRouter deployed to: ${router.address}`);

    // Optional: Deploy RouterBypass
    console.log("Deploying CrocSwapRouterBypass...");
    const RouterBypassFactory = await ethers.getContractFactory("CrocSwapRouterBypass");
    const routerBypass = await RouterBypassFactory.deploy(dexAddress);
    await routerBypass.deployed();

    console.log(`CrocSwapRouterBypass deployed to: ${routerBypass.address}`);

    // Verify contracts on Etherscan (if applicable)
    if (NETWORK.chainId === 1 || NETWORK.chainId === 534352) {
        console.log("Verifying contracts on Etherscan...");
        await hre.run("verify:verify", {
            address: router.address,
            constructorArguments: [dexAddress],
        });
        
        await hre.run("verify:verify", {
            address: routerBypass.address,
            constructorArguments: [dexAddress],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });