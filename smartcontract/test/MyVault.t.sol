// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MyVault} from "../src/MyVault.sol";


contract MyVaultTest is Test {
    MyVault public myVault;
    
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        myVault = new MyVault();
        vm.deal(user1 , 10 ether);
        vm.deal(user2 , 10 ether);
    }

    function testCreateVaultSuccess() public {
        vm.prank(user1);

        vm.expectEmit(true, true, false, true, address(myVault));
        emit MyVault.VaultCreated(user1, 0, 5 ether, block.timestamp + 10 days);

        myVault.createVault(5 ether, 10);
        (uint256 id, uint256 goalAmount, uint256 unlockTime, uint256 depositedAmount, bool isActive) = myVault.userVaults(user1, 0);
        assertEq(id,0 );
        assertEq(goalAmount, 5 ether);
        assertEq(depositedAmount, 0);
        assertTrue(isActive);
        assertEq(unlockTime, block.timestamp + 10 days);

        assertEq(myVault.userVaultCount(user1), 1);
    }

    function testCreateVaultRevertsWithZeroGoalAmount() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Goal amount must be greater than zero"));
        myVault.createVault(0, 10);
    }
    function testCreateVaultRevertsWithZeroLockDuration() public {
        vm.prank(user1);
        vm.expectRevert(bytes("Lock duration must be greater than zero"));
        myVault.createVault(5 ether, 0);
    }

    function testDepositSuccess() public {
        vm.startPrank(user2);
        myVault.createVault(3 ether, 5);

        vm.expectEmit(true, true, false, true, address(myVault));
        emit MyVault.DepositMade(user2, 0, 1 ether, 1 ether);
        myVault.deposit{value: 1 ether}(0);

        vm.stopPrank();
    }

    function testDepositRevertsWithZeroAmount() public {
        vm.prank(user2);
        myVault.createVault(3 ether, 5);

        vm.prank(user2);
        vm.expectRevert(bytes("Deposit amount must be greater than zero"));
        myVault.deposit{value: 0}(0);
    }

    function testMultipleDepositsTrackCorrectly() public{
        vm.startPrank(user1);
        myVault.createVault(4 ether, 7);

        myVault.deposit{value: 1 ether}(0);
        myVault.deposit{value: 2 ether}(0);
        
        (, , , uint256 depositedAmount, ) = myVault.userVaults(user1, 0);
        assertEq(depositedAmount, 3 ether);

        vm.stopPrank();
    }

    function testWithdrawSuccess() public{
        vm.startPrank(user1);
        myVault.createVault(4 ether, 2);
        myVault.deposit{value: 4 ether}(0);

        vm.warp(block.timestamp + 3 days);
        vm.expectEmit(true, true, false, true, address(myVault));
        emit MyVault.Withdrawn(user1, 0, 4 ether);

        uint256 initialBalance = user1.balance;
        myVault.withdraw(0);
        uint256 finalBalance = user1.balance;

        assertEq(finalBalance, initialBalance + 4 ether);
        
        (, , , uint256 depositedAmount, bool isActive) = myVault.userVaults(user1, 0);
        assertEq(depositedAmount, 0);
        assertFalse(isActive);
    }

    function testWithdrawRevertsIfBeforeUnlockTimeAndGoalNotMet() public{
        vm.startPrank(user2);
        myVault.createVault(5 ether, 5);
        myVault.deposit{value: 3 ether}(0);

        vm.warp(block.timestamp + 2 days);
        vm.expectRevert(bytes("Cannot withdraw before unlock time or goal not met"));
        myVault.withdraw(0);
        
        vm.stopPrank();
    }

    function testWithdrawRevertsIfNoFunds() public{
        vm.startPrank(user2);
        myVault.createVault(5 ether, 5);

        vm.warp(block.timestamp + 5 days);
        vm.expectRevert(bytes("No funds to withdraw"));
        myVault.withdraw(0);
        
        vm.stopPrank();
    }

    function testWithdrawRevertsIfInvalidVaultId() public{
        vm.prank(user1);
        myVault.createVault(2 ether, 3);

        vm.prank(user1);
        vm.expectRevert(bytes("Invalid vault ID"));
        myVault.withdraw(1);
    }

    function testOnlyVaultOwnerCanDepositOrWithdraw() public {
        vm.prank(user1);
        myVault.createVault(2 ether, 3);

        vm.prank(user2);
        vm.expectRevert(bytes("Invalid vault ID"));
        myVault.deposit{value: 1 ether}(0);

        vm.prank(user2);
        vm.expectRevert(bytes("Invalid vault ID"));
        myVault.withdraw(0);
    }

    function testGetVaultInfoForNonExistentVault() public {
    MyVault.UserDeposit memory vault = myVault.getVaultInfo(user1, 999);
    
    assertEq(vault.id, 0);
    assertEq(vault.goalAmount, 0);
    assertFalse(vault.isActive);
}

