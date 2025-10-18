import { Link } from "react-router-dom";
import { useUserVaults } from "../hooks/useContract";

const VaultDashboard = () => {
  const { vaults, isLoading } = useUserVaults();

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
                  <th className="px-6 py-4 font-medium">STATUS</th>
                  <th className="px-6 py-4 font-medium">PROGRESS</th>
                  <th className="px-6 py-4 font-medium">CURRENT ETH</th>
                  <th className="px-6 py-4 font-medium">GOAL</th>
                  <th className="px-6 py-4 font-medium">TIME REMAINING</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {vaults.map((vault) => {
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
                  const isCompleted = !vault.isActive && depositedAmount === 0;

                  let statusBadge;
                  let statusColor;

                  if (isCompleted) {
                    statusBadge = "Completed";
                    statusColor = "bg-gray-500/20 text-gray-400 border-gray-500/30";
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

                  const timeDisplay = timeUnlocked ? "Unlocked" : `${daysRemaining} day(s)`;

                  return (
                    <tr
                      key={vault.id}
                      className="border-b border-gray-800 hover:bg-[#1c2128] transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>{vault.name}</span>
                          {goalReached && vault.isActive && (
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
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 transition-all ${
                                goalReached ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-300 text-sm">{progress.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{depositedAmount.toFixed(4)} ETH</td>
                      <td className="px-6 py-4 text-gray-300">{goalAmount.toFixed(4)} ETH</td>
                      <td className="px-6 py-4">
                        <span className={timeUnlocked ? 'text-green-400' : 'text-gray-300'}>
                          {timeDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-400 cursor-pointer hover:underline">
                        <Link to={`/vault/${vault.id}`}>View Details</Link>
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