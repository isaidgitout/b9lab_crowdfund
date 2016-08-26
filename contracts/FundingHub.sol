import "Project.sol";

/**
 * Repository contract for projects to be crowd funded
 */
contract FundingHub {

    address[] public projects;     // the list of available projects

    /**
     * Constructor function for FundingHub
     */
    function FundingHub() {
        // nothing to be done
    }

    /**
     * Used to create a new project
     * @param name {string} the name of the project
     * @param description {string} a description of the project
     * @param owner {address} the owner of the project (ie. the one who will receive the funds if it is funded)
     * @param target {uint} the target amount (in Wei) that the project needs to reach to be funded
     * @param deadline {uint} the deadline for the project to be funded
     */
    function createProject(string name, string description, address owner, uint target, uint deadline) {
        projects.push(new Project(name, description, owner, target, deadline));
    }

    /**
     * Confirms that project is managed by this hub and then sends the funds to the project
     * @param project {address} the project to fund
     */
    function contribute(address project) {
        bool projectExists = false;
        for(uint i=0; i < projects.length; i++){
            if(projects[i] == project){
                projectExists = true;
            }
        }

        if(!projectExists) throw;

        Project(project).fund();
    }

    /** At the moment, we can't return an array to javascript so we need a separate set of getters **/

    /**
     * @return {uint} the number of projects managed by this hub (in all stages)
     */
    function numProjects() returns (uint) {
        return projects.length;
    }

    /**
     * Returns the project at the specified index
     * @param index {uint} the index of the project (in order of creation)
     * @return {address} the address of the project
     */
    function getProjectAddress(uint index) returns (address) {
        return projects[index];
    }

}
