import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = dirname(fileURLToPath(import.meta.url));
const devnodeProxyTarget = process.env.PRIVATE_POKER_DEVNODE_RPC_URL ?? 'http://localhost:8547';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: appRoot,
    resolveAlias: {
      accounts: './lib/stubs/accounts.js',
    },
  },
  webpack(config) {
    config.resolve.alias.accounts = `${appRoot}/lib/stubs/accounts.js`;
    return config;
  },
  async rewrites() {
    if ((process.env.NEXT_PUBLIC_PRIVATE_POKER_CHAIN ?? 'sepolia').toLowerCase() !== 'devnode') {
      return [];
    }

    return [
      {
        source: '/local-rpc',
        destination: devnodeProxyTarget,
      },
    ];
  },
};

export default nextConfig;
