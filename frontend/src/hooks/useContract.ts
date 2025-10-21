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

type VaultData = {
  id: bigint
  name: string
  goalAmount: bigint
  unlockTime: bigint
  depositedAmount: bigint
  withdrawnAmount: bigint
  isActive: boolean
  isCompleted: boolean
  completedAt: bigint
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

  const vaults = data?.map((result: any) => {
    if (result.status === 'success' && result.result) {
      const vaultData = result.result as VaultData
      
      return {
        id: Number(vaultData.id),
        name: vaultData.name,
        goalAmount: formatEther(vaultData.goalAmount),
        unlockTime: Number(vaultData.unlockTime),
        depositedAmount: formatEther(vaultData.depositedAmount),
        isActive: vaultData.isActive,
        isCompleted: vaultData.isCompleted,
        completedAt: Number(vaultData.completedAt),
      }
    }
    return null
  }).filter((vault): vault is NonNullable<typeof vault> => vault !== null) || []

  return {
    vaults,
    isLoading,
  }
}

export function useActiveAndCompletedVaults() {
  const { address } = useAccount()

  const { data: activeIds, isLoading: loadingActiveIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MyVaultABI,
    functionName: 'getActiveVaults',
    args: address ? [address] : undefined,
  })

  const { data: completedIds, isLoading: loadingCompletedIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MyVaultABI,
    functionName: 'getCompletedVaults',
    args: address ? [address] : undefined,
  })

  const allIds = [
    ...(activeIds || []),
    ...(completedIds || [])
  ]

  const contracts = allIds.map(id => ({
    address: CONTRACT_ADDRESS,
    abi: MyVaultABI,
    functionName: 'getVaultInfo',
    args: address ? [address, id] : undefined,
  } as const))

  const { data, isLoading: loadingVaults } = useReadContracts({
    contracts: contracts.length > 0 ? contracts : [],
  })

  const activeVaults = data?.slice(0, (activeIds || []).length).map((result: any, index: number) => {
    if (result.status === 'success' && result.result) {
      const vaultData = result.result as VaultData
      const vaultId = Number(activeIds![index])
      
      return {
        id: vaultId,
        name: vaultData.name,
        goalAmount: formatEther(vaultData.goalAmount),
        unlockTime: Number(vaultData.unlockTime),
        depositedAmount: formatEther(vaultData.depositedAmount),
        withdrawnAmount: formatEther(vaultData.withdrawnAmount),
        isActive: vaultData.isActive,
        isCompleted: vaultData.isCompleted,
        completedAt: Number(vaultData.completedAt),
      }
    }
    return null
  }).filter((vault): vault is NonNullable<typeof vault> => vault !== null) || []

  const completedVaults = data?.slice((activeIds || []).length).map((result: any, index: number) => {
    if (result.status === 'success' && result.result) {
      const vaultData = result.result as VaultData
      const vaultId = Number(completedIds![index])
      
      return {
        id: vaultId,
        name: vaultData.name,
        goalAmount: formatEther(vaultData.goalAmount),
        unlockTime: Number(vaultData.unlockTime),
        depositedAmount: formatEther(vaultData.depositedAmount),
        withdrawnAmount: formatEther(vaultData.withdrawnAmount),
        isActive: vaultData.isActive,
        isCompleted: vaultData.isCompleted,
        completedAt: Number(vaultData.completedAt),
      }
    }
    return null
  }).filter((vault): vault is NonNullable<typeof vault> => vault !== null) || []

  return {
    activeVaults,
    completedVaults,
    isLoading: loadingActiveIds || loadingCompletedIds || loadingVaults,
  }
}