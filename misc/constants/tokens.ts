export interface Token {
    symbol: string;
    address: string;
}

// Morph Testnet Tokens
export const tokens: { [key: string]: Token } = {
    weth: {
        symbol: "WETH",
        address: "0x06298F71C039b592AE4389DE48223Efa11B0D80a"
    },
    wbtc: {
        symbol: "WBTC",
        address: "0x1cCcC8f89bDAd728FA184845D00ceFc7a962E7a1"
    },
    usdt: {
        symbol: "USDT",
        address: "0x199ac025884544207CF955E4c1D38CC60e8ba205"
    },
    usdc: {
        symbol: "USDC",
        address: "0x0a456D68FFf40AED33579D43970968b07ac00FF0"
    },
    dai: {
        symbol: "DAI",
        address: "0x2085e4dbB3dc9738f504e8eADA55712fA94Ec5F4"
    }
};
