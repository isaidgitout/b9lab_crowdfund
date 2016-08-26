"use strict";

// replicate the Stages enum
let PROJECT_STAGES = {
    Open: 0,
    Refund: 1,
    FundingAchieved: 2,
    Complete: 3
};


class ExpectedErrorWasNotThrown extends Error {
}
class ErrorWasThrownBeforeExpected extends Error {
}

describe('Project', function(accounts) {

});