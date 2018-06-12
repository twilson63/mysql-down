const CoreLevelPouch = require('pouchdb-adapter-leveldb-core')
const { compose, replace, assoc, merge } = require('ramda')
const mysqldown = require('@twilson63/mysql-down')
//const mysqldown = require('../')

function MysqlDownPouch(opts, callback) {
  opts = compose(
    assoc(
      'name',
      'json://' +
        JSON.stringify(
          merge(opts.prefix, {
            table: replace('[object Object]', '', opts.name)
          })
        )
    ),
    assoc('name', replace('[object Object]', '', opts.name))
  )(opts)

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
