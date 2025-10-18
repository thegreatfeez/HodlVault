import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { MyVaultABI, CONTRACT_ADDRESS } from '../config/Contract'
import { formatEther } from 'viem'

export function useUserVaultCount() {
  const { address } = useAccount()

  const { data: vaultCount, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MyVaultABI,
    functionName: 'userVaultCount',
    args: address ? [address] : undefined,
  })

  return {
    vaultCount: vaultCount ? Number(vaultCount) : 0,
    isLoading,
    error
  }
}

function getVaultName(userAddress: string, vaultId: number): string {
  const key = `vaultNames_${userAddress}`;
  const names = JSON.parse(localStorage.getItem(key) || "{}");
  return names[vaultId] || `Vault #${vaultId}`;
}

type VaultData = {
  id: bigint
  goalAmount: bigint
  unlockTime: bigint
  depositedAmount: bigint
  isActive: boolean
}

export function useUserVaults() {
  const { address } = useAccount()
  const { vaultCount } = useUserVaultCount()

  const contracts = []
  for (let i = 0; i < vaultCount; i++) {
    contracts.push({
      address: CONTRACT_ADDRESS,
      abi: MyVaultABI,
      functionName: 'getVaultInfo',
      args: address ? [address, i] : undefined,
    } as const)
  }

  const { data, isLoading } = useReadContracts({
    contracts: contracts.length > 0 ? contracts : [],
  })

  const vaults = data?.map((result: any, index: number) => {
    if (result.status === 'success' && result.result) {
      const vaultData = result.result as VaultData
      
      return {
        id: Number(vaultData.id),
        name: address ? getVaultName(address, index) : `Vault #${index}`,
        goalAmount: formatEther(vaultData.goalAmount),
        unlockTime: Number(vaultData.unlockTime),
        depositedAmount: formatEther(vaultData.depositedAmount),
        isActive: vaultData.isActive,
      }
    }
    return null
  }).filter((vault): vault is NonNullable<typeof vault> => vault !== null) || []

  return {
    vaults,
    isLoading,
  }
}