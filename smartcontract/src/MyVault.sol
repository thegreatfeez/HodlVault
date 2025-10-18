// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract MyVaultV2 {
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

    event VaultCreated(address indexed user, uint256 indexed vaultId, string name, uint256 goalAmount, uint256 unlockTime);
    event DepositMade(address indexed user, uint256 indexed vaultId, uint256 amount, uint256 totalSaved);
    event Withdrawn(address indexed user, uint256 indexed vaultId, uint256 amount);
    event VaultCompleted(address indexed user, uint256 indexed vaultId, uint256 totalWithdrawn);
    event VaultReactivated(address indexed user, uint256 indexed vaultId, uint256 newGoalAmount, uint256 newUnlockTime);
    event VaultDeleted(address indexed user, uint256 indexed vaultId);

    function createVault(
        string memory _name,
        uint256 _goalAmount,
        uint256 _lockDurationInDays
    ) external {
        require(bytes(_name).length > 0, "Vault name cannot be empty");
        require(_goalAmount > 0, "Goal amount must be greater than zero");
        require(_lockDurationInDays > 0, "Lock duration must be greater than zero");

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

        emit VaultCreated(msg.sender, vaultId, _name, _goalAmount, unlockTime);
    }

    function deposit(uint256 vaultId) external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        require(vaultId < userVaultCount[msg.sender], "Invalid vault ID");

        UserDeposit storage vault = userVaults[msg.sender][vaultId];
        require(vault.isActive, "Vault is not active");
        require(!vault.isCompleted, "Vault is already completed");
        require(vault.depositedAmount < vault.goalAmount, "Goal already reached");

        uint256 remainingToGoal = vault.goalAmount - vault.depositedAmount;
        require(msg.value <= remainingToGoal, "Deposit exceeds goal amount");

        vault.depositedAmount += msg.value;

        emit DepositMade(msg.sender, vaultId, msg.value, vault.depositedAmount);
    }

    function withdraw(uint256 vaultId) external {
        require(vaultId < userVaultCount[msg.sender], "Invalid vault ID");

        UserDeposit storage vault = userVaults[msg.sender][vaultId];

        require(vault.isActive, "Vault is not active");
        require(!vault.isCompleted, "Vault is already completed");
        require(
            block.timestamp >= vault.unlockTime || vault.depositedAmount >= vault.goalAmount,
            "Cannot withdraw before unlock time or goal not met"
        );
        require(vault.depositedAmount > 0, "No funds to withdraw");

        uint256 amountToWithdraw = vault.depositedAmount;
        vault.withdrawnAmount = amountToWithdraw;
        vault.depositedAmount = 0;
        vault.isActive = false;
        vault.isCompleted = true;
        vault.completedAt = block.timestamp;

        emit Withdrawn(msg.sender, vaultId, amountToWithdraw);
        emit VaultCompleted(msg.sender, vaultId, amountToWithdraw);

        (bool success, ) = payable(msg.sender).call{value: amountToWithdraw}("");
        require(success, "Transfer failed");
    }

    function reactivateVault(
        uint256 vaultId,
        uint256 _newGoalAmount,
        uint256 _newLockDurationInDays
    ) external {
        require(vaultId < userVaultCount[msg.sender], "Invalid vault ID");

        UserDeposit storage vault = userVaults[msg.sender][vaultId];

        require(vault.isCompleted, "Vault must be completed to reactivate");
        require(vault.depositedAmount == 0, "Vault must be empty");
        require(_newGoalAmount > 0, "Goal amount must be greater than zero");
        require(_newLockDurationInDays > 0, "Lock duration must be greater than zero");

        vault.goalAmount = _newGoalAmount;
        vault.unlockTime = block.timestamp + (_newLockDurationInDays * 1 days);
        vault.withdrawnAmount = 0;
        vault.isActive = true;
        vault.isCompleted = false;
        vault.completedAt = 0;

        emit VaultReactivated(msg.sender, vaultId, _newGoalAmount, vault.unlockTime);
    }

    function deleteVault(uint256 vaultId) external {
        require(vaultId < userVaultCount[msg.sender], "Invalid vault ID");

        UserDeposit storage vault = userVaults[msg.sender][vaultId];

        require(vault.isCompleted, "Can only delete completed vaults");
        require(vault.depositedAmount == 0, "Vault must be empty to delete");

        delete userVaults[msg.sender][vaultId];

        emit VaultDeleted(msg.sender, vaultId);
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