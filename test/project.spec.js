"use strict";

// replicate the Stages enum
let PROJECT_STAGES = {
    Open: 0,
    Refund: 1,
    FundingAchieved: 2,
    Complete: 3
};


class ExpectedErrorWasNotThrown extends Error {
}
class ErrorWasThrownBeforeExpected extends Error {
}

describe('Project', (accounts) => {
    var hub;
    var projectPromise;


    beforeEach(() => {
        // create a new project every time
        // We can't use the 'contract' function to deploy a new project, because the project constructor takes arguments
        // Instead, use the FundingHub to deploy a new project (I'm not redeploying the hub because testrpc has gas issues and it takes too long with geth)
        hub = FundingHub.deployed();

        var desc = 'Calculate the last digit of PI';
        var owner = web3.eth.accounts[0];
        var target = web3.toWei(1, "ether");
        var deadline = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 10000;
        hub.createProject(name, desc, owner, target, deadline);

        projectPromise = hub.getProjectAddress.call(0);
    });


    describe('refund', () => {
        contract('FundingHub', (accounts)=> {
            it('should throw an error if stage == Stage.Open', (done) => {
                projectPromise
                    .then((address) => {
                        return Project.at(address).refund.call();
                    })
                    .then(() => {
                        throw new ExpectedErrorWasNotThrown('Successfully called refund() at stage Open');
                    })
                    .catch(err => {
                        if(err instanceof ExpectedErrorWasNotThrown){
                            throw err
                        } //else silence the error - it was expected
                    })
                    .then(done)
                    .catch(done);
            });
        });
    });
});

