/**
 * Returns the block explorer URL for a given address on a specific chain
 * @param chainId - The chain identifier (e.g., '0x1' for Ethereum mainnet)
 * @param address - The contract or wallet address to look up
 * @returns The complete block explorer URL for the given address
 * @throws {Error} If the chainId is not supported
 */
export function getExplorerUrl(chainId: string, address: string) {
    switch (chainId) {
        case '0xafa': return `https://explorer-holesky.morphl2.io/address/${address}`
        default: throw new Error(`Unsupported chainId: ${chainId}`)
    }
}