function testGetVaultInfoForDifferentUsers() public {
    vm.prank(user1);
    myVault.createVault(5 ether, 10);
    
    vm.prank(user2);
    myVault.createVault(10 ether, 20);
    
    
    MyVault.UserDeposit memory user1Vault = myVault.getVaultInfo(user1, 0);
    MyVault.UserDeposit memory user2Vault = myVault.getVaultInfo(user2, 0);
    
    assertEq(user1Vault.goalAmount, 5 ether);
    assertEq(user2Vault.goalAmount, 10 ether);
}

function testCanWithdrawReturnsFalseBeforeConditionsMet() public {
    vm.startPrank(user1);
    myVault.createVault(10 ether, 30);
    myVault.deposit{value: 1 ether}(0);
    vm.stopPrank();
    
    
    assertFalse(myVault.canWithdraw(user1, 0));
}

function testCanWithdrawReturnsTrueWhenGoalMet() public {
    vm.startPrank(user1);
    myVault.createVault(5 ether, 30);
    myVault.deposit{value: 5 ether}(0);
    vm.stopPrank();
    
    
    assertTrue(myVault.canWithdraw(user1, 0));
}

function testCanWithdrawReturnsTrueAfterTimeExpires() public {
    vm.startPrank(user1);
    myVault.createVault(10 ether, 30);
    myVault.deposit{value: 1 ether}(0);
    vm.stopPrank();
    
    
    vm.warp(block.timestamp + 31 days);
    
    
    assertTrue(myVault.canWithdraw(user1, 0));
}

function testCanWithdrawReturnsFalseForInactiveVault() public {
    vm.startPrank(user1);
    myVault.createVault(1 ether, 10);
    myVault.deposit{value: 1 ether}(0);
    myVault.withdraw(0);  
    vm.stopPrank();
    
    
    assertFalse(myVault.canWithdraw(user1, 0));
}

function testGetTimeRemainingBeforeExpiry() public {
    vm.prank(user1);
    myVault.createVault(5 ether, 10);
    
    uint256 timeRemaining = myVault.getTimeRemaining(user1, 0);
    
   
    assertEq(timeRemaining, 10 days);
}

function testGetTimeRemainingAfterExpiry() public {
    vm.prank(user1);
    myVault.createVault(5 ether, 10);
    
   
    vm.warp(block.timestamp + 11 days);
    
    uint256 timeRemaining = myVault.getTimeRemaining(user1, 0);
    
    
    assertEq(timeRemaining, 0);
}

function testGetTimeRemainingPartialTime() public {
    vm.prank(user1);
    myVault.createVault(5 ether, 10);
    
   
    vm.warp(block.timestamp + 5 days);
    
    uint256 timeRemaining = myVault.getTimeRemaining(user1, 0);
    
    
    assertEq(timeRemaining, 5 days);
}

function testGetProgressPercentageZeroDeposit() public {
    vm.prank(user1);
    myVault.createVault(10 ether, 10);
    
    uint256 progress = myVault.getProgressPercentage(user1, 0);
    assertEq(progress, 0);
}

function testGetProgressPercentageHalfway() public {
    vm.startPrank(user1);
    myVault.createVault(10 ether, 10);
    myVault.deposit{value: 5 ether}(0);
    vm.stopPrank();
    
    uint256 progress = myVault.getProgressPercentage(user1, 0);
    assertEq(progress, 50);
}

function testGetProgressPercentageFullGoal() public {
    vm.startPrank(user1);
    myVault.createVault(10 ether, 10);
    myVault.deposit{value: 10 ether}(0);
    vm.stopPrank();
    
    uint256 progress = myVault.getProgressPercentage(user1, 0);
    assertEq(progress, 100);
}

function testGetProgressPercentageOverGoal() public {
    vm.startPrank(user1);
    myVault.createVault(8 ether, 10);
    myVault.deposit{value: 10 ether}(0);
    vm.stopPrank();
    
    uint256 progress = myVault.getProgressPercentage(user1, 0);
    assertEq(progress, 100);
}

function testGetProgressPercentageZeroGoal() public {

    uint256 progress = myVault.getProgressPercentage(address(999), 999);
    assertEq(progress, 0);
}

}