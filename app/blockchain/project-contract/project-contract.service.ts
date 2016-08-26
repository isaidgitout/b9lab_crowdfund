/**
 * Service to interact with the Project contract
 */

// This was defined in the truffle app.js file
declare var Project: any;
declare var web3: any;

export interface ProjectParams {
    address: string;
    name: string;
    desc: string;
    owner: string;
    target: number;
    raised: number;
    hours_remaining: number;
    stage: string;
}

export interface IProjectService {
    getProjectParams(address: string): Promise<ProjectParams>;
    fundProject(address: string, account: string, amount: string);
}

export class ProjectService implements IProjectService {

    /**
     * Retrieves the project parameters associated with the Project contract at the specified address
     * @param address {string} the blockchain address of the Project contract
     * @returns {Promise<ProjectParams>} a promise that resolves to the ProjectParams object when the blockchain request is complete
     */
    getProjectParams(address: string) {
        var params: ProjectParams;
        var projectInstance = Project.at(address);

        var promise = new Promise((resolve, reject) => {
            projectInstance.getProjectParams.call()
                .then((result) => {
                    if (result.length != 7) {
                        throw new Error('Could not find a Project contract at address ' + address);
                    }
                    params = {
                        address: address,
                        name: result[0],
                        desc: result[1],
                        owner: result[2],
                        target: result[3].toNumber(),
                        raised: result[4].toNumber(),
                        hours_remaining: this.hoursRemaining(result[5].toNumber()),
                        stage: this.stage(result[6].toNumber())
                    };
                })
                .then(()=>{
                    resolve(params);
                })
                .catch((err) => {
                    reject(err);
                })
        });

        return promise;
    }

    /**
     * Sends money to a project to help fund it
     * @param address {string} the contract address of the project to fund
     * @param account {string} the address to send the money from
     * @param amount {string} the amount of money (in Wei) to send
     */
    fundProject(address: string, account:string, amount: string){
        var projectInstance = Project.at(address);

        projectInstance.fund({from: account, value: amount})
            .catch(err => {
                alert(err);
            })
    }


    /**
     * Determines the time difference (in hours) between the specified (future) timestamp and
     * the current time, as determined by the latest block
      * @param timestamp {number} the timestamp
     * @returns {number} the number of hours until that timestamp is reached (or zero if it has passed)
     */
    hoursRemaining(timestamp: number) {
        var currentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
        if(currentTime > timestamp) {
            return 0;
        } else {
            return Math.floor((timestamp - currentTime) / 3600);
        }
    }


    /**
     * Determines the project stage name based on the stage index
     * @param index {number} the index of the stages in the Project contract's Stages enum
     * @returns {string} the name of the corresponding stage
     */
     stage(index: number){
        var stages: string[] = ['Open', 'Refund', 'FundingAchieved', 'Complete'];
        if(index >= stages.length) {
            throw new Error('Invalid stage ' + index);
        } else {
            return stages[index];
        }
    }
}


