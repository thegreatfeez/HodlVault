# HoldVault

A decentralized Ethereum savings vault application built on Base Sepolia. Set savings goals, lock your ETH, and track your progress towards financial milestones.

## Overview

HoldVault enables users to create time-locked savings vaults with specific ETH goals. Deposits are secured on-chain and can only be withdrawn when the goal is reached or the lock period expires. Completed vaults can be reactivated for new savings cycles.

## Features

- **Create Vaults**: Set custom savings goals and lock durations
- **Secure Deposits**: Add ETH to your vault at any time
- **Time-Locked Withdrawals**: Access funds only when conditions are met
- **Progress Tracking**: Real-time visualization of savings progress
- **Vault Reactivation**: Reuse completed vaults with new goals
- **Transaction History**: View recent deposits and withdrawals
- **Multi-Vault Support**: Manage multiple savings goals simultaneously

## Tech Stack

**Frontend:**
- React + TypeScript
- Viem + Wagmi (Web3 interaction)
- TailwindCSS (Styling)
- React Router (Navigation)

**Smart Contract:**
- Solidity ^0.8.13
- Deployed on Base Sepolia

**Contract Address:** `0xAdBDf36FA661fd142D803eE8dDeCc1853C6aE59D`

## Getting Started

### Prerequisites

- Node.js (v16+)
- MetaMask or compatible Web3 wallet
- Base Sepolia testnet ETH

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/holdvault.git

# Navigate to project directory
cd holdvault

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

Update the contract address in `src/config/Contract.ts` if redeploying:
```typescript
export const CONTRACT_ADDRESS = "0xAdBDf36FA661fd142D803eE8dDeCc1853C6aE59D"
```

## Usage

1. **Connect Wallet**: Connect your MetaMask to Base Sepolia
2. **Create Vault**: Set vault name, goal amount (ETH), and lock duration (days)
3. **Deposit Funds**: Add ETH to your vault anytime before reaching the goal
4. **Track Progress**: Monitor savings through the dashboard
5. **Withdraw**: Collect funds when goal is met or time expires
6. **Reactivate**: Reuse completed vaults for new savings cycles

## Smart Contract Functions

### Core Functions
- `createVault(name, goalAmount, lockDuration)` - Create new savings vault
- `deposit(vaultId)` - Add funds to vault
- `withdraw(vaultId)` - Withdraw when conditions met
- `reactivateVault(vaultId, newGoal, newDuration)` - Restart completed vault

### View Functions
- `getVaultInfo(user, vaultId)` - Fetch vault details
- `getActiveVaults(user)` - List active vaults
- `getCompletedVaults(user)` - List completed vaults
- `getProgressPercentage(user, vaultId)` - Calculate progress
- `canWithdraw(user, vaultId)` - Check withdrawal eligibility

## Project Structure
```
holdvault/
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── config/           # Contract ABI and address
│   ├── pages/            # Main application pages
│   └── App.tsx           # Root component
├── contracts/            # Solidity smart contracts
└── README.md
```

## Security Features

- Time-locked withdrawals
- Goal-based release conditions
- Custom error handling
- Event emission for transparency
- Reentrancy protection

## Network

- **Chain**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Contact

For questions or support, open an issue on GitHub.

---

**⚠️ Disclaimer**: This is a testnet application. Do not use on mainnet without proper security audits.