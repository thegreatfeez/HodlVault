import { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CreateVaultContext } from "../contexts/createVaultContext";
import { useCountdown, useTimeBasedProgress, calculateEndDate } from '../hooks/date';

const VaultDetails = () => {
  const context = useContext(CreateVaultContext);
  const { id } = useParams<{ id: string }>();
  const vault = context?.vaults.find(v => v.id === Number(id));

  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [date] = useState(new Date());
  const [transactionId, setTransactionId] = useState(1);
  const [totalSaved, setTotalSaved] = useState(0);

  const savingsGoal = vault?.targetAmount || 0;
  const progressPercentage = savingsGoal > 0 ? (totalSaved / savingsGoal) * 100 : 0;

  const startDate = useMemo(() => vault?.startDate || new Date(), [vault?.startDate]);
  const duration = vault?.duration || 0;

  const endDate = useMemo(() => calculateEndDate(startDate, duration), [startDate, duration]);
  const timeRemaining = useCountdown(endDate);
  const timeProgress = useTimeBasedProgress(startDate, endDate);

  const { days: daysRemaining, hours: hoursRemaining, minutes: minutesRemaining, seconds: secondsRemaining } = timeRemaining;

  function handleDeposit() {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    const ethAmount = Number(amount);
    const newTransaction = {
      id: transactionId,
      date: new Date().toLocaleString(),
      amount: `+${ethAmount} ETH`,
      status: isCompleted ? 'Completed' : 'Pending',
      txHash: `0x${Math.random().toString(16).slice(2, 10)}`
    };

    setTransactions(prev => [...prev, newTransaction]);
    setTransactionId(prev => prev + 1);
    setTotalSaved(prev => prev + ethAmount);
    setAmount('');
    setIsCompleted(true);
  }

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">{vault?.name}</h1>
          <p className="text-slate-400 text-lg">Your personal ETH savings dashboard.</p>
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
                      className="text-blue-500 transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">Vault Status</h2>
                  <p className="text-slate-300 mb-4">
                    Total Saved: <span className="font-bold text-white">{totalSaved} ETH</span> of {savingsGoal} ETH goal
                  </p>
                  <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold mb-6">Time Remaining</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{daysRemaining}</div>
                  <div className="text-slate-400">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{hoursRemaining.toString().padStart(2, '0')}</div>
                  <div className="text-slate-400">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{minutesRemaining}</div>
                  <div className="text-slate-400">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{secondsRemaining}</div>
                  <div className="text-slate-400">Seconds</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
              {transactions.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No transactions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 px-4">{tx.date}</td>
                          <td className="py-4 px-4 font-medium">{tx.amount}</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold mb-2">Deposit ETH</h2>
              <p className="text-slate-400 mb-6">Add funds to your savings vault.</p>
              
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">ETH</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button 
                onClick={handleDeposit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Deposit ETH
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold mb-2">Withdraw ETH</h2>
              <p className="text-slate-400 mb-6">Withdrawals are disabled until your goal is met.</p>

              <button
                disabled={!(progressPercentage >= 100 || timeProgress >= 100)}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
                  progressPercentage >= 100 || timeProgress >= 100
                    ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultDetails;
