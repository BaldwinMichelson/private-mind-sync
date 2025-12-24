"use client";

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useGoals, useRefreshGoals, type GoalMeta } from '../hooks/useGoals';
import { GoalDetail } from './GoalDetail';

interface GoalListProps {
  refreshTrigger: number;
}

// Memoized GoalCard component to prevent unnecessary re-renders
const GoalCard = memo(({ 
  goal, 
  onClick 
}: { 
  goal: GoalMeta; 
  onClick: (id: bigint) => void;
}) => {
  const formattedDate = useMemo(
    () => new Date(Number(goal.createdAt) * 1000).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    [goal.createdAt]
  );

  const handleClick = useCallback(() => {
    onClick(goal.id);
  }, [goal.id, onClick]);

  return (
    <div className="goal-card" onClick={handleClick}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2 text-gray-900">{goal.title}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span>📅</span>
            <span>Created: {formattedDate}</span>
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
  );
});

GoalCard.displayName = 'GoalCard';

// Loading skeleton component
const GoalListSkeleton = memo(() => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="goal-card animate-pulse">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
});

GoalListSkeleton.displayName = 'GoalListSkeleton';

export function GoalList({ refreshTrigger }: GoalListProps) {
  const { data: goals = [], isLoading, error } = useGoals();
  const refreshGoals = useRefreshGoals();
  const [selectedGoalId, setSelectedGoalId] = useState<bigint | null>(null);

  // Refresh goals when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshGoals();
    }
  }, [refreshTrigger, refreshGoals]);

  const handleGoalClick = useCallback((id: bigint) => {
    setSelectedGoalId(id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedGoalId(null);
  }, []);

  const handleUpdate = useCallback(() => {
    refreshGoals();
  }, [refreshGoals]);

  if (isLoading) {
    return <GoalListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">Failed to load goals</p>
          <p className="text-sm mt-2">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
        <button
          onClick={() => refreshGoals()}
          className="btn btn-primary"
        >
          Retry
        </button>
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
        onBack={handleBack}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id.toString()}
          goal={goal}
          onClick={handleGoalClick}
        />
      ))}
    </div>
  );
}

