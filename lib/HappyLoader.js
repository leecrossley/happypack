var assert = require('assert');
var HappyRPCHandler = require('./HappyRPCHandler');

function HappyLoader() {
  var callback = this.async();
  var id = getId(this.query);
  var remoteLoaderId = [ id, this.resource ].join(':');

  assert(callback, "HappyPack only works when asynchronous loaders are allowed!");

  this.cacheable();

  if (!this.happy) { // cache the plugin reference
    this.happy = this.options.plugins.filter(isHappy(id))[0];

    assert(this.happy,
      "You must define and use the HappyPack plugin to use its loader!"
    );
  }

  HappyRPCHandler.registerActiveLoader(remoteLoaderId, this);

  this.happy.compile({
    remoteLoaderId: remoteLoaderId,

    // TODO: maybe too much data being pushed down the drain here? we can infer
    // all of this from `this.request`
    context: this.context,
    request: this.happy.generateRequest(this.resource),
    resource: this.resource,
    resourcePath: this.resourcePath,
    resourceQuery: this.resourceQuery,
  }, function(err, code, map) {
    HappyRPCHandler.unregisterActiveLoader(remoteLoaderId);

    if (err) {
      return callback(new Error(err));
    }

    callback(null, code, map);
  });
}

module.exports = HappyLoader;

function isHappy(id) {
  return function(plugin) {
    return plugin.name === 'HappyPack' && plugin.id === id;
  };
}

function getId(queryString) {
  return (queryString.match(/id=([^!]+)/) || [0,'1'])[1];
}
