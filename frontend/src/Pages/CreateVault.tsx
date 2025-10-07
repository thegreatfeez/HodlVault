import { useContext, useState } from "react";
import { CreateVaultContext } from "../contexts/createVaultContext";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";

export default function CreateVault() {
  const context = useContext(CreateVaultContext);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!context) {
    return (
      <ErrorAlert
        onClose={() => setShowError(false)}
        message="CreateVault must be used within a CreateVaultProvider"
        isVisible={true}
      />
    );
  }

  const [vaultName, setVaultName] = useState("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [duration, setDuration] = useState(0);

  const { addVault } = context;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!vaultName || !targetAmount || duration <= 0) {
      setErrorMessage("Please fill in all fields correctly.");
      setShowError(true);
      return;
    }

    const newVault = {
      id: Date.now(),
      name: vaultName,
      targetAmount: Number(targetAmount),
      duration,
      progress: 0,
      startDate: new Date(),
    };

    addVault(newVault);

    setVaultName("");
    setTargetAmount("");
    setDuration(0);

    setSuccessMessage("Vault Created Successfully!");
    setShowSuccess(true);
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
          Secure your ETH and watch it grow. Define your vault name, savings
          goal, and lock duration to start.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Vault Name</label>
            <input
              type="text"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="My ETH Vault"
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
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
              onChange={(e) => {
                const value = e.target.value.trim();
                setTargetAmount(value);
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", " "].includes(e.key)) e.preventDefault();
              }}
              placeholder="ETH 0.5"
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Lock Duration (Days)
            </label>
            <input
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              type="number"
              placeholder="90"
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            onClick={handleSubmit}
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition"
          >
            Create Vault
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Once created, your funds will be locked for the specified duration.
          After the lock period, you can withdraw your initial deposit plus any
          accrued rewards.
        </p>
      </div>
    </section>
  );
}
