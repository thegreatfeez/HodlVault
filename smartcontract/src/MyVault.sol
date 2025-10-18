// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract MyVaultV2 {
    error VaultNameEmpty();
    error GoalAmountZero();
    error LockDurationZero();
    error DepositAmountZero();
    error InvalidVaultId();
    error VaultAlreadyCompleted();
    error VaultNotActive();
    error GoalAlreadyReached();
    error DepositExceedsGoal();
    error CannotWithdrawYet();
    error NoFundsToWithdraw();
    error VaultMustBeCompleted();
    error VaultMustBeEmpty();
    error TransferFailed();

    struct UserDeposit {
        uint256 id;
        string name;
        uint256 goalAmount;
        uint256 unlockTime;
        uint256 depositedAmount;
        uint256 withdrawnAmount;
        bool isActive;
        bool isCompleted;
        uint256 completedAt;
    }

    mapping(address => mapping(uint256 => UserDeposit)) public userVaults;
    mapping(address => uint256) public userVaultCount;

    event VaultCreated(
        address indexed user,
        uint256 indexed vaultId,
        string name,
        uint256 goalAmount,
        uint256 unlockTime,
        uint256 timestamp
    );

    event DepositMade(
        address indexed user,
        uint256 indexed vaultId,
        uint256 amount,
        uint256 totalSaved,
        uint256 timestamp,
        uint256 remainingToGoal
    );

    event Withdrawn(
        address indexed user,
        uint256 indexed vaultId,
        uint256 amount,
        uint256 timestamp
    );

    event VaultCompleted(
        address indexed user,
        uint256 indexed vaultId,
        uint256 totalWithdrawn,
        uint256 timestamp
    );

    event VaultReactivated(
        address indexed user,
        uint256 indexed vaultId,
        uint256 newGoalAmount,
        uint256 newUnlockTime,
        uint256 timestamp
    );

    function createVault(
        string memory _name,
        uint256 _goalAmount,
        uint256 _lockDurationInDays
    ) external {
        if (bytes(_name).length == 0) revert VaultNameEmpty();
        if (_goalAmount == 0) revert GoalAmountZero();
        if (_lockDurationInDays == 0) revert LockDurationZero();

        uint256 unlockTime = block.timestamp + (_lockDurationInDays * 1 days);
        uint256 vaultId = userVaultCount[msg.sender]++;

        userVaults[msg.sender][vaultId] = UserDeposit({
            id: vaultId,
            name: _name,
            goalAmount: _goalAmount,
            unlockTime: unlockTime,
            depositedAmount: 0,
            withdrawnAmount: 0,
            isActive: true,
            isCompleted: false,
            completedAt: 0
        });

        emit VaultCreated(msg.sender, vaultId, _name, _goalAmount, unlockTime, block.timestamp);
    }

    function deposit(uint256 vaultId) external payable {
        if (msg.value == 0) revert DepositAmountZero();
        if (vaultId >= userVaultCount[msg.sender]) revert InvalidVaultId();

        UserDeposit storage vault = userVaults[msg.sender][vaultId];
        if (vault.isCompleted) revert VaultAlreadyCompleted();
        if (!vault.isActive) revert VaultNotActive();
        if (vault.depositedAmount >= vault.goalAmount) revert GoalAlreadyReached();

        uint256 remainingToGoal = vault.goalAmount - vault.depositedAmount;
        if (msg.value > remainingToGoal) revert DepositExceedsGoal();

        vault.depositedAmount += msg.value;

        emit DepositMade(
            msg.sender,
            vaultId,
            msg.value,
            vault.depositedAmount,
            block.timestamp,
            vault.goalAmount - vault.depositedAmount
        );
    }

    function withdraw(uint256 vaultId) external {
        if (vaultId >= userVaultCount[msg.sender]) revert InvalidVaultId();

        UserDeposit storage vault = userVaults[msg.sender][vaultId];

        if (vault.isCompleted) revert VaultAlreadyCompleted();
        if (!vault.isActive) revert VaultNotActive();
        if (block.timestamp < vault.unlockTime && vault.depositedAmount < vault.goalAmount) {
            revert CannotWithdrawYet();
        }
        if (vault.depositedAmount == 0) revert NoFundsToWithdraw();

        uint256 amountToWithdraw = vault.depositedAmount;
        vault.withdrawnAmount = amountToWithdraw;
        vault.depositedAmount = 0;
        vault.isActive = false;
        vault.isCompleted = true;
        vault.completedAt = block.timestamp;

        emit Withdrawn(msg.sender, vaultId, amountToWithdraw, block.timestamp);
        emit VaultCompleted(msg.sender, vaultId, amountToWithdraw, block.timestamp);

        (bool success, ) = payable(msg.sender).call{value: amountToWithdraw}("");
        if (!success) revert TransferFailed();
    }

    function reactivateVault(
        uint256 vaultId,
        uint256 _newGoalAmount,
        uint256 _newLockDurationInDays
    ) external {
        if (vaultId >= userVaultCount[msg.sender]) revert InvalidVaultId();

        UserDeposit storage vault = userVaults[msg.sender][vaultId];

        if (!vault.isCompleted) revert VaultMustBeCompleted();
        if (vault.depositedAmount != 0) revert VaultMustBeEmpty();
        if (_newGoalAmount == 0) revert GoalAmountZero();
        if (_newLockDurationInDays == 0) revert LockDurationZero();

        vault.goalAmount = _newGoalAmount;
        vault.unlockTime = block.timestamp + (_newLockDurationInDays * 1 days);
        vault.withdrawnAmount = 0;
        vault.isActive = true;
        vault.isCompleted = false;
        vault.completedAt = 0;

        emit VaultReactivated(
            msg.sender,
            vaultId,
            _newGoalAmount,
            vault.unlockTime,
            block.timestamp
        );
    }

    function getVaultInfo(address _user, uint256 _vaultId) external view returns (UserDeposit memory) {
        return userVaults[_user][_vaultId];
    }

    function canWithdraw(address _user, uint256 _vaultId) external view returns (bool) {
        UserDeposit storage vault = userVaults[_user][_vaultId];

        return
            vault.isActive &&
            !vault.isCompleted &&
            vault.depositedAmount > 0 &&
            (block.timestamp >= vault.unlockTime || vault.depositedAmount >= vault.goalAmount);
    }

    function getTimeRemaining(address _user, uint256 _vaultId) external view returns (uint256) {
        UserDeposit storage vault = userVaults[_user][_vaultId];

        if (vault.isCompleted) return 0;
        if (block.timestamp >= vault.unlockTime) return 0;

        return vault.unlockTime - block.timestamp;
    }

    function getProgressPercentage(address _user, uint256 _vaultId) external view returns (uint256) {
        UserDeposit storage vault = userVaults[_user][_vaultId];

        if (vault.isCompleted) return 100;
        if (vault.goalAmount == 0) return 0;
        if (vault.depositedAmount >= vault.goalAmount) return 100;

        return (vault.depositedAmount * 100) / vault.goalAmount;
    }

    function getActiveVaults(address _user) external view returns (uint256[] memory) {
        uint256 totalVaults = userVaultCount[_user];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < totalVaults; i++) {
            if (userVaults[_user][i].isActive && !userVaults[_user][i].isCompleted) {
                activeCount++;
            }
        }

        uint256[] memory activeVaultIds = new uint256[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalVaults; i++) {
            if (userVaults[_user][i].isActive && !userVaults[_user][i].isCompleted) {
                activeVaultIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return activeVaultIds;
    }

    function getCompletedVaults(address _user) external view returns (uint256[] memory) {
        uint256 totalVaults = userVaultCount[_user];
        uint256 completedCount = 0;

        for (uint256 i = 0; i < totalVaults; i++) {
            if (userVaults[_user][i].isCompleted) {
                completedCount++;
            }
        }

        uint256[] memory completedVaultIds = new uint256[](completedCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalVaults; i++) {
            if (userVaults[_user][i].isCompleted) {
                completedVaultIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return completedVaultIds;
    }
}