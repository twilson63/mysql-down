const CoreLevelPouch = require('pouchdb-adapter-leveldb-core')
const {
  startsWith,
  replace,
  assoc,
  slice,
  indexOf,
  contains
} = require('ramda')
const mysqldown = require('@twilson63/mysql-down')
//const mysqldown = require('../')

function MysqlDownPouch(opts, callback) {
  var _opts = Object.assign(
    {
      db: mysqldown
    },
    opts
  )

  if (startsWith('JSON:', _opts.name)) {
    if (contains('-mrview-', _opts.name)) {
      const view = slice(indexOf('-mrview-', _opts.name), -1, _opts.name)
      let json = JSON.parse(
        slice(
          indexOf('{', _opts.name),
          indexOf('-mrview-', _opts.name),
          _opts.name
        )
      )
      json = assoc('table', json.table + view, json)

      _opts.name = 'JSON:' + JSON.stringify(json)
    }
    _opts = assoc('name', replace('JSON:', 'json://', _opts.name), _opts)
  }

  if (startsWith('MYSQL:', _opts.name)) {
    _opts = assoc('name', replace('MYSQL:', 'mysql://', _opts.name), _opts)
  }

  CoreLevelPouch.call(this, _opts, callback)
}

MysqlDownPouch.valid = function() {
  return true
}
MysqlDownPouch.use_prefix = false

module.exports = function(PouchDB) {
  PouchDB.adapter('mysql', MysqlDownPouch, true)
}
