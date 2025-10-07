import { Link } from "react-router-dom";
import { useContext} from "react";
import { CreateVaultContext } from "../contexts/createVaultContext";

const VaultDashboard = () => {
  const context = useContext(CreateVaultContext)

const vaultName = context?.vaultName;
const targetAmount = context?.targetAmount;
const duration = context?.duration;

if (vaultName && targetAmount && targetAmount > 0 && duration && duration > 0) {
  console.log("Your vault:", { vaultName, targetAmount, duration });
}

const vaults = [];
if (vaultName && targetAmount && duration) {
  vaults.push({
    id: Date.now(),
    name: vaultName,
    progress: 0,
    current: "0 ETH",
    goal: `${targetAmount} ETH`,
    time: `${duration} days`
  });
}

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Vaults</h1>
            <p className="text-gray-400 mt-1">
              Manage your ETH savings across multiple vaults.
            </p>
          </div>
          <div className="bg-[#161b22] px-6 py-3 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Total Vaults:</p>
            <p className="text-2xl font-semibold text-blue-400">{vaults.length}</p>
          </div>
        </div>

        {vaults.length === 0 ? (
          <div className="bg-[#161b22] rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400 text-lg mb-6">Your vault is empty</p>
            <Link to="/createvault">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">
                Create Vault
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-[#161b22] rounded-lg border border-gray-700">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700 text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">VAULT NAME</th>
                  <th className="px-6 py-4 font-medium">PROGRESS</th>
                  <th className="px-6 py-4 font-medium">CURRENT ETH</th>
                  <th className="px-6 py-4 font-medium">GOAL</th>
                  <th className="px-6 py-4 font-medium">TIME REMAINING</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {vaults.map((vault, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-[#1c2128] transition"
                  >
                    <td className="px-6 py-4">{vault.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-40 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-blue-500 h-2.5"
                            style={{ width: `${vault.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-300 text-sm">{vault.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{vault.current}</td>
                    <td className="px-6 py-4 text-gray-300">{vault.goal}</td>
                    <td className="px-6 py-4 text-gray-300">{vault.time}</td>
                    <td className="px-6 py-4 text-blue-400 cursor-pointer hover:underline">
                      <Link to={`/vault/${vault.id}`}>
                      View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultDashboard;