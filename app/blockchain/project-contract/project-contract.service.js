/**
 * Service to interact with the Project contract
 */
"use strict";
var ProjectService = (function () {
    function ProjectService() {
    }
    /**
     * Retrieves the project parameters associated with the Project contract at the specified address
     * @param address {string} the blockchain address of the Project contract
     * @returns {Promise<ProjectParams>} a promise that resolves to the ProjectParams object when the blockchain request is complete
     */
    ProjectService.prototype.getProjectParams = function (address) {
        var _this = this;
        var params;
        var projectInstance = Project.at(address);
        var promise = new Promise(function (resolve, reject) {
            projectInstance.getProjectParams.call()
                .then(function (result) {
                if (result.length != 7) {
                    throw new Error('Could not find a Project contract at address ' + address);
                }
                params = {
                    address: address,
                    name: result[0],
                    desc: result[1],
                    owner: result[2],
                    target: result[3].toNumber(),
                    raised: result[4].toNumber(),
                    hours_remaining: _this.hoursRemaining(result[5].toNumber()),
                    stage: _this.stage(result[6].toNumber())
                };
            })
                .then(function () {
                resolve(params);
            })
                .catch(function (err) {
                reject(err);
            });
        });
        return promise;
    };
    /**
     * Sends money to a project to help fund it
     * @param address {string} the contract address of the project to fund
     * @param account {string} the address to send the money from
     * @param amount {string} the amount of money (in Wei) to send
     */
    ProjectService.prototype.fundProject = function (address, account, amount) {
        var projectInstance = Project.at(address);
        projectInstance.fund({ from: account, value: amount })
            .catch(function (err) {
            alert(err);
        });
    };
    /**
     * Determines the time difference (in hours) between the specified (future) timestamp and
     * the current time, as determined by the latest block
      * @param timestamp {number} the timestamp
     * @returns {number} the number of hours until that timestamp is reached (or zero if it has passed)
     */
    ProjectService.prototype.hoursRemaining = function (timestamp) {
        var currentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
        if (currentTime > timestamp) {
            return 0;
        }
        else {
            return Math.floor((timestamp - currentTime) / 3600);
        }
    };
    /**
     * Determines the project stage name based on the stage index
     * @param index {number} the index of the stages in the Project contract's Stages enum
     * @returns {string} the name of the corresponding stage
     */
    ProjectService.prototype.stage = function (index) {
        var stages = ['Open', 'Refund', 'FundingAchieved', 'Complete'];
        if (index >= stages.length) {
            throw new Error('Invalid stage ' + index);
        }
        else {
            return stages[index];
        }
    };
    return ProjectService;
}());
exports.ProjectService = ProjectService;
//# sourceMappingURL=project-contract.service.js.map