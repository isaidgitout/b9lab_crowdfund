/**
 * A contract describing a project to be crowd funded
 */
contract Project {


    // the possible stages the project could be in
    enum Stages {
        Open,               // neither the target nor deadline has been reached. People can still contribute.
        Refund,             // the deadline was reached without achieving the target. Contributors can withdraw their contribution
        FundingAchieved,    // the funding goal was reached. The owner can claim the funds
        Complete            // the owner has claimed the funds. The contract is inert.
    }

    // A struct encapsulating the details of a project
    struct ProjectParameters {
        string name;    // the name of the project
        string desc;    // a description of the project
        address owner;  // the address of the project owner and the destination of the funds
        uint target;    // the amount (in Wei) that the project needs to reach to be funded
        uint deadline;  // the funding deadline before all money is refunded
        Stages stage;   // the current project stage
    }

    // Contract variables
    ProjectParameters public params;               // The project parameters
    mapping(address => uint) contribution;  // A mapping from contributors to their contribution

    // Modifiers

    // restrict when the functions can be called
    modifier atStage (Stages _stage) {
        if(params.stage != _stage) throw;
        _
    }

    /**
     * Constructor function for Project
     * @param name {string} the name of the project
     * @param description {string} a description of the project
     * @param owner {address} the owner of the project (ie. the one who will receive the funds if it is funded)
     * @param target {uint} the target amount (in Wei) that the project needs to reach to be funded
     * @param deadline {uint} the deadline for the project to be funded
     */
     function Project(string name, string description, address owner, uint target, uint deadline) {
        if(deadline < now) throw;
        params = ProjectParameters(name, description, owner, target, deadline, Stages.Open);
    }


    /**
     * Used to contribute to the project
     * Can only be called during the Open stage
     * Sets the stage to Refund if the funding deadline has passed
     * Sets the stage to FundingAchieved if the target is reached.
     *      Note: this behaviour differs from the task description. Please consult the README to understand why
     * todo: currently the last contribution can exceed the funding goal. Any excess should be refunded
     */
     function fund() atStage(Stages.Open) {

        if(params.deadline < now) {
            params.stage = Stages.Refund;
            return;
        }

        // these checks are recommended practice to avoid overflow conditions
        if(contribution[msg.sender] + msg.value < contribution[msg.sender]) throw;
        contribution[msg.sender] += msg.value;

        if(this.balance >= params.target){
            params.stage = Stages.FundingAchieved;
        }
    }

    /**
     * Used by the project owner to claim the project funding
     * Can only be called by the owner during the FundingAchieved stage
     */
    function payout() atStage(Stages.FundingAchieved) {
        if(msg.sender != params.owner) throw;

        params.stage = Stages.Complete;
        if(!params.owner.send(this.balance)) throw;
    }

    /**
     * Used by a contributor to refund their contribution
     * Can only be called during the Refund stage
     */
    function refund() atStage(Stages.Refund) {
        uint refundAmount = contribution[msg.sender];
        contribution[msg.sender] = 0;
        if(!msg.sender.send(refundAmount)) throw;
    }


    /**
     * Returns the list of project parameters
     * @return name {string} the name of the project
     * @return description {string} a description of the project
     * @return owner {address} the owner of the project (ie. the one who will receive the funds if it is funded)
     * @return target {uint} the target amount (in Wei) that the project needs to reach to be funded
     * @return total {uint} the amount of Wei raised so far
     * @return deadline {uint} the deadline for the project to be funded
     * @return stage {Stages} the current stage
     */
    function getProjectParams() returns (string name, string desc, address owner, uint target, uint total, uint deadline, Stages stage){
        name = params.name;
        desc = params.desc;
        owner = params.owner;
        target = params.target;
        total = this.balance;
        deadline = params.deadline;
        stage = params.stage;
    }
}