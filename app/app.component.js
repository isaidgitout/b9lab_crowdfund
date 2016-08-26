"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var fundinghub_contract_service_1 = require('./blockchain/fundinghub-contract/fundinghub-contract.service');
var project_contract_service_1 = require('./blockchain/project-contract/project-contract.service');
var AppComponent = (function () {
    function AppComponent(fundingHubService, projectService) {
        this.fundingHubService = fundingHubService;
        this.projectService = projectService;
        var params = [];
        fundingHubService.getProjectAddresses()
            .then(function (addresses) {
            var projectPromises = [];
            for (var i = 0; i < addresses.length; i++) {
                projectPromises.push(projectService.getProjectParams(addresses[i])
                    .then(function (p) {
                    params.push(p);
                }));
            }
            return Promise.all(projectPromises);
        })
            .then(function () {
            console.log(params);
        });
    }
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'app/app.component.html',
            providers: [fundinghub_contract_service_1.FundingHubService, project_contract_service_1.ProjectService]
        }), 
        __metadata('design:paramtypes', [fundinghub_contract_service_1.FundingHubService, project_contract_service_1.ProjectService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map