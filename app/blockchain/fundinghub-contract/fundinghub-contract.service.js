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
    return FundingHubService;
}());
exports.FundingHubService = FundingHubService;
//# sourceMappingURL=fundinghub-contract.service.js.map