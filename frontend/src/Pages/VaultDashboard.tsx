import React from "react";

const VaultDashboard = () => {
  const vaults = [
    { name: "Retirement Fund", progress: 25, current: "2.5 ETH", goal: "10 ETH", time: "30 days" },
    { name: "Dream Vacation", progress: 36, current: "1.8 ETH", goal: "5 ETH", time: "15 days" },
    { name: "New Laptop", progress: 25, current: "0.5 ETH", goal: "2 ETH", time: "60 days" },
    { name: "Emergency Fund", progress: 21, current: "3.2 ETH", goal: "15 ETH", time: "90 days" },
    { name: "Gift for Mom", progress: 36, current: "1.1 ETH", goal: "3 ETH", time: "45 days" },
  ];

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
                    View Details
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VaultDashboard;
