export const MyVaultABI = [
  {
    "type": "function",
    "name": "canWithdraw",
    "inputs": [
      {"name": "_user", "type": "address", "internalType": "address"},
      {"name": "_vaultId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createVault",
    "inputs": [
      {"name": "_goalAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "_lockDurationIndays", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deposit",
    "inputs": [{"name": "vaultId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getProgressPercentage",
    "inputs": [
      {"name": "_user", "type": "address", "internalType": "address"},
      {"name": "_vaultId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTimeRemaining",
    "inputs": [
      {"name": "_user", "type": "address", "internalType": "address"},
      {"name": "_vaultId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVaultInfo",
    "inputs": [
      {"name": "_user", "type": "address", "internalType": "address"},
      {"name": "_vaultId", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct MyVault.UserDeposit",
        "components": [
          {"name": "id", "type": "uint256", "internalType": "uint256"},
          {"name": "goalAmount", "type": "uint256", "internalType": "uint256"},
          {"name": "unlockTime", "type": "uint256", "internalType": "uint256"},
          {"name": "depositedAmount", "type": "uint256", "internalType": "uint256"},
          {"name": "isActive", "type": "bool", "internalType": "bool"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "userVaultCount",
    "inputs": [{"name": "", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "userVaults",
    "inputs": [
      {"name": "", "type": "address", "internalType": "address"},
      {"name": "", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {"name": "id", "type": "uint256", "internalType": "uint256"},
      {"name": "goalAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "unlockTime", "type": "uint256", "internalType": "uint256"},
      {"name": "depositedAmount", "type": "uint256", "internalType": "uint256"},
      {"name": "isActive", "type": "bool", "internalType": "bool"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [{"name": "vaultId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "DepositMade",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "vaultId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "totalSaved", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VaultCreated",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "vaultId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "goalAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "unlockTime", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Withdrawn",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "vaultId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  }
] as const;

export const CONTRACT_ADDRESS = "0x4f28B23C7Db7932ED27ED7820Fc86392a4fdbb49" as `0x${string}`;