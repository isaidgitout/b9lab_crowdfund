// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[],"name":"getWallet","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"purchase","outputs":[{"name":"success","type":"bool"}],"type":"function"}],
    binary: "6060604052606b8060106000396000f3606060405260e060020a60003504631329960481146024578063efef39a1146048575b005b60005473ffffffffffffffffffffffffffffffffffffffff165b6060908152602090f35b6000805473ffffffffffffffffffffffffffffffffffffffff191633178155603e56",
    unlinked_binary: "6060604052606b8060106000396000f3606060405260e060020a60003504631329960481146024578063efef39a1146048575b005b60005473ffffffffffffffffffffffffffffffffffffffff165b6060908152602090f35b6000805473ffffffffffffffffffffffffffffffffffffffff191633178155603e56",
    address: "0x943f93ff484c356d6f007dd425fd808586814033",
    generated_with: "2.0.6",
    contract_name: "Purchase"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("Purchase error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("Purchase error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("Purchase error: lease call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("Purchase error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.Purchase = Contract;
  }

})();
