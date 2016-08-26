import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import {FundingHubService} from '../blockchain/fundinghub-contract/fundinghub-contract.service';

// defined in the truffle app.js file
declare var web3: any;

@Component({
    moduleId: module.id,
    selector: 'create-project',
    templateUrl: './create-project.component.html',
    directives: [REACTIVE_FORM_DIRECTIVES],
    providers: [FormBuilder, FundingHubService]
})
export class CreateProjectComponent {
    private createProjectForm: FormGroup;

    constructor(private fundingHubService: FundingHubService, private fb: FormBuilder) {
        this.createProjectForm = fb.group({
            name: ['', Validators.required],
            desc: ['', Validators.required],
            owner: [this.getAccounts()[0], Validators.required],
            target: ['', Validators.required],
            duration: ['', Validators.required]
        });
    };

    /**
     * Retrieves the new project details (name, description, owner, goal amount, crowd fund duration)
     * from the web form and sends the appropriate transaction to the FundingHub on the blockchain
     * to create the project
     */
    create() {
        var name: string = this.createProjectForm.controls['name'].value;
        var description: string = this.createProjectForm.controls['desc'].value;
        var owner :string = this.createProjectForm.controls['owner'].value;
        var target: string = this.createProjectForm.controls['target'].value;
        var now: number = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
        var deadline: number = now + parseInt(this.createProjectForm.controls['duration'].value) * 3600;
        this.fundingHubService.createProject(name, description, owner, target, deadline);
    }

    /**
     * @returns {string[]} the list of ethereum addresses managed by the local node
     */
    getAccounts() {
        return web3.eth.accounts;
    }
}





