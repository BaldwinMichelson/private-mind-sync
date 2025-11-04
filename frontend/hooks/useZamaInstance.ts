import { useFhevm } from '../fhevm/useFhevm';
import { useAccount, useChainId, useWalletClient } from 'wagmi';

export function useZamaInstance() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  
  // Use the project's internal useFhevm hook
  const { instance, status, error: fhevmError } = useFhevm({
    provider: walletClient as any,
    chainId: chainId || 31337,
    enabled: !!address,
    initialMockChains: {
      31337: 'http://localhost:8545',
    },
  });

  return {
    instance,
    isLoading: status === 'loading' || status === 'idle',
    error: fhevmError ? fhevmError.message : null,
  };
}

