export const chainConfig = {
  key: 'devnode',
  chainId: 412_346,
  rpcUrl: '/local-rpc',
  ppdcContractAddress: '0xab8e440727a38bbb180f7032ca4a8009e7b52b80',
  pollingInterval: 3000,
  staleTime: 5000,
  faucetTransaction: {
    maxFeePerGas: 1_000_000_000n,
    maxPriorityFeePerGas: 10_000_000n,
  },
};
