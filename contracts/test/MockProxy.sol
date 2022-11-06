// SPDX-License-Identifier: GPL-3

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract MockHotProxy {

    event MockHotSwap();
    
    function swap (bytes calldata) public payable {
        emit MockHotSwap();
    }
}
