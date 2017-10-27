pragma solidity ^0.4.13;

import './EthubToken.sol';
import 'zeppelin-solidity/contracts/ownership/Claimable.sol';
import 'zeppelin-solidity/contracts/ownership/CanReclaimToken.sol';

contract EthubCommunity is Claimable, CanReclaimToken {
    
    // Community-recognition token
    EthubToken public token;

    // Members
    mapping(address => uint) members;
    address[] memberIndex;
    
    function EthubCommunity() { 
        token = createTokenContract();
    }

    // creates the community recognition token.
    function createTokenContract() internal returns (EthubToken) {
        return new EthubToken();
    }

    // allow anyone to claim a recognition token
    function claimCommunityToken() public returns (bool success) { 
        require(members[msg.sender] == 0);

        members[msg.sender] = block.timestamp;
        memberIndex.push(msg.sender);

        token.mint(msg.sender, 1);

        TokenClaimed(msg.sender, block.timestamp);
        return true;
    }
    
    function() payable { }

    // get the count of members that claimed a recognition token
    function getMemberCount() 
        constant
        public
        returns (uint count) { 
            return memberIndex.length;
    }
    
    function getTokenAddress() constant returns (address tokenAddress) {
        return token;
    }

    // reclaim all available funds
    function reclaimBalance() external onlyOwner {
        owner.transfer(this.balance);
    }

    event TokenClaimed(address indexed member, uint timestamp);
}