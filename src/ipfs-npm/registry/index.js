'use strict'

const async = require('async')
const config = require('../config')

exports = module.exports

exports.connect = (api, callback) => {
  // TODO support connection to more than one node
  // TODO check which nodes are missing from the list first
  api.swarm.connect(config.nodes.y, callback)
}

exports.cacheRegistry = (api, callback) => {
  async.waterfall([
    (cb) => api.name.resolve(config.registryRecord, cb),
    (res, cb) => {
      const hash = res.Path.split('/')[2]
      api.object.get(hash, (err) => cb(err, res.Path))
    },
    (res, cb) => api.files.mv([
      '/npm-registry',
      '/npm-registry.bak-' + Date.now().toString()
    ], (err) => {
      if (err) {
        // happens if /npm-registry did not
        // exist yet, it is ok
      }
      cb(null, res)
    }),
    (hash, cb) => api.files.cp([
      hash,
      '/npm-registry'
    ], (err) => cb(err, hash))
  ], callback)
}

exports.publish = (api, callback) => {
  async.waterfall([
    (cb) => api.files.stat('/npm-registry', cb),
    (res, cb) => api.name.publish('/ipfs/' + res.Hash, cb)
  ], callback)
}
