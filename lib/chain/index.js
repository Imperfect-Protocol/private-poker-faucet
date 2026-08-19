import { chainConfig as devnodeChainConfig } from './devnode';
import { chainConfig as sepoliaChainConfig } from './sepolia';

const chainConfigs = {
  devnode: devnodeChainConfig,
  sepolia: sepoliaChainConfig,
};

const selectedChain = process.env.NEXT_PUBLIC_PRIVATE_POKER_CHAIN ?? 'sepolia';
const selectedChainKey = selectedChain.toLowerCase();

export const CHAIN_CONFIG = chainConfigs[selectedChainKey] ?? sepoliaChainConfig;
export const CHAIN_KEY = CHAIN_CONFIG.key;
export const CHAIN_ID = CHAIN_CONFIG.chainId;
export const CHAIN_RPC_URL = CHAIN_CONFIG.rpcUrl;
export const PPDC_CONTRACT_ADDRESS = CHAIN_CONFIG.ppdcContractAddress;
export const CHAIN_POLLING_INTERVAL = CHAIN_CONFIG.pollingInterval;
export const CHAIN_STALE_TIME = CHAIN_CONFIG.staleTime;
export const FAUCET_TRANSACTION_CONFIG = CHAIN_CONFIG.faucetTransaction ?? {};
