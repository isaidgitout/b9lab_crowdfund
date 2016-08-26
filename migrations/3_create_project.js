module.exports = function (deployer) {
    deployer.then(function () {
        var hub = FundingHub.deployed();

        var name = 'findPI';
        var desc = 'Calculate the last digit of PI';
        var owner = web3.eth.accounts[0];
        var target = web3.toWei(1, "ether");
        var deadline = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 100;

        hub.createProject(name, desc, owner, target, deadline);
        hub.createProject('idunno', 'something', owner, target, deadline+300);
    });
};
