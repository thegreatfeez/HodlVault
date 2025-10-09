// SPDX-License-Identifier: UNLICENSED
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
}
