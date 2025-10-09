// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract MyVault {
    struct UserDeposit {
        uint256 id;
        uint256 goalAmount;
        uint256 unlockTime;
        uint256 depositedAmount;
        bool isActive;
    }

    mapping(address => mapping (uint256 => UserDeposit)) public userVaults;
    mapping(address => uint256) public userVaultCount;

    event VaultCreated(address indexed user, uint256 indexed vaultId, uint256 goalAmount, uint256 unlockTime);
    event DepositMade(address indexed user,uint256 indexed vaultId, uint256 amount, uint256 totalSaved);
    event Withdrawn(address indexed user,uint256 indexed vaultId, uint256 amount);

    function createVault(uint256 _goalAmount, uint256 _lockDurationIndays) external{
        require(_goalAmount > 0, "Goal amount must be greater than zero");
        require (_lockDurationIndays > 0, "Lock duration must be greater than zero");
        

        uint256 unlockTime = block.timestamp + (_lockDurationIndays * 1 days);
        uint256 vaultId = userVaultCount[msg.sender]++;

        userVaults[msg.sender][vaultId] = UserDeposit({
            id: vaultId,
            goalAmount: _goalAmount,
            unlockTime: unlockTime,
            depositedAmount: 0,
            isActive: true
        });

        emit VaultCreated(msg.sender, vaultId, _goalAmount, unlockTime);
    }

    function deposit(uint256 vaultId) external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        require(vaultId < userVaultCount[msg.sender], "Invalid vault ID");

        UserDeposit storage vault = userVaults[msg.sender][vaultId];
        require(vault.isActive, "Vault is not active");

        vault.depositedAmount += msg.value;

        emit DepositMade(msg.sender, vaultId, msg.value, vault.depositedAmount);
    }

    function withdraw(uint256 vaultId) external {
        require(vaultId < userVaultCount[msg.sender], "Invalid vault ID");
        
        UserDeposit storage vault = userVaults[msg.sender][vaultId];

        require(vault.isActive, "Vault is not active");
        require(block.timestamp >= vault.unlockTime || vault.depositedAmount >= vault.goalAmount, "Cannot withdraw before unlock time or goal not met");
        require(vault.depositedAmount > 0, "No funds to withdraw");

        uint256 amountToWithdraw = vault.depositedAmount;
        vault.depositedAmount = 0;
        vault.isActive = false;

        emit Withdrawn(msg.sender, vaultId, amountToWithdraw);

        (bool success, ) = payable(msg.sender).call{value: amountToWithdraw}("");
        require(success, "Transfer failed");
        
    }

    function getVaultInfo(address _user, uint256 _vaultId) external view returns (UserDeposit memory) {
        return  userVaults[_user][_vaultId]; 
    }

    function canWithdraw (address _user, uint256 _vaultId) external view returns (bool) {
        UserDeposit storage vault = userVaults[_user][_vaultId];

        return  vault.isActive && 
                vault.depositedAmount > 0 &&
                (block.timestamp >= vault.unlockTime || vault.depositedAmount >= vault.goalAmount);
    }

    function getTimeRemaining (address _user, uint256 _vaultId) external view returns (uint256){
        UserDeposit storage vault = userVaults[_user][_vaultId];

        if (block.timestamp >= vault.unlockTime) return 0;
    
        return vault.unlockTime - block.timestamp;
        }

    function getProgressPercentage(address _user, uint256 _vaultId) external view returns (uint256) {
    UserDeposit storage vault = userVaults[_user][_vaultId];
    if (vault.goalAmount == 0) return 0;
    if (vault.depositedAmount >= vault.goalAmount) return 100;
    
    return (vault.depositedAmount * 100) / vault.goalAmount;
}
        
}
