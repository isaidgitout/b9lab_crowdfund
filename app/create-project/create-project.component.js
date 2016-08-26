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
var CreateProjectComponent = (function () {
    function CreateProjectComponent(fundingHubService, fb) {
        this.fundingHubService = fundingHubService;
        this.fb = fb;
        this.createProjectForm = fb.group({
            name: ['', forms_1.Validators.required],
            desc: ['', forms_1.Validators.required],
            owner: [this.getAccounts()[0], forms_1.Validators.required],
            target: ['', forms_1.Validators.required],
            duration: ['', forms_1.Validators.required]
        });
    }
    ;
    /**
     * Retrieves the new project details (name, description, owner, goal amount, crowd fund duration)
     * from the web form and sends the appropriate transaction to the FundingHub on the blockchain
     * to create the project
     */
    CreateProjectComponent.prototype.create = function () {
        var name = this.createProjectForm.controls['name'].value;
        var description = this.createProjectForm.controls['desc'].value;
        var owner = this.createProjectForm.controls['owner'].value;
        var target = this.createProjectForm.controls['target'].value;
        var now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
        var deadline = now + parseInt(this.createProjectForm.controls['duration'].value) * 3600;
        this.fundingHubService.createProject(name, description, owner, target, deadline);
    };
    /**
     * @returns {string[]} the list of ethereum addresses managed by the local node
     */
    CreateProjectComponent.prototype.getAccounts = function () {
        return web3.eth.accounts;
    };
    CreateProjectComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'create-project',
            templateUrl: './create-project.component.html',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            providers: [forms_1.FormBuilder, fundinghub_contract_service_1.FundingHubService]
        }), 
        __metadata('design:paramtypes', [fundinghub_contract_service_1.FundingHubService, forms_1.FormBuilder])
    ], CreateProjectComponent);
    return CreateProjectComponent;
}());
exports.CreateProjectComponent = CreateProjectComponent;
//# sourceMappingURL=create-project.component.js.map