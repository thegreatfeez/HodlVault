import { useState, useEffect } from "react";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";
import { useWriteContract, useAccount } from "wagmi";
import { parseEther } from "viem";
import { MyVaultABI, CONTRACT_ADDRESS } from "../config/Contract";

export default function CreateVault() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();
  const { address } = useAccount(); // Get user's wallet address

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [vaultName, setVaultName] = useState("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isSuccess && address && vaultName) {
      saveVaultName(address, vaultName);
      
      setSuccessMessage("Vault Created Successfully on Blockchain!");
      setShowSuccess(true);
  
      setVaultName("");
      setTargetAmount("");
      setDuration(0);
    }
  }, [isSuccess, address, vaultName]);

  useEffect(() => {
    if (error) {
      const message = error.message.includes("Connector not connected") 
        ? "Please connect your wallet to create a vault."
        : error.message || "Transaction failed. Please try again.";
      setErrorMessage(message);
      setShowError(true);
    }
  }, [error]);

 
  function saveVaultName(userAddress: string, name: string) {
    const key = `vaultNames_${userAddress}`;
    const existingNames = JSON.parse(localStorage.getItem(key) || "{}");
    
    const vaultCount = Object.keys(existingNames).length;
    
    existingNames[vaultCount] = name;
    localStorage.setItem(key, JSON.stringify(existingNames));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!vaultName || !targetAmount || duration <= 0) {
      setErrorMessage("Please fill in all fields correctly.");
      setShowError(true);
      return;
    }

    if (Number(targetAmount) <= 0) {
      setErrorMessage("Savings goal must be greater than 0.");
      setShowError(true);
      return;
    }

    if (!address) {
      setErrorMessage("Please connect your wallet first.");
      setShowError(true);
      return;
    }

    try {
      const goalAmountInWei = parseEther(targetAmount);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MyVaultABI,
        functionName: "createVault",
        args: [goalAmountInWei, BigInt(duration)],
      });
    } catch (err) {
      setErrorMessage("Invalid input. Please check your values.");
      setShowError(true);
    }
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-[#0d141c] text-white px-6 relative">
      {showError && (
        <ErrorAlert
          onClose={() => setShowError(false)}
          message={errorMessage}
          isVisible={showError}
        />
      )}
      {showSuccess && (
        <SuccessAlert
          onClose={() => setShowSuccess(false)}
          message={successMessage}
          isVisible={showSuccess}
        />
      )}

      <div className="max-w-md w-full bg-[#111a22] p-8 rounded-2xl border border-gray-800 shadow-md">
        <h1 className="text-3xl font-extrabold text-center mb-3">
          Create a New Vault
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Secure your ETH on-chain. Define your vault name, savings goal, and lock duration to start.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Vault Name (Display Only)
            </label>
            <input
              type="text"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="My Emergency Fund"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-gray-500 text-xs mt-1">
              This name is stored locally for your reference only
            </p>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Savings Goal (ETH)
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value.trim())}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", " "].includes(e.key)) e.preventDefault();
              }}
              placeholder="0.5"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Lock Duration (Days)
            </label>
            <input
              value={duration || ""}
              onChange={(e) => setDuration(Number(e.target.value))}
              type="number"
              min="1"
              placeholder="90"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Vault...
              </>
            ) : (
              "Create Vault"
            )}
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Once created, your vault will be locked on the blockchain for the specified duration.
        </p>
      </div>
    </section>
  );
}