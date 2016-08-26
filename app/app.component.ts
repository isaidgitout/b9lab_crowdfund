import { Component } from '@angular/core';
import {FundingHubService} from './blockchain/fundinghub-contract/fundinghub-contract.service';
import {ProjectService} from './blockchain/project-contract/project-contract.service';
import {ProjectParams} from './blockchain/project-contract/project-contract.service';

// defined the the truffle app.js file
declare var web3: any;

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    providers: [FundingHubService, ProjectService]
})
export class AppComponent {

    private projects: ProjectParams[];

    constructor(private fundingHubService: FundingHubService, private projectService: ProjectService){
        this.projects = [];

        var filter = web3.eth.filter('latest');
        filter.watch((error, result) => {
            this.refreshProjects();
        })

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
}
