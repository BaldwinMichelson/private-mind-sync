"use client";

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Contract } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { getContractAddress, CONTRACT_ABI } from '../config/contracts';
import { decryptDescription } from '../utils/crypto';
import { ethers } from 'ethers';

interface GoalDetailData {
  title: string;
  description: string;
  deadline: bigint;
  priority: number;
  progress: number;
  completedAt: bigint | null;
  isCompleted: boolean;
  createdAt: bigint;
}

export function GoalDetail({
  goalId,
  onBack,
  onUpdate,
}: {
  goalId: bigint;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const signerPromise = useEthersSigner();
  const { instance } = useZamaInstance();
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [goalData, setGoalData] = useState<GoalDetailData | null>(null);
  const [newProgress, setNewProgress] = useState('');
  const [updating, setUpdating] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (address && signerPromise) {
      loadGoal();
    }
  }, [goalId, address, signerPromise, chainId]);

  const loadGoal = async () => {
    if (!address || !signerPromise) {
      console.log('Waiting for address or signer...', { address: !!address, signer: !!signerPromise });
      return;
    }

    setLoading(true);
    try {
      const signer = await signerPromise;
      const contractAddress = getContractAddress(chainId);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const meta = await contract.getGoalMeta(goalId);
      const encryptedDescription = await contract.getEncryptedDescription(goalId);

      // Decrypt description (don't wait for instance if it's not ready)
      let description = '';
      try {
        const descriptionHex = ethers.hexlify(encryptedDescription);
        description = await decryptDescription(descriptionHex, address);
      } catch (decryptErr) {
        console.warn('Failed to decrypt description, using placeholder:', decryptErr);
        description = '[Encrypted description - decryption pending]';
      }

      setGoalData({
        title: meta[1],
        description,
        deadline: 0n, // Will be decrypted
        priority: 0, // Will be decrypted
        progress: 0, // Will be decrypted
        completedAt: null, // Will be decrypted
        isCompleted: meta[3],
        createdAt: meta[2],
      });
    } catch (err) {
      console.error('Failed to load goal:', err);
      alert('Failed to load goal details. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const decryptEncryptedFields = async () => {
    if (!address || !signerPromise || !instance || !goalData) return;

    setDecrypting(true);
    const signer = await signerPromise;
    const contractAddress = getContractAddress(chainId);
    const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

    const keypair = instance.generateKeypair();
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const contractAddresses = [contractAddress];

    const encDeadline = await contract.getEncryptedDeadline(goalId);
    const encPriority = await contract.getEncryptedPriority(goalId);
    const encProgress = await contract.getEncryptedProgress(goalId);

    const eip712 = instance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );

    let encCompletedAt: string | null = null;
    if (goalData.isCompleted) {
      encCompletedAt = await contract.getEncryptedCompletedAt(goalId);
    }

    const handleContractPairs = [
      { handle: encDeadline, contractAddress: contractAddress },
      { handle: encPriority, contractAddress: contractAddress },
      { handle: encProgress, contractAddress: contractAddress },
    ];

    if (encCompletedAt) {
      handleContractPairs.push({ handle: encCompletedAt, contractAddress: contractAddress });
    }

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      address,
      startTimeStamp,
      durationDays
    );

    const deadline = BigInt(result[encDeadline] || '0');
    const priority = Number(result[encPriority] || '0');
    const progress = Number(result[encProgress] || '0');

    let completedAt: bigint | null = null;
    if (encCompletedAt && result[encCompletedAt]) {
      completedAt = BigInt(result[encCompletedAt]);
    }

    setGoalData({
      ...goalData,
      deadline,
      priority,
      progress,
      completedAt,
    });
    setDecrypting(false);
  };

  const updateProgress = async () => {
    if (!address || !signerPromise || !instance || !newProgress) return;

    const progressNum = parseInt(newProgress);
    if (progressNum < 0 || progressNum > 100) {
      alert('Progress must be between 0 and 100');
      return;
    }

    setUpdating(true);
    try {
      const signer = await signerPromise;
      const contractAddress = getContractAddress(chainId);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const progressInput = instance.createEncryptedInput(contractAddress, address);
      progressInput.add8(progressNum);
      const encryptedProgress = await progressInput.encrypt();

      const tx = await contract.updateProgress(
        goalId,
        encryptedProgress.handles[0],
        encryptedProgress.inputProof
      );
      await tx.wait();

      setNewProgress('');
      
      // Optimistically update the progress in local state if we have goalData
      // This ensures the button state updates immediately
      if (goalData) {
        setGoalData({
          ...goalData,
          progress: progressNum,
        });
      }
      
      // Reload goal data to get updated progress from contract
      await loadGoal();
      // Decrypt fields to get the actual progress value from contract
      await decryptEncryptedFields();
      
      // Update the parent list to refresh the status (after decryption completes)
      onUpdate();
    } catch (err: any) {
      console.error('Failed to update progress:', err);
      alert(err?.message || 'Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const completeGoal = async () => {
    if (!address || !signerPromise || !instance) return;

    setCompleting(true);
    try {
      const signer = await signerPromise;
      const contractAddress = getContractAddress(chainId);
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const completedAt = BigInt(Math.floor(Date.now() / 1000));
      const completedAtInput = instance.createEncryptedInput(contractAddress, address);
      completedAtInput.add64(completedAt);
      const encryptedCompletedAt = await completedAtInput.encrypt();

      const tx = await contract.completeGoal(
        goalId,
        encryptedCompletedAt.handles[0],
        encryptedCompletedAt.inputProof
      );
      await tx.wait();

      await loadGoal();
      await decryptEncryptedFields();
      onUpdate();
    } catch (err: any) {
      console.error('Failed to complete goal:', err);
      alert(err?.message || 'Failed to complete goal');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading goal details...</div>;
  }

  if (!goalData) {
    return <div className="text-center py-8">Goal not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="btn mb-4"
        style={{ background: 'transparent', borderColor: 'var(--border)' }}
      >
        ← Back to Goals
      </button>

      <div className="modern-card">
        <h2 className="text-3xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #10b981 0%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {goalData.title}
        </h2>

        <div className="space-y-6 mb-6">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <p className="mt-2 text-gray-700 leading-relaxed">{goalData.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Created</label>
              <p className="text-gray-900 font-medium">
                {new Date(Number(goalData.createdAt) * 1000).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Status</label>
              <p className="mt-1">
                {goalData.isCompleted ? (
                  <span className="badge badge-success">✓ Completed</span>
                ) : (
                  <span className="badge badge-info">🔄 In Progress</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {!goalData.deadline && !decrypting && (
          <button
            onClick={decryptEncryptedFields}
            className="btn btn-primary"
          >
            🔓 Decrypt Details
          </button>
        )}

        {decrypting && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Decrypting encrypted fields...</p>
          </div>
        )}

        {goalData.deadline > 0n && (
          <div className="space-y-6 mt-8 border-t-2 pt-8 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-transparent rounded-lg border border-green-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Deadline</label>
                <p className="text-gray-900 font-semibold text-lg">
                  {new Date(Number(goalData.deadline) * 1000).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-transparent rounded-lg border border-yellow-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Priority</label>
                <p className="text-gray-900 font-semibold text-lg">{goalData.priority}/5</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</label>
                <span className="text-lg font-bold text-green-600">{goalData.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${goalData.progress}%`,
                    background: 'linear-gradient(90deg, #10b981 0%, #fbbf24 100%)'
                  }}
                />
              </div>
            </div>

            {goalData.completedAt && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Completed At</label>
                <p className="text-gray-900 font-semibold">
                  {new Date(Number(goalData.completedAt) * 1000).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {!goalData.isCompleted && (
              <div className="space-y-4 mt-8 border-t-2 pt-8 border-gray-200">
                <div className="form-group">
                  <label className="form-label">Update Progress (0-100)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => setNewProgress(e.target.value)}
                      className="form-input flex-1"
                      placeholder="Enter progress percentage"
                    />
                    <button
                      onClick={updateProgress}
                      disabled={updating || !newProgress}
                      className="btn btn-primary"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {updating ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          Updating...
                        </span>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>

                {/* Complete button is always visible, but only enabled when input value is 100 */}
                <div className="space-y-3">
                  {newProgress && parseInt(newProgress) === 100 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 text-center font-semibold">
                        🎉 Progress set to 100%! You can now mark this goal as completed.
                      </p>
                    </div>
                  )}
                  
                  {newProgress && parseInt(newProgress) < 100 && parseInt(newProgress) > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 text-center">
                        ⚠️ Input value: {newProgress}%. Set to 100% to enable completion.
                      </p>
                    </div>
                  )}

                  {(!newProgress || parseInt(newProgress) === 0) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 text-center">
                        ⚠️ Enter 100 in the progress field to enable completion.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={completeGoal}
                    disabled={completing || !newProgress || parseInt(newProgress) !== 100}
                    className="btn btn-success w-full"
                    style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
                    title={!newProgress || parseInt(newProgress) !== 100 ? `Input value must be 100%` : 'Ready to complete'}
                  >
                    {completing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Completing...
                      </span>
                    ) : !newProgress || parseInt(newProgress) !== 100 ? (
                      `✓ Mark as Completed (Input: ${newProgress || '0'}%, Requires 100%)`
                    ) : (
                      '✓ Mark as Completed'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

