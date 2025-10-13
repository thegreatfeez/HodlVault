// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MyVault} from "../src/MyVault.sol";

contract DeployMyVault is Script {
    function run() external returns (MyVault) {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");

        vm.startBroadcast(deployer);
        MyVault myVault = new MyVault();

        console.log("MyVault deployed to:", address(myVault));
        console.log("Deployed by:", deployer);

        vm.stopBroadcast();

        return myVault;
    }
}