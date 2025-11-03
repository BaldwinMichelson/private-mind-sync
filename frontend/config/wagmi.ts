import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { http } from 'wagmi';

// Define Hardhat Local network with correct chainId (31337)
const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'GoalVault',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [hardhatLocal, sepolia],
  ssr: false,
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(),
  },
});

