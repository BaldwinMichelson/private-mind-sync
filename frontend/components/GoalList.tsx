"use client";

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Contract } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { getContractAddress, CONTRACT_ABI } from '../config/contracts';
import { decryptDescription } from '../utils/crypto';
import { GoalDetail } from './GoalDetail';

interface GoalMeta {
  id: bigint;
  owner: string;
  title: string;
  createdAt: bigint;
  isCompleted: boolean;
}

export function GoalList({ refreshTrigger }: { refreshTrigger: number }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const signerPromise = useEthersSigner();
  const { instance } = useZamaInstance();
  const [goals, setGoals] = useState<GoalMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<bigint | null>(null);

  useEffect(() => {
    loadGoals();
  }, [address, refreshTrigger, chainId]);

  const loadGoals = async () => {
    if (!address || !signerPromise) return;

    setLoading(true);
    try {
      const signer = await signerPromise;
      const contractAddress = getContractAddress(chainId);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);
      const goalIds = await contract.getGoalIdsByOwner(address);

      const goalsData: GoalMeta[] = [];
      const batchSize = 10;
      for (let i = 0; i < goalIds.length; i += batchSize) {
        const batch = goalIds.slice(i, i + batchSize);
        const batchPromises = batch.map(async (id: bigint) => {
          const meta = await contract.getGoalMeta(id);
          return {
            id,
            owner: meta[0],
            title: meta[1],
            createdAt: meta[2],
            isCompleted: meta[3],
          };
        });
        const batchResults = await Promise.all(batchPromises);
        goalsData.push(...batchResults);
      }

      setGoals(goalsData.sort((a, b) => Number(b.createdAt - a.createdAt)));
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Loading goals...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎯</div>
        <div className="empty-title">No Goals Yet</div>
        <div className="empty-subtitle">Create your first encrypted goal to get started!</div>
      </div>
    );
  }

  if (selectedGoalId !== null) {
    return (
      <GoalDetail
        goalId={selectedGoalId}
        onBack={() => setSelectedGoalId(null)}
        onUpdate={loadGoals}
      />
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div
          key={goal.id.toString()}
          className="goal-card"
          onClick={() => setSelectedGoalId(goal.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2 text-gray-900">{goal.title}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📅</span>
                <span>Created: {new Date(Number(goal.createdAt) * 1000).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {goal.isCompleted ? (
                <span className="badge badge-success">
                  ✓ Completed
                </span>
              ) : (
                <span className="badge badge-info">
                  🔄 In Progress
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

