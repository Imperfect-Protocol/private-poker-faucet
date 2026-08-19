export const chainConfig = {
  key: 'sepolia',
  chainId: 421_614,
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  ppdcContractAddress: '0x59109780bbec4b2c96fa1f7990f777ad6ec78eea',
  pollingInterval: 6000,
  staleTime: 10000,
  faucetTransaction: {
    maxFeePerGas: 1_000_000_000n,
    maxPriorityFeePerGas: 10_000_000n,
  },
};
