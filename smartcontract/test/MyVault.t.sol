// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MyVaultV2} from "../src/MyVault.sol";

contract MyVaultTest is Test {
    MyVaultV2 public myVaultV2;
    
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        myVaultV2 = new MyVaultV2();
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    function testCreateVaultSuccess() public {
        vm.prank(user1);

        vm.expectEmit(true, true, false, true, address(myVaultV2));
        emit MyVaultV2.VaultCreated(user1, 0, "Emergency Fund", 5 ether, block.timestamp + 10 days);

        myVaultV2.createVault("Emergency Fund", 5 ether, 10);
        
        (
            uint256 id,
            string memory name,
            uint256 goalAmount,
            uint256 unlockTime,
            uint256 depositedAmount,
            uint256 withdrawnAmount,
            bool isActive,
            bool isCompleted,
            uint256 completedAt
        ) = myVaultV2.userVaults(user1, 0);
        
        assertEq(id, 0);
        assertEq(name, "Emergency Fund");
        assertEq(goalAmount, 5 ether);
        assertEq(depositedAmount, 0);
        assertEq(withdrawnAmount, 0);
        assertTrue(isActive);
        assertFalse(isCompleted);
        assertEq(completedAt, 0);
        assertEq(unlockTime, block.timestamp + 10 days);

        assertEq(myVaultV2.userVaultCount(user1), 1);
    }

    function testCreateVaultRevertsWithEmptyName() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Vault name cannot be empty"));
        myVaultV2.createVault("", 5 ether, 10);
    }

    function testCreateVaultRevertsWithZeroGoalAmount() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Goal amount must be greater than zero"));
        myVaultV2.createVault("My Vault", 0, 10);
    }

    function testCreateVaultRevertsWithZeroLockDuration() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Lock duration must be greater than zero"));
        myVaultV2.createVault("My Vault", 5 ether, 0);
    }

    function testDepositSuccess() public {
        vm.startPrank(user2);
        myVaultV2.createVault("Vacation Fund", 3 ether, 5);

        vm.expectEmit(true, true, false, true, address(myVaultV2));
        emit MyVaultV2.DepositMade(user2, 0, 1 ether, 1 ether);
        myVaultV2.deposit{value: 1 ether}(0);

        vm.stopPrank();
    }

    function testDepositRevertsWithZeroAmount() public {
        vm.prank(user2);
        myVaultV2.createVault("Savings", 3 ether, 5);

        vm.prank(user2);
        vm.expectRevert(bytes("Deposit amount must be greater than zero"));
        myVaultV2.deposit{value: 0}(0);
    }

    function testDepositRevertsWhenExceedsGoal() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Small Vault", 2 ether, 10);
        
        vm.expectRevert(bytes("Deposit exceeds goal amount"));
        myVaultV2.deposit{value: 3 ether}(0);
        
        vm.stopPrank();
    }

    function testDepositRevertsToCompletedVault() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Quick Vault", 1 ether, 10);
        myVaultV2.deposit{value: 1 ether}(0);
        myVaultV2.withdraw(0);
        
        vm.expectRevert(bytes("Vault is already completed"));
        myVaultV2.deposit{value: 0.5 ether}(0);
        
        vm.stopPrank();
    }

    function testMultipleDepositsTrackCorrectly() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Multi Deposit", 4 ether, 7);

        myVaultV2.deposit{value: 1 ether}(0);
        myVaultV2.deposit{value: 2 ether}(0);
        
        (, , , , uint256 depositedAmount, , , , ) = myVaultV2.userVaults(user1, 0);
        assertEq(depositedAmount, 3 ether);

        vm.stopPrank();
    }

    function testWithdrawSuccess() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Withdraw Test", 4 ether, 2);
        myVaultV2.deposit{value: 4 ether}(0);

        vm.warp(block.timestamp + 3 days);
        vm.expectEmit(true, true, false, true, address(myVaultV2));
        emit MyVaultV2.Withdrawn(user1, 0, 4 ether);

        uint256 initialBalance = user1.balance;
        myVaultV2.withdraw(0);
        uint256 finalBalance = user1.balance;

        assertEq(finalBalance, initialBalance + 4 ether);
        
        (, , , , uint256 depositedAmount, uint256 withdrawnAmount, bool isActive, bool isCompleted, uint256 completedAt) 
            = myVaultV2.userVaults(user1, 0);
        assertEq(depositedAmount, 0);
        assertEq(withdrawnAmount, 4 ether);
        assertFalse(isActive);
        assertTrue(isCompleted);
        assertEq(completedAt, block.timestamp);
        
        vm.stopPrank();
    }

    function testWithdrawRevertsIfBeforeUnlockTimeAndGoalNotMet() public {
        vm.startPrank(user2);
        myVaultV2.createVault("Locked Vault", 5 ether, 5);
        myVaultV2.deposit{value: 3 ether}(0);

        vm.warp(block.timestamp + 2 days);
        vm.expectRevert(bytes("Cannot withdraw before unlock time or goal not met"));
        myVaultV2.withdraw(0);
        
        vm.stopPrank();
    }

    function testWithdrawRevertsIfNoFunds() public {
        vm.startPrank(user2);
        myVaultV2.createVault("Empty Vault", 5 ether, 5);

        vm.warp(block.timestamp + 5 days);
        vm.expectRevert(bytes("No funds to withdraw"));
        myVaultV2.withdraw(0);
        
        vm.stopPrank();
    }

    function testWithdrawRevertsIfInvalidVaultId() public {
        vm.prank(user1);
        myVaultV2.createVault("Valid Vault", 2 ether, 3);

        vm.prank(user1);
        vm.expectRevert(bytes("Invalid vault ID"));
        myVaultV2.withdraw(1);
    }

    function testWithdrawRevertsIfAlreadyCompleted() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Once Vault", 2 ether, 3);
        myVaultV2.deposit{value: 2 ether}(0);
        myVaultV2.withdraw(0);
        
        vm.expectRevert(bytes("Vault is already completed"));
        myVaultV2.withdraw(0);
        
        vm.stopPrank();
    }

    function testOnlyVaultOwnerCanDepositOrWithdraw() public {
        vm.prank(user1);
        myVaultV2.createVault("Owner Only", 2 ether, 3);

        vm.prank(user2);
        vm.expectRevert(bytes("Invalid vault ID"));
        myVaultV2.deposit{value: 1 ether}(0);

        vm.prank(user2);
        vm.expectRevert(bytes("Invalid vault ID"));
        myVaultV2.withdraw(0);
    }

    function testReactivateVaultSuccess() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Reusable Vault", 2 ether, 5);
        myVaultV2.deposit{value: 2 ether}(0);
        myVaultV2.withdraw(0);
        
        vm.expectEmit(true, true, false, true, address(myVaultV2));
        emit MyVaultV2.VaultReactivated(user1, 0, 5 ether, block.timestamp + 10 days);
        
        myVaultV2.reactivateVault(0, 5 ether, 10);
        
        (, , uint256 goalAmount, uint256 unlockTime, uint256 depositedAmount, uint256 withdrawnAmount, bool isActive, bool isCompleted, uint256 completedAt) 
            = myVaultV2.userVaults(user1, 0);
        
        assertEq(goalAmount, 5 ether);
        assertEq(depositedAmount, 0);
        assertEq(withdrawnAmount, 0);
        assertTrue(isActive);
        assertFalse(isCompleted);
        assertEq(completedAt, 0);
        assertEq(unlockTime, block.timestamp + 10 days);
        
        vm.stopPrank();
    }

    function testReactivateVaultRevertsIfNotCompleted() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Active Vault", 2 ether, 5);
        
        vm.expectRevert(bytes("Vault must be completed to reactivate"));
        myVaultV2.reactivateVault(0, 3 ether, 7);
        
        vm.stopPrank();
    }

    function testDeleteVaultSuccess() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Delete Me", 1 ether, 5);
        myVaultV2.deposit{value: 1 ether}(0);
        myVaultV2.withdraw(0);
        
        vm.expectEmit(true, true, false, true, address(myVaultV2));
        emit MyVaultV2.VaultDeleted(user1, 0);
        
        myVaultV2.deleteVault(0);
        
        (, , uint256 goalAmount, , , , bool isActive, , ) = myVaultV2.userVaults(user1, 0);
        assertEq(goalAmount, 0);
        assertFalse(isActive);
        
        vm.stopPrank();
    }

    function testDeleteVaultRevertsIfNotCompleted() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Active Vault", 2 ether, 5);
        
        vm.expectRevert(bytes("Can only delete completed vaults"));
        myVaultV2.deleteVault(0);
        
        vm.stopPrank();
    }

    function testDeleteVaultRevertsIfNotEmpty() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Has Funds", 2 ether, 5);
        myVaultV2.deposit{value: 1 ether}(0);
        
        vm.expectRevert(bytes("Vault must be empty to delete"));
        myVaultV2.deleteVault(0);
        
        vm.stopPrank();
    }

    function testGetVaultInfoForNonExistentVault() public {
        MyVaultV2.UserDeposit memory vault = myVaultV2.getVaultInfo(user1, 999);
        
        assertEq(vault.id, 0);
        assertEq(vault.goalAmount, 0);
        assertFalse(vault.isActive);
    }

    function testGetVaultInfoForDifferentUsers() public {
        vm.prank(user1);
        myVaultV2.createVault("User1 Vault", 5 ether, 10);
        
        vm.prank(user2);
        myVaultV2.createVault("User2 Vault", 10 ether, 20);
        
        MyVaultV2.UserDeposit memory user1Vault = myVaultV2.getVaultInfo(user1, 0);
        MyVaultV2.UserDeposit memory user2Vault = myVaultV2.getVaultInfo(user2, 0);
        
        assertEq(user1Vault.goalAmount, 5 ether);
        assertEq(user2Vault.goalAmount, 10 ether);
        assertEq(user1Vault.name, "User1 Vault");
        assertEq(user2Vault.name, "User2 Vault");
    }

    function testCanWithdrawReturnsFalseBeforeConditionsMet() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Waiting Vault", 10 ether, 30);
        myVaultV2.deposit{value: 1 ether}(0);
        vm.stopPrank();
        
        assertFalse(myVaultV2.canWithdraw(user1, 0));
    }

    function testCanWithdrawReturnsTrueWhenGoalMet() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Goal Met", 5 ether, 30);
        myVaultV2.deposit{value: 5 ether}(0);
        vm.stopPrank();
        
        assertTrue(myVaultV2.canWithdraw(user1, 0));
    }

    function testCanWithdrawReturnsTrueAfterTimeExpires() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Time Expired", 10 ether, 30);
        myVaultV2.deposit{value: 1 ether}(0);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 31 days);
        
        assertTrue(myVaultV2.canWithdraw(user1, 0));
    }

    function testCanWithdrawReturnsFalseForCompletedVault() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Completed", 1 ether, 10);
        myVaultV2.deposit{value: 1 ether}(0);
        myVaultV2.withdraw(0);
        vm.stopPrank();
        
        assertFalse(myVaultV2.canWithdraw(user1, 0));
    }

    function testGetTimeRemainingBeforeExpiry() public {
        vm.prank(user1);
        myVaultV2.createVault("Time Test", 5 ether, 10);
        
        uint256 timeRemaining = myVaultV2.getTimeRemaining(user1, 0);
        
        assertEq(timeRemaining, 10 days);
    }

    function testGetTimeRemainingAfterExpiry() public {
        vm.prank(user1);
        myVaultV2.createVault("Expired", 5 ether, 10);
        
        vm.warp(block.timestamp + 11 days);
        
        uint256 timeRemaining = myVaultV2.getTimeRemaining(user1, 0);
        
        assertEq(timeRemaining, 0);
    }

    function testGetTimeRemainingPartialTime() public {
        vm.prank(user1);
        myVaultV2.createVault("Partial Time", 5 ether, 10);
        
        vm.warp(block.timestamp + 5 days);
        
        uint256 timeRemaining = myVaultV2.getTimeRemaining(user1, 0);
        
        assertEq(timeRemaining, 5 days);
    }

    function testGetTimeRemainingForCompletedVault() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Complete Time", 1 ether, 10);
        myVaultV2.deposit{value: 1 ether}(0);
        myVaultV2.withdraw(0);
        vm.stopPrank();
        
        uint256 timeRemaining = myVaultV2.getTimeRemaining(user1, 0);
        assertEq(timeRemaining, 0);
    }

    function testGetProgressPercentageZeroDeposit() public {
        vm.prank(user1);
        myVaultV2.createVault("Zero Progress", 10 ether, 10);
        
        uint256 progress = myVaultV2.getProgressPercentage(user1, 0);
        assertEq(progress, 0);
    }

    function testGetProgressPercentageHalfway() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Half Progress", 10 ether, 10);
        myVaultV2.deposit{value: 5 ether}(0);
        vm.stopPrank();
        
        uint256 progress = myVaultV2.getProgressPercentage(user1, 0);
        assertEq(progress, 50);
    }

    function testGetProgressPercentageFullGoal() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Full Goal", 10 ether, 10);
        myVaultV2.deposit{value: 10 ether}(0);
        vm.stopPrank();
        
        uint256 progress = myVaultV2.getProgressPercentage(user1, 0);
        assertEq(progress, 100);
    }

    function testGetProgressPercentageCompletedVault() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Completed Progress", 2 ether, 10);
        myVaultV2.deposit{value: 2 ether}(0);
        myVaultV2.withdraw(0);
        vm.stopPrank();
        
        uint256 progress = myVaultV2.getProgressPercentage(user1, 0);
        assertEq(progress, 100);
    }

    function testGetProgressPercentageZeroGoal() public {
        uint256 progress = myVaultV2.getProgressPercentage(address(999), 999);
        assertEq(progress, 0);
    }

    function testGetActiveVaults() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Active 1", 1 ether, 10);
        myVaultV2.createVault("Active 2", 2 ether, 10);
        myVaultV2.createVault("To Complete", 1 ether, 10);
        
        myVaultV2.deposit{value: 1 ether}(2);
        myVaultV2.withdraw(2);
        vm.stopPrank();
        
        uint256[] memory activeVaults = myVaultV2.getActiveVaults(user1);
        assertEq(activeVaults.length, 2);
        assertEq(activeVaults[0], 0);
        assertEq(activeVaults[1], 1);
    }

    function testGetCompletedVaults() public {
        vm.startPrank(user1);
        myVaultV2.createVault("Active", 1 ether, 10);
        myVaultV2.createVault("Complete 1", 1 ether, 10);
        myVaultV2.createVault("Complete 2", 2 ether, 10);
        
        myVaultV2.deposit{value: 1 ether}(1);
        myVaultV2.withdraw(1);
        
        myVaultV2.deposit{value: 2 ether}(2);
        myVaultV2.withdraw(2);
        vm.stopPrank();
        
        uint256[] memory completedVaults = myVaultV2.getCompletedVaults(user1);
        assertEq(completedVaults.length, 2);
        assertEq(completedVaults[0], 1);
        assertEq(completedVaults[1], 2);
    }
}