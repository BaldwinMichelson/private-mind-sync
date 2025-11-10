"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CreateGoal } from './CreateGoal';
import { GoalList } from './GoalList';

export function GoalVaultApp() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only checking connection status on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="modern-card text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #10b981 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Connect Your Wallet
          </h2>
          <p className="text-gray-600">
            Please connect your wallet to start managing your encrypted goals
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="modern-card">
        <div className="tab-navigation">
          <div className="tab-nav">
            <button
              className={`tab-button ${activeTab === 'create' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('create')}
            >
              ✨ Create Goal
            </button>
            <button
              className={`tab-button ${activeTab === 'list' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('list')}
            >
              📋 My Goals
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'create' && (
            <CreateGoal
              onSuccess={() => {
                setActiveTab('list');
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          )}
          {activeTab === 'list' && (
            <GoalList refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </div>
  );
}

