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

    /**
     * Retrieves the list of project addresses managed by the FundingHub
     * @returns {Promise<string[]>} A promise that resolves to the project list when all blockchain requests are complete
     */
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

    /**
     * Sends the specified parameters to the FundingHub to create a new project
     * @param name {string} the name of the project
     * @param description {string} a description of the project
     * @param owner {string} the address of the person who owns the project (who will receive the money when it is funded)
     * @param target {string} the crowd funding goal
     * @param deadline {number} a timestamp indicating when the crowd funding period is over
     */
    createProject(name: string, description: string, owner: string, target: string, deadline: number) {
        this.contract.createProject(name, description, owner, target, deadline, {from: owner, gas: 3000000})
        .catch( err => {
            alert(err);
        });
    }
}


