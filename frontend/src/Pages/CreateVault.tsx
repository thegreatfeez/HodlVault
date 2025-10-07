export default function CreateVault() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-[#0d141c] text-white px-6">
      <div className="max-w-md w-full bg-[#111a22] p-8 rounded-2xl border border-gray-800 shadow-md">
        <h1 className="text-3xl font-extrabold text-center mb-3">
          Create a New Vault
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Secure your ETH and watch it grow. Define your savings goal and lock duration to start.
        </p>

        <form className="space-y-6">
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Savings Goal (ETH)
            </label>
            <input
              type="text"
              placeholder="ETH 0.5"
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

         
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Lock Duration (Days)
            </label>
            <input
              type="number"
              placeholder="90"
              className="w-full px-4 py-3 rounded-md bg-[#1a232d] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

        
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition"
          >
            Create Vault
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Once created, your funds will be locked for the specified duration.
          After the lock period, you can withdraw your initial deposit plus any accrued rewards.
        </p>
      </div>
    </section>
  );
}
