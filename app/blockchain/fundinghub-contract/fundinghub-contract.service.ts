/**
 * Service to interact with the FundingHub contract
 */

// This was defined in the truffle app.js file
declare var FundingHub: any;

export interface IFundingHubService {
    getProjectAddresses(): Promise<string[]>;
    createProject(name: string, description: string, owner: string, target: string, deadline: number);
}

export class FundingHubService implements IFundingHubService {

    private contract;

    constructor() {
        this.contract = FundingHub.deployed();
    }

    getProjectAddresses(): Promise<string[]> {
        var numProjects: number;
        var projects: string [] = [];

        var promise = new Promise((resolve, reject) => {
            this.contract.numProjects.call()
                .then((count)=> {
                    numProjects = count;
                })
                .then(() => {
                    var addressPromises = [];

                    for (var i = 0; i < numProjects; i++) {
                        addressPromises.push(
                            this.contract.getProjectAddress.call(i)
                                .then((address) => {
                                    projects.push(address);
                                })
                        )
                    }
                    return Promise.all(addressPromises);
                })
                .then(()=> {
                    resolve(projects);
                })
                .catch((err)=> {
                    reject(err);
                });
        });

        return promise;
    }

    createProject(name: string, description: string, owner: string, target: string, deadline: number) {
        this.contract.createProject(name, description, owner, target, deadline, {from: owner, gas: 3000000})
        .catch( err => {
            alert(err);
        });
    }
}


