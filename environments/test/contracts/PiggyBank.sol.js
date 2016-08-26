// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint248"}],"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"getOwner","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[],"type":"constructor"}],
    binary: "606060405260008054600160a060020a03191633179055600180547fff00000000000000000000000000000000000000000000000000000000000000163417905560fa8061004d6000396000f36060604052361560315760e060020a600035046312065fe08114604c57806341c0e1b514605e578063893d20e8146079575b608b60005433600160a060020a03908116911614608d576002565b60c6600154600160f860020a03165b90565b608b60005433600160a060020a0390811691161460ec576002565b60d9600054600160a060020a0316605b565b005b600180547fff000000000000000000000000000000000000000000000000000000000000008116600160f860020a039091163401179055565b600160f860020a03166060908152602090f35b600160a060020a03166060908152602090f35b600054600160a060020a0316ff",
    unlinked_binary: "606060405260008054600160a060020a03191633179055600180547fff00000000000000000000000000000000000000000000000000000000000000163417905560fa8061004d6000396000f36060604052361560315760e060020a600035046312065fe08114604c57806341c0e1b514605e578063893d20e8146079575b608b60005433600160a060020a03908116911614608d576002565b60c6600154600160f860020a03165b90565b608b60005433600160a060020a0390811691161460ec576002565b60d9600054600160a060020a0316605b565b005b600180547fff000000000000000000000000000000000000000000000000000000000000008116600160f860020a039091163401179055565b600160f860020a03166060908152602090f35b600160a060020a03166060908152602090f35b600054600160a060020a0316ff",
    address: "0xeab398f666008526d7ac79a01c3aaad13dd6d676",
    generated_with: "2.0.6",
    contract_name: "PiggyBank"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("PiggyBank error: Please call load() first before creating new instance of this contract.");
    }

    Contract.Pudding.apply(this, arguments);
  };

  Contract.load = function(Pudding) {
    Contract.Pudding = Pudding;

    Pudding.whisk(contract_data, Contract);

    // Return itself for backwards compatibility.
    return Contract;
  }

  Contract.new = function() {
    if (Contract.Pudding == null) {
      throw new Error("PiggyBank error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("PiggyBank error: lease call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("PiggyBank error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.PiggyBank = Contract;
  }

})();
