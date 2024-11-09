import { ethers } from "hardhat";

async function main() {
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    
    // Deploy mock tokens
    console.log("Deploying Mock Tokens...");
    
    const mockWBTC = await MockERC20Factory.deploy();
    await mockWBTC.deployed();
    await mockWBTC.setDecimals(8);
    await mockWBTC.setSymbol("WBTC");
    console.log("Mock WBTC deployed to:", mockWBTC.address);
    
    const mockUSDT = await MockERC20Factory.deploy();
    await mockUSDT.deployed();
    await mockUSDT.setDecimals(6);
    await mockUSDT.setSymbol("USDT");
    console.log("Mock USDT deployed to:", mockUSDT.address);
    
    const mockUSDC = await MockERC20Factory.deploy();
    await mockUSDC.deployed();
    await mockUSDC.setDecimals(6);
    await mockUSDC.setSymbol("USDC");
    console.log("Mock USDC deployed to:", mockUSDC.address);
    
    const mockDAI = await MockERC20Factory.deploy();
    await mockDAI.deployed();
    await mockDAI.setDecimals(18);
    await mockDAI.setSymbol("DAI");
    console.log("Mock DAI deployed to:", mockDAI.address);

    const mockWETH = await MockERC20Factory.deploy();
    await mockWETH.deployed();
    await mockWETH.setDecimals(18);
    await mockWETH.setSymbol("WETH");
    console.log("Mock WETH deployed to:", mockWETH.address);

    // Fund tokens to deployer
    const [deployer] = await ethers.getSigners();
    const mintAmount = ethers.utils.parseEther("1000000"); // 1M tokens

    await mockWBTC.deposit(deployer.address, mintAmount);
    await mockUSDT.deposit(deployer.address, mintAmount);
    await mockUSDC.deposit(deployer.address, mintAmount);
    await mockDAI.deposit(deployer.address, mintAmount);
    await mockWETH.deposit(deployer.address, mintAmount);

    console.log("Tokens minted to:", deployer.address);

    // Verify contracts if on supported network
    const network = await ethers.provider.getNetwork();
    if (network.chainId === 2810 || network.chainId === 17000) { // MorphTest or MorphMain
        console.log("Verifying contracts...");
        await hre.run("verify:verify", {
            address: mockWBTC.address,
            constructorArguments: [],
        });
        await hre.run("verify:verify", {
            address: mockUSDT.address,
            constructorArguments: [],
        });
        await hre.run("verify:verify", {
            address: mockUSDC.address,
            constructorArguments: [],
        });
        await hre.run("verify:verify", {
            address: mockDAI.address,
            constructorArguments: [],
        });
        await hre.run("verify:verify", {
            address: mockWETH.address,
            constructorArguments: [],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });