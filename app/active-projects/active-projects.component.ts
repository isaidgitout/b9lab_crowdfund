
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import {FundingHubService} from '../blockchain/fundinghub-contract/fundinghub-contract.service';
import {ProjectParams} from '../blockchain/project-contract/project-contract.service';
import {ProjectService} from '../blockchain/project-contract/project-contract.service';

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

    constructor(private fundingHubService: FundingHubService, private projectService: ProjectService, private fb: FormBuilder){
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

    openProjects(): ProjectParams[] {
        return this.projects.filter((project: ProjectParams) => project.stage == 'Open');
    }

    refreshProjects() {
        var newProjects = [];

        this.fundingHubService.getProjectAddresses()
            .then( (addresses) => {
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

    getAccounts(){
        return web3.eth.accounts;
    }

    setAddress(address: string){
        this.contributeForm.controls['address'].value = address;
    }

    contribute(){
        var address: string = this.contributeForm.controls['address'].value;
        var account: string = this.contributeForm.controls['account'].value;
        var amount: string = this.contributeForm.controls['amount'].value;
        this.projectService.fundProject(address, account, amount);
    }
}
