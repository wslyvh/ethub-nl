import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import CommunityAbi from '../../build/contracts/EthubCommunity.json'

var Community = contract(CommunityAbi);

let etherscanBase = 'https://www.etherscan.io/';
let community;
let communityAddress;
let token;
let defaultAccount;

window.App = {
  start: function() {
    var self = this;

    Community.setProvider(web3.currentProvider);
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        self.setStatus('danger', "Please visit the site using Mist/MetaMask or a locally connected node.");
        return;
      }

      if (accs.length == 0) {
        self.setStatus('danger', "Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      if (web3.version.network == "3") { 
        etherscanBase = "https://ropsten.etherscan.io/"
      }

      defaultAccount = accs[0];
      web3.defaultAccount = defaultAccount;
      self.init();
    });
  },

  setStatus: function(type, message) {
    var status = document.getElementById("alert");
    status.className = "alert alert-" + type;
    status.innerHTML = message;
  },

  init: function() {
    var self = this;

    Community.deployed().then(function(instance) {
      community = instance;
      communityAddress = instance.address;

      return community;
    }).catch(function(error) {
      document.getElementById("requestButton").className = "hide";      
      self.setStatus('danger', error.message);
    }).then(function(instance) {

      var events = community.allEvents();
      events.watch(function(error, event) {
          if (error) {
            self.setStatus('danger', error.message);
          } else {
            self.setStatus('info', event.event + ": " + JSON.stringify(event.args));
          }
      });

      return community.getTokenAddress();
    }).then(function(tokenAddress) {
      token = tokenAddress;
      
      document.getElementById("communityAddress").href = etherscanBase + "address/" + communityAddress;
      document.getElementById("tokenAddress").href = etherscanBase + "token/" + tokenAddress;
      document.getElementById("donationAddress").href = etherscanBase + "address/" + communityAddress;
      document.getElementById("donationAddress").innerText = communityAddress;

      return community.getMemberCount();
    }).then(function(memberCount) { 
      document.getElementById("memberCount").innerText = memberCount + " members";
      document.getElementById("requestTokenContainer").style.display = 'block';
      self.setStatus('info', "Successfully connected to network.");
    })
  },

  requestToken: function() {
    var self = this;

    this.setStatus('info', 'Sending transaction. Please wait..');

    community.claimCommunityToken({ from: defaultAccount, gas: 135000, gasPrice: 10000000000 })
    .then(tx => {
      var txUri = etherscanBase + "tx/" + tx.tx;
      if(tx.logs.length == 0) { 
        self.setStatus('warning', "Transfer failed. <a target='_blank' href='"+ txUri +"'>View</a> transaction. <br/>"+ 
          "You can only request a token once. ");
      }
      else {
        self.setStatus('success', "Token Transferred. <a target='_blank' href='"+ txUri +"'>View</a> transaction.");
      }

      
    }).catch(function(error) {
      
      self.setStatus('danger', error.message);
    });
  }
};

window.addEventListener('load', function() {
    
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.log("Using Mist/MetaMask");
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log("No web3 detected. Using localhost")
    //web3 = new Web3(new Web3.providers.HttpProvider("https://api.myetherapi.com/eth"));
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
