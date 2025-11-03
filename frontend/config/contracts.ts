import { GoalVaultAddresses } from '../abi/GoalVaultAddresses';
import { GoalVaultABI } from '../abi/GoalVaultABI';

// Get contract address based on current chain ID
export function getContractAddress(chainId: number | undefined): string {
  if (!chainId) {
    // Default to hardhat local network
    return GoalVaultAddresses['31337'].address;
  }
  
  const chainIdStr = chainId.toString();
  const address = GoalVaultAddresses[chainIdStr as keyof typeof GoalVaultAddresses];
  
  if (!address || address.address === '0x0000000000000000000000000000000000000000') {
    // Fallback to hardhat if not deployed on current chain
    return GoalVaultAddresses['31337'].address;
  }
  
  return address.address;
}

// Note: CONTRACT_ADDRESS should be obtained dynamically using getContractAddress(chainId)
// This is kept for backward compatibility but should not be used directly
export const CONTRACT_ADDRESS = GoalVaultAddresses['31337'].address;

// Use the ABI from generated file
export const CONTRACT_ABI = GoalVaultABI.abi;

