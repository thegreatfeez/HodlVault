import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useUserVaults } from "../hooks/useContract";
import { useWriteContract, useAccount, usePublicClient, useWatchContractEvent, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MyVaultABI, CONTRACT_ADDRESS } from '../config/Contract';
import SuccessAlert from '../components/SuccessAlert';
import ErrorAlert from '../components/ErrorAlert';

interface Transaction {
  hash: string;
  timestamp: number;
  amount: string;
  type: 'deposit' | 'withdraw';
}

const VaultDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { vaults, isLoading } = useUserVaults();
  const { address } = useAccount();
  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();
  const publicClient = usePublicClient();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const vault = vaults.find(v => v.id === Number(id));

  const { data: contractProgress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MyVaultABI,
    functionName: 'getProgressPercentage',
    args: address && vault ? [address, BigInt(vault.id)] : undefined,
  });

  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw' | 'reactivate' | null>(null);
  const hasFetchedRef = useRef(false);

  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newDuration, setNewDuration] = useState(0);

  const depositedAmount = Number(vault?.depositedAmount || 0);
  const isWithdrawn = vault?.isCompleted && depositedAmount === 0;

  useEffect(() => {
    // Stop countdown if vault is withdrawn
    if (isWithdrawn) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isWithdrawn]);

  useEffect(() => {
    if (isConfirmed && transactionType) {
      if (transactionType === 'deposit') {
        setSuccessMessage('Deposit successful! Your vault has been updated.');
      } else if (transactionType === 'withdraw') {
        setSuccessMessage('Withdrawal successful! ETH has been sent to your wallet.');
      } else if (transactionType === 'reactivate') {
        setSuccessMessage('Vault reactivated successfully!');
      }
      setShowSuccess(true);
      setTransactionType(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [isConfirmed, transactionType]);

  useEffect(() => {
    if (writeError) {
      const message = writeError.message.includes('User rejected')
        ? 'Transaction was rejected.'
        : writeError.message.includes('insufficient funds')
        ? 'Insufficient funds for transaction.'
        : writeError.message.includes('VaultMustBeCompleted')
        ? 'Vault must be completed before reactivation.'
        : writeError.message.includes('VaultMustBeEmpty')
        ? 'Vault must be empty before reactivation.'
        : 'Transaction failed. Please try again.';
      
      setErrorMessage(message);
      setShowError(true);
    }
  }, [writeError]);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MyVaultABI,
    eventName: 'DepositMade',
    onLogs(logs) {
      logs.forEach((log: any) => {
        if (log.args.user === address && Number(log.args.vaultId) === vault?.id) {
          const newTx: Transaction = {
            hash: log.transactionHash,
            timestamp: Math.floor(Date.now() / 1000),
            amount: formatEther(log.args.amount),
            type: 'deposit'
          };
          setTransactions(prev => [newTx, ...prev].slice(0, 5));
        }
      });
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MyVaultABI,
    eventName: 'Withdrawn',
    onLogs(logs) {
      logs.forEach((log: any) => {
        if (log.args.user === address && Number(log.args.vaultId) === vault?.id) {
          const newTx: Transaction = {
            hash: log.transactionHash,
            timestamp: Math.floor(Date.now() / 1000),
            amount: formatEther(log.args.amount),
            type: 'withdraw'
          };
          setTransactions(prev => [newTx, ...prev].slice(0, 5));
        }
      });
    },
  });

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!publicClient || !address || !vault || hasFetchedRef.current) return;

      const cacheKey = `txs_${address}_${vault.id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedTxs = JSON.parse(cached);
          if (Date.now() - cachedTxs.timestamp < 60000) {
            setTransactions(cachedTxs.data);
            return;
          }
        } catch {}
      }

      setLoadingTxs(true);
      hasFetchedRef.current = true;

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(1000);

        const [depositLogs, withdrawLogs] = await Promise.all([
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: {
              type: 'event',
              name: 'DepositMade',
              inputs: [
                { type: 'address', name: 'user', indexed: true },
                { type: 'uint256', name: 'vaultId', indexed: true },
                { type: 'uint256', name: 'amount', indexed: false },
                { type: 'uint256', name: 'totalSaved', indexed: false },
                { type: 'uint256', name: 'timestamp', indexed: false },
                { type: 'uint256', name: 'remainingToGoal', indexed: false }
              ]
            },
            args: {
              user: address,
              vaultId: BigInt(vault.id)
            },
            fromBlock,
            toBlock: 'latest'
          }).catch(() => []),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: {
              type: 'event',
              name: 'Withdrawn',
              inputs: [
                { type: 'address', name: 'user', indexed: true },
                { type: 'uint256', name: 'vaultId', indexed: true },
                { type: 'uint256', name: 'amount', indexed: false },
                { type: 'uint256', name: 'timestamp', indexed: false }
              ]
            },
            args: {
              user: address,
              vaultId: BigInt(vault.id)
            },
            fromBlock,
            toBlock: 'latest'
          }).catch(() => [])
        ]);

        const allLogs = [...depositLogs, ...withdrawLogs];

        if (allLogs.length === 0) {
          setTransactions([]);
          setLoadingTxs(false);
          return;
        }

        const recentLogs = allLogs.slice(-5).reverse();

        const txs: Transaction[] = await Promise.all(
          recentLogs.map(async (log) => {
            try {
              const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
              const isDeposit = depositLogs.some(dl => dl.transactionHash === log.transactionHash);
              
              return {
                hash: log.transactionHash,
                timestamp: Number(block.timestamp),
                amount: formatEther((log.args as any).amount),
                type: isDeposit ? 'deposit' : 'withdraw' as const
              };
            } catch {
              const isDeposit = depositLogs.some(dl => dl.transactionHash === log.transactionHash);
              return {
                hash: log.transactionHash,
                timestamp: Math.floor(Date.now() / 1000),
                amount: formatEther((log.args as any).amount),
                type: isDeposit ? 'deposit' : 'withdraw' as const
              };
            }
          })
        );

        setTransactions(txs);

        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: txs
        }));

      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoadingTxs(false);
      }
    };

    const timer = setTimeout(fetchRecentTransactions, 500);
    return () => clearTimeout(timer);
  }, [publicClient, address, vault]);

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) {
      setErrorMessage('Please enter a valid amount.');
      setShowError(true);
      return;
    }

    if (!address) {
      setErrorMessage('Please connect your wallet first.');
      setShowError(true);
      return;
    }

    try {
      const depositAmount = parseEther(amount);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MyVaultABI,
        functionName: 'deposit',
        args: [BigInt(vault!.id)],
        value: depositAmount,
      });

      setTransactionType('deposit');
      setAmount('');
    } catch (error) {
      setErrorMessage('Invalid amount. Please check your input.');
      setShowError(true);
    }
  }

  function handleWithdraw() {
    if (!address) {
      setErrorMessage('Please connect your wallet first.');
      setShowError(true);
      return;
    }

    if (!vault) {
      setErrorMessage('Vault not found.');
      setShowError(true);
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MyVaultABI,
        functionName: 'withdraw',
        args: [BigInt(vault.id)],
      });

      setTransactionType('withdraw');
    } catch (error) {
      setErrorMessage('Withdrawal failed. Please try again.');
      setShowError(true);
    }
  }

  function handleReactivateSubmit() {
    if (!newGoalAmount || Number(newGoalAmount) <= 0) {
      setErrorMessage('Please enter a valid goal amount.');
      setShowError(true);
      return;
    }

    if (newDuration <= 0) {
      setErrorMessage('Please enter a valid lock duration.');
      setShowError(true);
      return;
    }

    try {
      const goalAmountInWei = parseEther(newGoalAmount);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MyVaultABI,
        functionName: 'reactivateVault',
        args: [BigInt(vault!.id), goalAmountInWei, BigInt(newDuration)],
      });

      setTransactionType('reactivate');
      setShowReactivateModal(false);
      setNewGoalAmount('');
      setNewDuration(0);
    } catch (error) {
      setErrorMessage('Failed to reactivate vault. Please try again.');
      setShowError(true);
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const openTransaction = (hash: string) => {
    window.open(`https://sepolia.basescan.org/tx/${hash}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 flex items-center justify-center">
        <p className="text-gray-400">Vault not found</p>
      </div>
    );
  }

  const goalAmount = Number(vault.goalAmount);
  const progressPercentage = contractProgress ? Number(contractProgress) : (goalAmount > 0 ? (depositedAmount / goalAmount) * 100 : 0);

  const unlockDate = new Date(vault.unlockTime * 1000);
  const timeRemaining = unlockDate.getTime() - currentTime;

  // Show 0 for all time values when withdrawn
  const daysRemaining = isWithdrawn ? 0 : Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = isWithdrawn ? 0 : Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutesRemaining = isWithdrawn ? 0 : Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));
  const secondsRemaining = isWithdrawn ? 0 : Math.max(0, Math.floor((timeRemaining % (1000 * 60)) / 1000));

  const timeProgress = timeRemaining > 0 ? 0 : 100;
  const canWithdraw = (progressPercentage >= 100 || timeProgress >= 100) && depositedAmount > 0;
  const canReactivate = vault.isCompleted && depositedAmount === 0;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const isProcessing = isPending || isConfirming;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      {showSuccess && (
        <SuccessAlert
          message={successMessage}
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showError && (
        <ErrorAlert
          message={errorMessage}
          isVisible={showError}
          onClose={() => setShowError(false)}
        />
      )}

      {showReactivateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur rounded-2xl border border-slate-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">Reactivate Vault</h2>
            <p className="text-slate-400 mb-6">Set a new goal and duration for this vault.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">New Goal Amount (ETH)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={newGoalAmount}
                  onChange={(e) => setNewGoalAmount(e.target.value)}
                  placeholder="0.5"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">New Lock Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={newDuration || ""}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  placeholder="90"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReactivateModal(false);
                  setNewGoalAmount('');
                  setNewDuration(0);
                }}
                disabled={isProcessing}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateSubmit}
                disabled={isProcessing}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing && transactionType === 'reactivate' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isConfirming ? 'Confirming...' : 'Reactivating...'}
                  </>
                ) : (
                  "Reactivate Vault"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2">{vault.name}</h1>
              <p className="text-slate-400 text-lg">Your personal ETH savings dashboard.</p>
            </div>
            {canReactivate && (
              <button
                onClick={() => setShowReactivateModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                🔄 Reactivate Vault
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <svg className="transform -rotate-90" width="140" height="140">
                    <circle
                      cx="70"
                      cy="70"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={`transition-all duration-500 ${isWithdrawn ? 'text-green-500' : 'text-blue-500'}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isWithdrawn ? (
                      <span className="text-xl font-bold text-green-400">Withdrawn</span>
                    ) : (
                      <span className="text-3xl font-bold">{Math.round(progressPercentage)}%</span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">Vault Status</h2>
                  <p className="text-slate-300 mb-4">
                    Total Saved: <span className={`font-bold ${isWithdrawn ? 'text-slate-500' : 'text-white'}`}>
                      {isWithdrawn ? '-' : `${depositedAmount.toFixed(4)} ETH`}
                    </span> of {goalAmount.toFixed(4)} ETH goal
                  </p>
                  <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                        isWithdrawn ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-blue-400'
                      }`}
                      style={{ width: isWithdrawn ? '100%' : `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold mb-6">
                {isWithdrawn ? 'Time Locked' : 'Time Remaining'}
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${isWithdrawn ? 'text-slate-500' : 'text-blue-400'}`}>
                    {daysRemaining}
                  </div>
                  <div className="text-slate-400">Days</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${isWithdrawn ? 'text-slate-500' : 'text-blue-400'}`}>
                    {hoursRemaining.toString().padStart(2, '0')}
                  </div>
                  <div className="text-slate-400">Hours</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${isWithdrawn ? 'text-slate-500' : 'text-blue-400'}`}>
                    {minutesRemaining.toString().padStart(2, '0')}
                  </div>
                  <div className="text-slate-400">Minutes</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${isWithdrawn ? 'text-slate-500' : 'text-blue-400'}`}>
                    {secondsRemaining.toString().padStart(2, '0')}
                  </div>
                  <div className="text-slate-400">Seconds</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold mb-4">Vault Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Vault ID</span>
                  <span className="font-semibold">#{vault.id}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Goal Amount</span>
                  <span className="font-semibold">{goalAmount.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Current Balance</span>
                  <span className={`font-semibold ${isWithdrawn ? 'text-slate-500' : 'text-blue-400'}`}>
                    {isWithdrawn ? '-' : `${depositedAmount.toFixed(4)} ETH`}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Unlock Date</span>
                  <span className="font-semibold">{unlockDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-semibold ${
                    isWithdrawn ? 'text-green-400' : 
                    vault.isActive ? 'text-green-400' : 
                    vault.isCompleted ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isWithdrawn ? 'Withdrawn' : vault.isActive ? 'Active' : vault.isCompleted ? 'Completed' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Can Withdraw</span>
                  <span className={`font-semibold ${canWithdraw ? 'text-green-400' : isWithdrawn ? 'text-slate-500' : 'text-yellow-400'}`}>
                    {isWithdrawn ? 'Already Withdrawn' : canWithdraw ? 'Yes' : 'Not Yet'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold mb-6">Recent Transactions (Last 5)</h2>
              {loadingTxs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-slate-400 text-sm">Loading...</p>
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No transactions yet. Make your first deposit!</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.hash}
                      onClick={() => openTransaction(tx.hash)}
                      className="flex justify-between items-center py-3 px-4 hover:bg-slate-700/30 cursor-pointer transition-colors rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-slate-300 text-sm">{formatDate(tx.timestamp)}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toFixed(4)} ETH
                        </div>
                        <div className="text-xs text-slate-500 mt-1 capitalize">{tx.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {vault.isActive && !vault.isCompleted && (
              <>
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
                  <h2 className="text-2xl font-bold mb-2">Deposit ETH</h2>
                  <p className="text-slate-400 mb-6">Add funds to your savings vault.</p>
                  
                  <div className="mb-6">
                    <label className="block text-sm text-slate-400 mb-2">Amount (ETH)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.0001"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isProcessing}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <button 
                    onClick={handleDeposit}
                    disabled={isProcessing}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    {isProcessing && transactionType === 'deposit' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isConfirming ? 'Confirming...' : 'Depositing...'}
                      </>
                    ) : 'Deposit ETH'}
                  </button>
                </div>

                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
                  <h2 className="text-2xl font-bold mb-2">Withdraw ETH</h2>
                  <p className="text-slate-400 mb-6">
                    {canWithdraw 
                      ? `Withdraw ${depositedAmount.toFixed(4)} ETH to your wallet!` 
                      : 'Withdrawals unlock when goal is met or time expires.'}
                  </p>

                  <button
                    onClick={handleWithdraw}
                    disabled={!canWithdraw || isProcessing}
                    className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                      canWithdraw
                        ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer disabled:opacity-50"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isProcessing && transactionType === 'withdraw' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isConfirming ? 'Confirming...' : 'Withdrawing...'}
                      </>
                    ) : canWithdraw ? 'Withdraw All' : 'Locked'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VaultDetails;