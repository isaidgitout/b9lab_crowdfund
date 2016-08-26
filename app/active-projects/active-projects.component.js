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
var forms_1 = require('@angular/forms');
var fundinghub_contract_service_1 = require('../blockchain/fundinghub-contract/fundinghub-contract.service');
var project_contract_service_1 = require('../blockchain/project-contract/project-contract.service');
var ActiveProjectsComponent = (function () {
    function ActiveProjectsComponent(fundingHubService, projectService, fb) {
        var _this = this;
        this.fundingHubService = fundingHubService;
        this.projectService = projectService;
        this.fb = fb;
        this.projects = [];
        var filter = web3.eth.filter('latest');
        filter.watch(function (error, result) {
            _this.refreshProjects();
        });
        this.contributeForm = fb.group({
            address: ['', forms_1.Validators.required],
            account: [this.getAccounts()[0], forms_1.Validators.required],
            amount: ['', forms_1.Validators.required]
        });
        this.refreshProjects();
    }
    /**
     * Filters the list of projects to those that are still active (as determined by their on-chain 'stage' parameter
     * @returns {ProjectParams[]} the list of open projects
     */
    ActiveProjectsComponent.prototype.openProjects = function () {
        var openProjects = this.projects.filter(function (project) { return project.stage == 'Open'; });
        return openProjects.sort(function (a, b) {
            return a.name < b.name ? -1 : 1;
        });
    };
    /**
     * Cycles through all project in the FundingHub and retrieves the project parameters
     */
    ActiveProjectsComponent.prototype.refreshProjects = function () {
        var _this = this;
        var newProjects = [];
        this.fundingHubService.getProjectAddresses()
            .then(function (addresses) {
            var projectPromises = [];
            for (var i = 0; i < addresses.length; i++) {
                projectPromises.push(_this.projectService.getProjectParams(addresses[i])
                    .then(function (p) {
                    newProjects.push(p);
                }));
            }
            return Promise.all(projectPromises);
        })
            .then(function () {
            _this.projects = newProjects;
        });
    };
    /**
     * @returns {string[]} the list of ethereum addresses managed by the local node
     */
    ActiveProjectsComponent.prototype.getAccounts = function () {
        return web3.eth.accounts;
    };
    /**
     * Used by the individual project controls to choose the address of the project to send money to
     * @param address {string} the address of the project to send money to
     */
    ActiveProjectsComponent.prototype.setAddress = function (address) {
        this.contributeForm.controls['address'].value = address;
    };
    /**
     * Retrieves the destination address, sender account and contribution amount from the web form
     * and sends appropriate transaction to the project on the blockchain
     */
    ActiveProjectsComponent.prototype.contribute = function () {
        var address = this.contributeForm.controls['address'].value;
        var account = this.contributeForm.controls['account'].value;
        var amount = this.contributeForm.controls['amount'].value;
        this.projectService.fundProject(address, account, amount);
    };
    ActiveProjectsComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'active-projects',
            templateUrl: './active-projects.component.html',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            providers: [fundinghub_contract_service_1.FundingHubService, project_contract_service_1.ProjectService, forms_1.FormBuilder],
        }), 
        __metadata('design:paramtypes', [fundinghub_contract_service_1.FundingHubService, project_contract_service_1.ProjectService, forms_1.FormBuilder])
    ], ActiveProjectsComponent);
    return ActiveProjectsComponent;
}());
exports.ActiveProjectsComponent = ActiveProjectsComponent;
//# sourceMappingURL=active-projects.component.js.map