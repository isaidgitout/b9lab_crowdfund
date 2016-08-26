import { Component } from '@angular/core';
import {FundingHubService} from './blockchain/fundinghub-contract/fundinghub-contract.service';
import {ProjectService} from './blockchain/project-contract/project-contract.service';
import {ProjectParams} from './blockchain/project-contract/project-contract.service';
import {CreateProjectComponent} from './create-project/create-project.component';
import {ActiveProjectsComponent} from './active-projects/active-projects.component';

// defined the the truffle app.js file
declare var web3: any;

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    directives: [CreateProjectComponent, ActiveProjectsComponent]
})
export class AppComponent {
    private showCreateForm: boolean;
    private showActiveProjects: boolean;

    constructor(){
        this.showCreateForm = false;
        this.showActiveProjects = false;
    }
}
