import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import { useCallback } from 'react';
import { Contract } from 'ethers';
import { useEthersSigner } from './useEthersSigner';
import { getContractAddress, CONTRACT_ABI } from '../config/contracts';

export interface GoalMeta {
  id: bigint;
  owner: string;
  title: string;
  createdAt: bigint;
  isCompleted: boolean;
}

export function useGoals() {
  const { address } = useAccount();
  const chainId = useChainId();
  const signerPromise = useEthersSigner();

  return useQuery({
    queryKey: ['goals', address, chainId],
    queryFn: async (): Promise<GoalMeta[]> => {
      if (!address || !signerPromise) {
        throw new Error('Wallet not connected');
      }

      const signer = await signerPromise;
      const contractAddress = getContractAddress(chainId);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const goalIds = await contract.getGoalIdsByOwner(address);

      // Batch fetch optimization: use Promise.all to fetch all goals concurrently
      const goalsData = await Promise.all(
        goalIds.map(async (id: bigint) => {
          const meta = await contract.getGoalMeta(id);
          return {
            id,
            owner: meta[0],
            title: meta[1],
            createdAt: meta[2],
            isCompleted: meta[3],
          };
        })
      );

      // Sort by creation date, newest first
      return goalsData.sort((a, b) => Number(b.createdAt - a.createdAt));
    },
    enabled: !!address && !!signerPromise,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });
}

export function useRefreshGoals() {
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['goals', address, chainId] });
  }, [queryClient, address, chainId]);
}
