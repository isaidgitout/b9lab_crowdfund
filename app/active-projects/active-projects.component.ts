import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { FundingHubService } from '../blockchain/fundinghub-contract/fundinghub-contract.service';
import { ProjectParams } from '../blockchain/project-contract/project-contract.service';
import { ProjectService } from '../blockchain/project-contract/project-contract.service';

// defined the the truffle app.js file
declare var web3: any;

@Component({
    moduleId: module.id,
    selector: 'active-projects',
    templateUrl: './active-projects.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES],
    providers: [FundingHubService, ProjectService, FormBuilder],
})
export class ActiveProjectsComponent {
    private projects: ProjectParams[];
    private contributeForm: FormGroup;
    private projectAddress: string;

    constructor(private fundingHubService: FundingHubService, private projectService: ProjectService, private fb: FormBuilder) {
        this.projects = [];

        var filter = web3.eth.filter('latest');
        filter.watch((error, result) => {
            this.refreshProjects();
        });

        this.contributeForm = fb.group({
            address: ['', Validators.required],
            account: [this.getAccounts()[0], Validators.required],
            amount: ['', Validators.required]
        });

        this.refreshProjects();
    }

    /**
     * Filters the list of projects to those that are still active (as determined by their on-chain 'stage' parameter
     * @returns {ProjectParams[]} the list of open projects
     */
    openProjects(): ProjectParams[] {
        var openProjects: ProjectParams[] = this.projects.filter((project: ProjectParams) => project.stage == 'Open');
        return openProjects.sort((a: ProjectParams, b: ProjectParams) => {
            return a.name < b.name ? -1 : 1
        });
    }

    /**
     * Cycles through all project in the FundingHub and retrieves the project parameters
     */
    refreshProjects() {
        var newProjects = [];

        this.fundingHubService.getProjectAddresses()
            .then((addresses) => {
                var projectPromises = [];

                for (var i = 0; i < addresses.length; i++) {
                    projectPromises.push(
                        this.projectService.getProjectParams(addresses[i])
                            .then((p: ProjectParams) => {
                                newProjects.push(p);
                            })
                    )
                }
                return Promise.all(projectPromises);
            })
            .then(() => {
                this.projects = newProjects;
            })
    }

    /**
     * @returns {string[]} the list of ethereum addresses managed by the local node
     */
    getAccounts(): string[] {
        return web3.eth.accounts;
    }

    /**
     * Used by the individual project controls to choose the address of the project to send money to
     * @param address {string} the address of the project to send money to
     */
    setAddress(address: string) {
        this.contributeForm.controls['address'].value = address;
    }

    /**
     * Retrieves the destination address, sender account and contribution amount from the web form
     * and sends appropriate transaction to the project on the blockchain
     */
    contribute() {
        var address: string = this.contributeForm.controls['address'].value;
        var account: string = this.contributeForm.controls['account'].value;
        var amount: string = this.contributeForm.controls['amount'].value;
        this.projectService.fundProject(address, account, amount);
    }
}
