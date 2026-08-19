import { createPublicClient, http } from 'viem';
import { CHAIN_ID, CHAIN_RPC_URL, CHAIN_KEY } from '@/lib/chain';
import { nitroDevNode } from '@/lib/nitroDevNode';

const arbitrumSepoliaChain = {
  id: 421_614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rollup.arbitrum.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: 'https://sepolia.arbiscan.io',
    },
  },
  testnet: true,
};

const chain = CHAIN_KEY === 'devnode' ? nitroDevNode : arbitrumSepoliaChain;

export const publicClient = createPublicClient({
  chain: {
    ...chain,
    id: CHAIN_ID,
  },
  transport: http(CHAIN_RPC_URL),
});
