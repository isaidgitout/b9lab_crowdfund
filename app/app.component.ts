import { Component } from '@angular/core';
import {FundingHubService} from './blockchain/fundinghub-contract/fundinghub-contract.service';
import {ProjectService} from './blockchain/project-contract/project-contract.service';
import {ProjectParams} from './blockchain/project-contract/project-contract.service';


@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    providers: [FundingHubService, ProjectService]
})
export class AppComponent {

    constructor(private fundingHubService: FundingHubService, private projectService: ProjectService){
        var params = [];

        fundingHubService.getProjectAddresses()
        .then( (addresses) => {
            var projectPromises: ProjectParams[] = [];

            for (var i = 0; i < addresses.length; i++) {
                projectPromises.push(
                    projectService.getProjectParams(addresses[i])
                    .then((p: ProjectParams) => {
                        params.push(p);
                    })
                )
            }
            return Promise.all(projectPromises);
        })
        .then(() => {
            console.log(params);
        })
    }
}
