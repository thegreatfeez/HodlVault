export const MyVaultABI = [
  { "inputs": [], "name": "CannotWithdrawYet", "type": "error" },
  { "inputs": [], "name": "DepositAmountZero", "type": "error" },
  { "inputs": [], "name": "DepositExceedsGoal", "type": "error" },
  { "inputs": [], "name": "GoalAlreadyReached", "type": "error" },
  { "inputs": [], "name": "GoalAmountZero", "type": "error" },
  { "inputs": [], "name": "InvalidVaultId", "type": "error" },
  { "inputs": [], "name": "LockDurationZero", "type": "error" },
  { "inputs": [], "name": "NoFundsToWithdraw", "type": "error" },
  { "inputs": [], "name": "TransferFailed", "type": "error" },
  { "inputs": [], "name": "VaultAlreadyCompleted", "type": "error" },
  { "inputs": [], "name": "VaultMustBeCompleted", "type": "error" },
  { "inputs": [], "name": "VaultMustBeEmpty", "type": "error" },
  { "inputs": [], "name": "VaultNameEmpty", "type": "error" },
  { "inputs": [], "name": "VaultNotActive", "type": "error" },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalSaved", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "remainingToGoal", "type": "uint256" }
    ],
    "name": "DepositMade",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalWithdrawn", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "VaultCompleted",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "unlockTime", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "VaultCreated",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newGoalAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newUnlockTime", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "VaultReactivated",
    "type": "event"
  },

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "Withdrawn",
    "type": "event"
  },

  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
    ],
    "name": "canWithdraw",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "uint256", "name": "_goalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_lockDurationInDays", "type": "uint256" }
    ],
    "name": "createVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  {
    "inputs": [{ "internalType": "uint256", "name": "vaultId", "type": "uint256" }],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },

  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getActiveVaults",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getCompletedVaults",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
    ],
    "name": "getProgressPercentage",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
    ],
    "name": "getTimeRemaining",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_vaultId", "type": "uint256" }
    ],
    "name": "getVaultInfo",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "unlockTime", "type": "uint256" },
          { "internalType": "uint256", "name": "depositedAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "withdrawnAmount", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "bool", "name": "isCompleted", "type": "bool" },
          { "internalType": "uint256", "name": "completedAt", "type": "uint256" }
        ],
        "internalType": "struct MyVaultV2.UserDeposit",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "internalType": "uint256", "name": "_newGoalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_newLockDurationInDays", "type": "uint256" }
    ],
    "name": "reactivateVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "userVaultCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "userVaults",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "unlockTime", "type": "uint256" },
      { "internalType": "uint256", "name": "depositedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "withdrawnAmount", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "bool", "name": "isCompleted", "type": "bool" },
      { "internalType": "uint256", "name": "completedAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  {
    "inputs": [{ "internalType": "uint256", "name": "vaultId", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const CONTRACT_ADDRESS =
  "0xAdBDf36FA661fd142D803eE8dDeCc1853C6aE59D" as `0x${string}`;
