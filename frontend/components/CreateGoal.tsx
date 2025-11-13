"use client";

import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Contract } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { getContractAddress, CONTRACT_ABI } from '../config/contracts';
import { encryptDescription } from '../utils/crypto';
import { ethers } from 'ethers';

export function CreateGoal({ onSuccess }: { onSuccess: () => void }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { instance, isLoading: zamaLoading } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retry function for FHE encryption operations
  const retryEncrypt = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 5,
    delay: number = 2000
  ): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`[CreateGoal] Encryption attempt ${i + 1}/${maxRetries}...`);
        return await operation();
      } catch (error: any) {
        lastError = error;
        const errorMsg = error?.message || '';
        const errorString = JSON.stringify(error, null, 2);
        
        console.error(`[CreateGoal] Encryption attempt ${i + 1} failed:`, {
          error: errorMsg,
          fullError: errorString,
          chainId,
        });
        
        // If it's a relayer error, wait and retry
        if (errorMsg.includes('Relayer') || 
            errorMsg.includes('backend connection') ||
            errorMsg.includes('Transaction rejected') ||
            errorMsg.includes('Failed to check contract code') ||
            errorString.includes('Relayer') ||
            errorString.includes('backend connection')) {
          if (i < maxRetries - 1) {
            const waitTime = delay * (i + 1); // Progressive delay: 2s, 4s, 6s, 8s
            console.log(`[CreateGoal] Retrying in ${waitTime}ms... (attempt ${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        } else {
          // For other errors, don't retry
          console.error('[CreateGoal] Non-retryable error:', error);
          throw error;
        }
      }
    }
    console.error('[CreateGoal] All retry attempts failed');
    throw lastError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance || !address || !signerPromise) {
      setError('Missing wallet or encryption instance');
      return;
    }
    if (!title.trim() || !description.trim() || !deadline) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const validateInputs = () => {
      if (title.length > 100) {
        throw new Error('Title must be less than 100 characters');
      }
      if (description.length > 1000) {
        throw new Error('Description must be less than 1000 characters');
      }
    };

    try {
      validateInputs();
      // Get contract address for current network
      const contractAddress = getContractAddress(chainId);
      
      // Validate contract address
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error(`Contract not deployed on network (Chain ID: ${chainId}). Please deploy the contract first.`);
      }

      // Validate FHEVM instance
      if (!instance || typeof instance.createEncryptedInput !== 'function') {
        throw new Error('FHEVM instance is not properly initialized. Please refresh the page.');
      }

      // Verify contract exists on chain before attempting encryption
      // This helps catch issues early before Relayer tries to verify
      console.log('[CreateGoal] Verifying contract exists on chain...', {
        chainId,
        contractAddress,
        address,
      });

      try {
        const signer = await signerPromise;
        const provider = signer.provider;
        if (provider) {
          const code = await provider.getCode(contractAddress);
          if (!code || code === '0x') {
            throw new Error(`Contract does not exist at address ${contractAddress} on chain ${chainId}. Please deploy the contract first.`);
          }
          console.log('[CreateGoal] Contract verified on chain, code length:', code.length);
        }
      } catch (verifyError: any) {
        console.error('[CreateGoal] Contract verification failed:', verifyError);
        throw new Error(`Contract verification failed: ${verifyError.message}. Please ensure the contract is deployed at ${contractAddress} on Sepolia.`);
      }

      console.log('[CreateGoal] Starting encryption...', {
        chainId,
        contractAddress,
        address,
        hasInstance: !!instance,
      });

      // Encrypt description
      const encryptedDescription = await encryptDescription(description, address);
      const encryptedDescriptionBytes = ethers.getBytes(encryptedDescription);

      // Convert deadline to timestamp
      const deadlineTimestamp = BigInt(Math.floor(new Date(deadline).getTime() / 1000));
      const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
      if (deadlineTimestamp < currentTimestamp) {
        throw new Error('Deadline must be in the future');
      }
      const priorityNum = parseInt(priority);
      if (priorityNum < 1 || priorityNum > 5) {
        throw new Error('Priority must be between 1 and 5');
      }

      // Encrypt deadline and priority with FHE (with retry)
      console.log('[CreateGoal] Encrypting deadline...');
      const encryptedDeadline = await retryEncrypt(async () => {
        const deadlineInput = instance.createEncryptedInput(contractAddress, address);
        deadlineInput.add64(deadlineTimestamp);
        return await deadlineInput.encrypt();
      }, 5, 2000); // Increase retries and initial delay for Sepolia

      console.log('[CreateGoal] Encrypting priority...');
      const encryptedPriority = await retryEncrypt(async () => {
        const priorityInput = instance.createEncryptedInput(contractAddress, address);
        priorityInput.add8(priorityNum);
        return await priorityInput.encrypt();
      }, 5, 2000);

      // Submit to contract
      const signer = await signerPromise;
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer);

      const tx = await contract.createGoal(
        title,
        encryptedDescriptionBytes,
        encryptedDeadline.handles[0],
        encryptedPriority.handles[0],
        encryptedDeadline.inputProof,
        encryptedPriority.inputProof
      );
      await tx.wait();

      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('3');
      onSuccess();
    } catch (err: any) {
      console.error('[CreateGoal] Error creating goal:', err);
      
      // Extract detailed error information
      const errorMessage = err?.message || 'Failed to create goal';
      const errorString = JSON.stringify(err, null, 2);
      const isRelayerError = errorMessage.includes('Relayer') || 
                           errorMessage.includes('backend connection') ||
                           errorString.includes('Relayer') ||
                           errorString.includes('backend connection');
      
      // Handle FHEVM Relayer errors with more context
      let userFriendlyMessage = errorMessage;
      
      if (isRelayerError || errorMessage.includes('Failed to check contract code') || errorMessage.includes('backend connection task has stopped')) {
        const contractAddr = getContractAddress(chainId);
        userFriendlyMessage = `⚠️ Sepolia Relayer Service Issue

The Zama Relayer service on Sepolia testnet is experiencing backend connection issues. This is a known limitation of the testnet Relayer service.

Contract: ${contractAddr} (verified ✓)
Chain: Sepolia (${chainId})

This error occurs when:
- Relayer backend connection task stops during contract code verification
- The Relayer service may be temporarily unavailable or overloaded

Options:
1. Wait 1-2 minutes and try again (service may recover)
2. Use Hardhat Local network for testing (more reliable)
3. Check Zama's status page for service updates

Note: This is a Relayer service issue, not a problem with your contract or code.`;
      } else if (errorMessage.includes('Transaction rejected')) {
        userFriendlyMessage = `Transaction rejected by Relayer: ${errorMessage}`;
      } else if (errorMessage.includes('timeout') || errorMessage.includes('time out')) {
        userFriendlyMessage = 'Operation timed out. The Relayer service may be overloaded.';
      } else if (errorMessage.includes('not deployed') || errorMessage.includes('does not exist')) {
        userFriendlyMessage = errorMessage;
      }
      
      console.error('[CreateGoal] Full error details:', {
        message: errorMessage,
        chainId,
        contractAddress: getContractAddress(chainId),
        address,
        error: errorString,
      });
      
      setError(userFriendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (zamaLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Loading encryption service...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-group">
        <label className="form-label">Goal Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          placeholder="e.g., Learn Solidity, Build a dApp, Run a Marathon"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
          rows={4}
          placeholder="Describe your goal in detail. This will be encrypted and stored securely."
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="form-input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">The deadline will be encrypted using FHE</p>
      </div>

      <div className="form-group">
        <label className="form-label">Priority Level (1-5)</label>
        <input
          type="number"
          min="1"
          max="5"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="form-input"
          placeholder="1 = Low, 5 = High"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Priority will be encrypted using FHE</p>
      </div>

             {error && (
               <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                 <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2">
                     <span>⚠️</span>
                     <span className="font-semibold">Error creating goal</span>
                   </div>
                   <p className="text-sm ml-6">{error}</p>
                   {(error.includes('Relayer') || error.includes('backend connection') || error.includes('backend connection task')) && (
                     <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded text-orange-800 text-sm">
                       <p className="font-semibold mb-2">⚠️ Sepolia Relayer Service Issue</p>
                       <p className="mb-2">This is a known issue with Zama's Sepolia Relayer service. The backend connection task stops during contract verification.</p>
                       <div className="mt-2 p-2 bg-white rounded border border-orange-300">
                         <p className="font-semibold mb-1">Recommended Solutions:</p>
                         <ol className="list-decimal list-inside space-y-1 ml-1">
                           <li><strong>Wait 1-2 minutes</strong> and retry - the service may recover</li>
                           <li><strong>Switch to Hardhat Local</strong> for testing (Chain ID: 31337) - uses local mock relayer</li>
                           <li>Check if this is a temporary service outage</li>
                         </ol>
                       </div>
                       <p className="mt-2 text-xs text-orange-700">
                         Note: Your contract is correctly deployed. This is a Relayer service limitation, not a code issue.
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full"
        style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Creating Goal...
          </span>
        ) : (
          '✨ Create Goal'
        )}
      </button>
    </form>
  );
}

