module.exports = function (deployer) {
    deployer.deploy(Migrations);

    //2_deploy_contracts.js
    deployer.deploy(FundingHub);

    //3_create_project.js
    deployer.then(function () {
        var hub = FundingHub.deployed();
        var name = 'findPI';
        var desc = 'Calculate the last digit of PI';
        var owner = web3.eth.accounts[0];
        var target = web3.toWei(1, "ether");
        var deadline = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 100;

        hub.createProject(name, desc, owner, target, deadline)
            .then(function () {
                return hub.getProjectAddress.call(0);
            })
            .then(function (address) {
                return Project.at(address).getProjectParams.call();
            })
            .then(function(params){
                console.log(params[0]);
                console.log(params[1]);
                console.log(params[2]);
                console.log(params[3].toNumber());
                console.log(params[4].toNumber());
                console.log(params[5].toNumber());
            });
    });
};
