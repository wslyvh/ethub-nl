const expectedExceptionPromise = require("../utils/expectedException.js");
web3.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined.js");
Promise = require("bluebird");
Promise.allNamed = require("../utils/sequentialPromiseNamed.js");
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");

if (typeof web3.eth.getAccountsPromise === "undefined") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

const EthubCommunity = artifacts.require("./EthubCommunity.sol");

contract('EthubCommunity', function(accounts) {

    let owner, member1, member2;
    let community;
    let token;

    before("should prepare", function() {
        assert.isAtLeast(accounts.length, 3);
        owner = accounts[0];
        member1 = accounts[1];
        member2 = accounts[2];
    });

    beforeEach("should deploy a new Community", function() {

        return EthubCommunity.new({ from: owner })
            .then(instance => community = instance)
            .then(() => community.getTokenAddress())
            .then(tokenAddress => token = tokenAddress);
    });
        
    describe("Community members", function() {
        
        it("should claim a community recognition token", function() {
            
            return community.claimCommunityToken({ from: member1 })
                .then(tx => {
                    assert.strictEqual(tx.logs.length, 1);
                    assert.strictEqual(tx.receipt.logs.length, 3);
                    
                    const logTokenClaimed = tx.logs[0];
                    assert.strictEqual(logTokenClaimed.event, "TokenClaimed");

                    return community.getMemberCount();
                })
                .then(tx => { 
                    assert.strictEqual(tx.toNumber(), 1);

                    return community.claimCommunityToken({ from: member2 });
                }).then(tx => {
                    assert.strictEqual(tx.logs.length, 1);
                    assert.strictEqual(tx.receipt.logs.length, 3);
                    
                    const logTokenClaimed = tx.logs[0];
                    assert.strictEqual(logTokenClaimed.event, "TokenClaimed");

                    return community.getMemberCount();
                })
                .then(tx => { 
                    assert.strictEqual(tx.toNumber(), 2);
                })
        });
    });
});
