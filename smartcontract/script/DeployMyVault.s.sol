// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MyVaultV2} from "../src/MyVault.sol";

contract DeployMyVault is Script {
    function run() external returns (MyVaultV2) {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");

        vm.startBroadcast(deployer);
        MyVaultV2 myVaultV2 = new MyVaultV2();

        console.log("MyVault deployed to:", address(myVaultV2));
        console.log("Deployed by:", deployer);

        vm.stopBroadcast();

        return myVaultV2;
    }
}