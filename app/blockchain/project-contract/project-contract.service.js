/**
 * Service to interact with the Project contract
 */
"use strict";
var ProjectService = (function () {
    function ProjectService() {
    }
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
     * Determine how many hours into the future a timestamp is (using the last block as a reference)
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
     * Return the name of the project stage corresponding to the Stage enum index
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