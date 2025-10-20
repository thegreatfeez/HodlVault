import { useState } from "react";
import { Link } from "react-router-dom";
import { useActiveAndCompletedVaults } from "../hooks/useContract";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { MyVaultABI, CONTRACT_ADDRESS } from "../config/Contract";
import SuccessAlert from "../components/SuccessAlert";
import ErrorAlert from "../components/ErrorAlert";

const VaultDashboard = () => {
  const { activeVaults, completedVaults, isLoading } = useActiveAndCompletedVaults();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [newDuration, setNewDuration] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const currentVaults = activeTab === 'active' ? activeVaults : completedVaults;

  const handleReactivate = (vaultId: number) => {
    setSelectedVaultId(vaultId);
    setShowReactivateModal(true);
  };

  const handleReactivateSubmit = () => {
    if (!newGoalAmount || Number(newGoalAmount) <= 0) {
      setErrorMessage("Please enter a valid goal amount.");
      setShowError(true);
      return;
    }

    if (newDuration <= 0) {
      setErrorMessage("Please enter a valid lock duration.");
      setShowError(true);
      return;
    }

    try {
      const goalAmountInWei = parseEther(newGoalAmount);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MyVaultABI,
        functionName: "reactivateVault",
        args: [BigInt(selectedVaultId!), goalAmountInWei, BigInt(newDuration)],
      });

      setShowReactivateModal(false);
      setNewGoalAmount("");
      setNewDuration(0);
    } catch (error) {
      setErrorMessage("Failed to reactivate vault. Please try again.");
      setShowError(true);
    }
  };

  useState(() => {
    if (isConfirmed) {
      setSuccessMessage("Vault reactivated successfully!");
      setShowSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  });

  useState(() => {
    if (writeError) {
      const message = writeError.message.includes("User rejected")
        ? "Transaction was rejected."
        : writeError.message.includes("VaultMustBeCompleted")
        ? "Vault must be completed before reactivation."
        : writeError.message.includes("VaultMustBeEmpty")
        ? "Vault must be empty before reactivation."
        : "Transaction failed. Please try again.";
      
      setErrorMessage(message);
      setShowError(true);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your vaults...</p>
        </div>
      </div>
    );
  }

  const isProcessing = isPending || isConfirming;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-10">
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
          <div className="bg-[#161b22] rounded-xl border border-gray-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">Reactivate Vault</h2>
            <p className="text-gray-400 mb-6">Set a new goal and duration for this vault.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">New Goal Amount (ETH)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={newGoalAmount}
                  onChange={(e) => setNewGoalAmount(e.target.value)}
                  placeholder="0.5"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-md bg-[#0d1117] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">New Lock Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={newDuration || ""}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  placeholder="90"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 rounded-md bg-[#0d1117] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReactivateModal(false);
                  setNewGoalAmount("");
                  setNewDuration(0);
                }}
                disabled={isProcessing}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateSubmit}
                disabled={isProcessing}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
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

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Vaults</h1>
            <p className="text-gray-400 mt-1">
              Manage your ETH savings across multiple vaults.
            </p>
          </div>
          <div className="bg-[#161b22] px-6 py-3 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">
              {activeTab === 'active' ? 'Active' : 'Completed'} Vaults:
            </p>
            <p className="text-2xl font-semibold text-blue-400">{currentVaults.length}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Active Vaults ({activeVaults.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Completed Vaults ({completedVaults.length})
          </button>
        </div>

        {currentVaults.length === 0 ? (
          <div className="bg-[#161b22] rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400 text-lg mb-6">
              {activeTab === 'active' 
                ? 'No active vaults yet' 
                : 'No completed vaults yet'}
            </p>
            {activeTab === 'active' && (
              <Link to="/createvault">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">
                  Create Vault
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-[#161b22] rounded-lg border border-gray-700">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700 text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">VAULT NAME</th>
                  <th className="px-6 py-4 font-medium">STATUS</th>
                  <th className="px-6 py-4 font-medium">PROGRESS</th>
                  <th className="px-6 py-4 font-medium">CURRENT ETH</th>
                  <th className="px-6 py-4 font-medium">GOAL</th>
                  <th className="px-6 py-4 font-medium">TIME REMAINING</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {currentVaults.map((vault) => {
                  const goalAmount = Number(vault.goalAmount);
                  const depositedAmount = Number(vault.depositedAmount);
                  const progress = goalAmount > 0 ? (depositedAmount / goalAmount) * 100 : 0;

                  const unlockDate = new Date(vault.unlockTime * 1000);
                  const now = new Date();
                  const timeRemaining = unlockDate.getTime() - now.getTime();
                  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
                  const timeUnlocked = timeRemaining <= 0;
                  
                  const goalReached = progress >= 100;
                  const canWithdraw = (goalReached || timeUnlocked) && depositedAmount > 0;
                  const isWithdrawn = vault.isCompleted && depositedAmount === 0;

                  let statusBadge;
                  let statusColor;

                  if (isWithdrawn) {
                    statusBadge = "Withdrawn";
                    statusColor = "bg-green-500/20 text-green-400 border-green-500/30";
                  } else if (vault.isCompleted) {
                    statusBadge = "Completed";
                    statusColor = "bg-green-500/20 text-green-400 border-green-500/30";
                  } else if (!vault.isActive) {
                    statusBadge = "Inactive";
                    statusColor = "bg-red-500/20 text-red-400 border-red-500/30";
                  } else if (canWithdraw) {
                    statusBadge = "Ready";
                    statusColor = "bg-green-500/20 text-green-400 border-green-500/30";
                  } else if (goalReached) {
                    statusBadge = "Goal Met";
                    statusColor = "bg-green-500/20 text-green-400 border-green-500/30";
                  } else {
                    statusBadge = "Active";
                    statusColor = "bg-blue-500/20 text-blue-400 border-blue-500/30";
                  }

                  const timeDisplay = isWithdrawn ? "-" : timeUnlocked ? "Unlocked" : `${daysRemaining} day(s)`;

                  return (
                    <tr
                      key={vault.id}
                      className={`border-b border-gray-800 hover:bg-[#1c2128] transition ${
                        isWithdrawn ? 'opacity-75' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>{vault.name}</span>
                          {goalReached && vault.isActive && !isWithdrawn && (
                            <span className="text-xs">🎉</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                          {statusBadge}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isWithdrawn ? (
                          <span className="text-green-400 font-medium">Withdrawn</span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-2.5 transition-all ${
                                  goalReached ? 'bg-green-500' : vault.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-300 text-sm">{progress.toFixed(1)}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {isWithdrawn ? "-" : `${depositedAmount.toFixed(4)} ETH`}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{goalAmount.toFixed(4)} ETH</td>
                      <td className="px-6 py-4">
                        <span className={timeUnlocked && !isWithdrawn ? 'text-green-400' : 'text-gray-300'}>
                          {timeDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/vault/${vault.id}`} className="text-blue-400 hover:underline">
                            View Details
                          </Link>
                          {isWithdrawn && (
                            <button
                              onClick={() => handleReactivate(vault.id)}
                              className="text-green-400 hover:underline"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultDashboard;