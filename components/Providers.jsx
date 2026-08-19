"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { arbitrumSepolia } from '@reown/appkit/networks';
import { WagmiProvider, http } from 'wagmi';
import { CHAIN_ID, CHAIN_KEY, CHAIN_RPC_URL, CHAIN_STALE_TIME } from '@/lib/chain';
import { nitroDevNode } from '@/lib/nitroDevNode';

const projectId = 'fde97f2dd2d0616984b88e3250697e81';

function getNetwork() {
  if (CHAIN_KEY === 'devnode') return nitroDevNode;
  return arbitrumSepolia;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CHAIN_STALE_TIME,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const networks = [getNetwork()];
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports: {
    [CHAIN_ID]: http(CHAIN_RPC_URL),
  },
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Private Poker Faucet',
    description: 'Self-service PPDC test funding',
    url: 'https://imperfectprotocol.com',
    icons: [],
  },
  features: {
    analytics: true,
  },
});

export function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
