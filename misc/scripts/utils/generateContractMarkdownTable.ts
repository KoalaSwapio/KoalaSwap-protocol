/**
 * @title Contract Address Table Generator
 * @notice Creates a markdown table listing all deployed contract names and addresses
 * for a specified chain
 *
 * @dev Fetches contract names using contract interfaces and ethers
 * 
 * example usage: npx hardhat run misc/scripts/utils/generateContractMarkdownTable.ts --network <network>
 */

import { ethers } from 'ethers';
import { CROC_ADDRS } from '../../constants/addrs';

// ABI fragments for name() function
const nameAbi = ["function name() view returns (string)"];

function getExplorerUrl(chainId: keyof typeof CROC_ADDRS, address: string) {
    switch (chainId) {
        case '0xafa': return `https://explorer-holesky.morphl2.io/address/${address}`
        default: throw new Error(`Unsupported chainId: ${chainId}`)
    }
}

async function generateTable() {
    // Setup provider
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
        throw new Error('RPC_URL environment variable not set');
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Get chainId
    const network = await provider.getNetwork();
    const chainId = ('0x' + network.chainId.toString(16)) as keyof typeof CROC_ADDRS;

    // Get addresses for chain
    const addresses = CROC_ADDRS[chainId];
    if (!addresses) {
        throw new Error(`No addresses found for chain ${chainId}`);
    }

    // Generate table header
    console.log('| Contract Name | Address |');
    console.log('|--------------|---------|');

    // Add each contract
    for (const [key, value] of Object.entries(addresses)) {
        if (value !== '' && key !== 'govern') {  // Skip govern as it's handled separately
            try {
                // Try to get contract name
                const contract = new ethers.Contract(value, nameAbi, provider);
                let contractName;
                try {
                    contractName = await contract.name();
                } catch (e) {
                    // If name() call fails, use the key as fallback
                    contractName = key;
                }
                console.log(`| [${key}](${getExplorerUrl(chainId, value)}) | ${value} |`);
            } catch (e) {
                // If contract interaction fails, use key as fallback
                console.log(`| [${key}](${getExplorerUrl(chainId, value)}) | ${value} |`);
            }
        }
    }

    // Add governance contracts
    if (addresses.govern) {
        for (const [key, value] of Object.entries(addresses.govern)) {
            if (value !== '') {
                try {
                    const contract = new ethers.Contract(value, nameAbi, provider);
                    let contractName;
                    try {
                        contractName = await contract.name();
                    } catch (e) {
                        contractName = `govern.${key}`;
                    }
                    console.log(`| [govern.${key}](${getExplorerUrl(chainId, value)}) | ${value} |`);
                } catch (e) {
                    console.log(`| [govern.${key}](${getExplorerUrl(chainId, value)}) | ${value} |`);
                }
            }
        }
    }
}

generateTable()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });