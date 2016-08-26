# b9lab_crowdfund

Crowdfunding project created as part of the B9LabAcademy Ethereum course

Available at: https://github.com/isaidgitout/b9lab_crowdfund

Author: Nikesh Nazareth

## Difference from task description

The task requires the _Project.fund_ method to call _refund_ or _payout_ when the deadline or target is reached.

I think it is more correct to use the *withdraw* pattern, where only the recipient can initiate a transaction to receive funds.

This is to avoid a few possible error conditions:
  - if the call stack limit is exceeded, _[address].send_ will fail but the function will continue to execute
  - if the recipient's fallback function throws an error, the function cannot be executed
  - the recipient's fallback function might attempt the re-entrancy attack
  
  
In this particular case, if the _refund_ code were to cycle through contributors and send their money back, any one of the contributors could be a contract whose fallback function throws an error. 
In this situation, all other contributors are prevented from getting their refund (which leaves them vulnerable to extortion)


## Usage

Install dependencies:

_npm install_

Deploy the contract:

Ensure your local node is listening at localhost:8545

_npm run migrate_

Launch the app: 

_npm run start_ 

Run the tests:

_truffle test_

Note: for reasons I did not get time to debug
 - I could not use testrpc to deploy the FundingHub contract because it gave the error "Error: tx has a higher gas limit than the block"
 - I could not use geth to deploy the FundingHub contract using the 'contract' clause because it hangs and then times out
 
Instead, I have given an example test that is similar to the ones I used for the main project, but I could not test the _refund_ function properly
