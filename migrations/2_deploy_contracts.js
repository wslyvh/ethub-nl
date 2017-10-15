var EthubCommunity = artifacts.require("./EthubCommunity.sol");

module.exports = function(deployer) {
  deployer.deploy(EthubCommunity);
};

