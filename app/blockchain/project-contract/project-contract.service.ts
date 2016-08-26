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
}

export class ProjectService implements IProjectService {


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
     * Determine how many hours into the future a timestamp is (using the last block as a reference)
     */
    hoursRemaining(timestamp: number) {
        var currentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
        if(currentTime > timestamp) {
            return 0;
        } else {
            return (timestamp - currentTime) / 3600;
        }
    }

    /**
     * Return the name of the project stage corresponding to the Stage enum index
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


