const CoreLevelPouch = require('pouchdb-adapter-leveldb-core')

const mysqldown = require('@twilson63/mysql-down')

function MysqlDownPouch(opts, callback) {
  var _opts = Object.assign(
    {
      db: mysqldown
    },
    opts
  )

  CoreLevelPouch.call(this, _opts, callback)
}

MysqlDownPouch.valid = function() {
  return true
}
MysqlDownPouch.use_prefix = false

module.exports = function(PouchDB) {
  PouchDB.adapter('mysql', MysqlDownPouch, true)
}
