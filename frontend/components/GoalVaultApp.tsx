"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { CreateGoal } from './CreateGoal';
import { GoalList } from './GoalList';

export function GoalVaultApp() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only checking connection status on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setActiveTab('list');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleTabChange = useCallback((tab: 'create' | 'list') => {
    setActiveTab(tab);
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
      <>
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0"></aside>
        <main className="flex-1 min-w-0 overflow-y-auto p-4 main-content-bg">
          <div className="modern-card text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #10b981 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Connect Your Wallet
            </h2>
            <p className="text-gray-600">
              Please connect your wallet to start managing your encrypted goals
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-2">
            <button
              onClick={() => handleTabChange('list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">📋</span>
              <span>My Goals</span>
            </button>
            <button
              onClick={() => handleTabChange('create')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">✨</span>
              <span>Create Goal</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 main-content-bg">
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-3xl mx-auto">
            <CreateGoal onSuccess={handleCreateSuccess} />
          </div>
        )}
        {activeTab === 'list' && (
          <div className="w-full">
            <GoalList refreshTrigger={refreshTrigger} />
          </div>
        )}
      </main>
    </>
  );
}

