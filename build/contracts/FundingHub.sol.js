var Web3 = require("web3");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  return accept(tx, receipt);
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("FundingHub error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("FundingHub error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("FundingHub contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of FundingHub: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to FundingHub.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: FundingHub not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "projects",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "target",
            "type": "uint256"
          },
          {
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "createProject",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "getProjectAddress",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "numProjects",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "project",
            "type": "address"
          }
        ],
        "name": "contribute",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [],
        "type": "constructor"
      }
    ],
    "unlinked_binary": "0x6060604052610b2a806100126000396000f3606060405260e060020a6000350463107046bd81146100475780632177fa3b1461008c5780634ca3e9b8146101585780635a067baa146101a257806373e888fd146101b7575b005b61020c600435600080548290811015610002575080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5630154600160a060020a031681565b6040805160206004803580820135601f8101849004840285018401909552848452610045949193602493909291840191908190840183828082843750506040805160208835808b0135601f8101839004830284018301909452838352979998604498929750919091019450909250829150840183828082843750949650509335935050606435915050608435600080546001810180835582818380158290116102295781836000526020600020918201910161022991905b8082111561035b5760008155600101610144565b61020c6004356000600060005082815481101561000257505080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5630154600160a060020a031690565b60005460408051918252519081900360200190f35b6100456004356000805b60005481101561035f5782600160a060020a0316600060005082815481101561000257600091825260209091200154600160a060020a0316141561020457600191505b6001016101c1565b60408051600160a060020a03929092168252519081900360200190f35b505050919090600052602060002090016000878787878760405161077f806103ab83390180806020018060200186600160a060020a031681526020018581526020018481526020018381038352888181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156102c95780820380516001836020036101000a031916815260200191505b508381038252878181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156103225780820380516001836020036101000a031916815260200191505b50975050505050505050604051809103906000f0909190916101000a815481600160a060020a0302191690830217905550505050505050565b5090565b81151561036b57610002565b82600160a060020a031663b60d42886040518160e060020a0281526004018090506000604051808303816000876161da5a03f1156100025750505050505056606060405260405161077f38038061077f83398101604052805160805160a05160c05160e0519385019492909201929091904281101561003e57610002565b6040805160c08101825286815260208181018790529181018590526060810184905260808101839052600060a08201819052805488518280529293919283927f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e56360026001851615610100026000190190941693909304601f908101829004840193918c01908390106100f357805160ff19168380011785555b506101239291505b8082111561018257600081556001016100df565b828001600101855582156100d7579182015b828111156100d7578251826000505591602001919060010190610105565b50506020820151816001016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061018657805160ff19168380011785555b506101b69291506100df565b5090565b82800160010185558215610176579182015b82811115610176578251826000505591602001919060010190610198565b50506040820151600282018054600160a060020a0319169091179055606082015160038201556080820151600482015560a091909101516005909101805460ff19169091179055505050505061056f806102106000396000f3606060405260e060020a6000350463590e1ae3811461004757806363bd1d4a146100615780637f0ce04514610078578063b60d4288146100f5578063cff0ab961461010c575b005b61004560055460009060019060ff16811461036257610002565b61004560055460029060ff1681146103a057610002565b60408051602081810183526000808352835180830185528181528154855160026001831615610100026000190190921691909104601f8101859004850282018501909652858152610135959193839283928392839283918301828280156104275780601f106103fc57610100808354040283529160200191610427565b61004560055460009060ff1681146104f057610002565b61022e600254600354600454600554600093600193600160a060020a0390911692909160ff1686565b60405180806020018060200188600160a060020a0316815260200187815260200186815260200185815260200184815260200183810383528a8181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156101c05780820380516001836020036101000a031916815260200191505b508381038252898181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156102195780820380516001836020036101000a031916815260200191505b50995050505050505050505060405180910390f35b60408051600160a060020a03861691810191909152606081018490526080810183905260a0810182905260c08082528754600260018216156101000260001901909116049082018190528190602082019060e08301908a9080156102d35780601f106102a8576101008083540402835291602001916102d3565b820191906000526020600020905b8154815290600101906020018083116102b657829003601f168201915b5050838103825288546002600182161561010002600019019091160480825260209190910190899080156103485780601f1061031d57610100808354040283529160200191610348565b820191906000526020600020905b81548152906001019060200180831161032b57829003601f168201915b50509850505050505050505060405180910390f35b505b50565b33600160a060020a03166000818152600660205260408082208054908390559051909450849082818181858883f19350505050151561035d57610002565b600254600160a060020a0390811633909116146103bc57610002565b6005805460ff19166003179055600254604051600160a060020a039182169160009130909116319082818181858883f19350505050151561035f57610002565b820191906000526020600020905b81548152906001019060200180831161040a57829003601f168201915b505060018054604080516020600284861615610100026000190190941693909304601f8101849004840282018401909252818152969d5091945090925084019050828280156104b75780601f1061048c576101008083540402835291602001916104b7565b820191906000526020600020905b81548152906001019060200180831161049a57829003601f168201915b50506002546003546004546005549d9e969d600160a060020a039384169d50919b503090921631995090975060ff169550929350505050565b6004544290101561050b57506005805460ff19166001179055565b33600160a060020a0316600090815260066020526040902054348101101561053257610002565b33600160a060020a03908116600090815260066020526040902080543401905560035430909116311061035f576005805460ff191660021790555056",
    "updated_at": 1472209872807,
    "links": {},
    "address": "0x567a295712205e37e14ca4edd3e977e462296572"
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "object") {
      Object.keys(name).forEach(function(n) {
        var a = name[n];
        Contract.link(n, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "FundingHub";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.1.2";

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.FundingHub = Contract;
  }
})();