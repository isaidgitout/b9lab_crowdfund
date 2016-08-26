/**
 * Service to interact with the FundingHub contract
 */
"use strict";
var FundingHubService = (function () {
    function FundingHubService() {
        this.contract = FundingHub.deployed();
    }
    FundingHubService.prototype.getProjectAddresses = function () {
        var _this = this;
        var numProjects;
        var projects = [];
        var promise = new Promise(function (resolve, reject) {
            _this.contract.numProjects.call()
                .then(function (count) {
                numProjects = count;
            })
                .then(function () {
                var addressPromises = [];
                for (var i = 0; i < numProjects; i++) {
                    addressPromises.push(_this.contract.getProjectAddress.call(i)
                        .then(function (address) {
                        projects.push(address);
                    }));
                }
                return Promise.all(addressPromises);
            })
                .then(function () {
                resolve(projects);
            })
                .catch(function (err) {
                reject(err);
            });
        });
        return promise;
    };
    FundingHubService.prototype.createProject = function (name, description, owner, target, deadline) {
        this.contract.createProject(name, description, owner, target, deadline, { from: owner, gas: 3000000 })
            .catch(function (err) {
            alert(err);
        });
    };
    return FundingHubService;
}());
exports.FundingHubService = FundingHubService;
//# sourceMappingURL=fundinghub-contract.service.js.map