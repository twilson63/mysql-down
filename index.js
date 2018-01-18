const util = require('util')
const url = require('url')
const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const mysql = require('mysql')
const sqlHelper = require('./sql')
const MysqlIterator = require('./mysqliterator')
const setImmediate = global.setImmediate || process.nextTick
const R = require('ramda')

function MysqlDOWN(location) {
  AbstractLevelDOWN.call(this, location)
  const parsed = url.parse(location)
  // test
  const parsedPath = parsed.path.split('/').filter(Boolean)
  let auth = parsed.auth
  let user = null
  let password = null

  if (R.and(R.is(String, auth), R.contains(':', auth))) {
    auth = R.split(':', auth)
    user = R.head(auth)
    password = R.or(R.tail(auth), '')
  }

  this.pool = mysql.createPool({
    host: parsed.hostname,
    port: parsed.port,
    user: user,
    password: password,
    multipleStatements: true
  })

  this.database = head(parsedPath)
  this.table = tail(parsedPath)
}

util.inherits(MysqlDOWN, AbstractLevelDOWN)

MysqlDOWN.prototype._query = (query, callback) => {
  const { pool } = this
  pool.getConnection(function(err) {
    if (err) {
      return callback(err)
    }
    connection.query(query, (err, result) => {
      connection.release()
      callback(err, result)
    })
  })
}

MysqlDOWN.prototype._streamingQuery = (query, callback) => {
  const { pool } = this
  pool.getConnection(function(err) {
    if (err) {
      return callback(err)
    }
    const stream = connection.query(query).stream({ highWaterMark: 100 })
    stream.once('end', () => {
      connection.release()
    })
    callback(null, stream)
  })
}

MysqlDOWN.prototype._parseValue = (array, asBuffer) => {
  const asBuffer = R.isNil(asBuffer) ? true : asBuffer
  return asBuffer
    ? R.prop('value', R.head(array))
    : R.toString(R.prop('value', R.head(array)))
}

MysqlDOWN.prototype._open = (options, cb) => {
  this._query(
    sqlHelper.createDatabaseAndTable(this.database, this.table),
    err => {
      if (err) {
        return cb(err)
      }
      this.pool.config.connectionConfig.database = self.database
      cb(null)
    }
  )
}

MysqlDOWN.prototype._close = cb => {
  this.pool.release(cb)
}

MysqlDOWN.prototype._put = (key, value, options, cb) => {
  this._query(sqlHelper.insertInto(this.table, key, value), cb)
}

MysqlDOWN.prototype._get = (key, options, cb) => {
  this._query(sqlHelper.selectByKey(this.table, key), (err, obj) => {
    if (R.and(R.not(err), R.equals(0, R.length(obj)))) {
      err = new Error('notFound')
    }
    if (err) {
      return cb(err)
    }
    cb(null, this._parseValue(obj, options.asBuffer))
  })
}

MysqlDOWN.prototype._del = (key, options, callback) => {
  this._query(sqlHelper.deleteFrom(this.table, key), callback)
}

MysqlDOWN.prototype._batch = (array, options, cb) => {
  const query = R.join(
    ';\n',
    R.map(elm => {
      return propEq('type', 'del', elm)
        ? sqlHelper.deleteFrom(this.table, elm.key)
        : sqlHelper.insertInto(this.table, elm.key, elm.value)
    }, array)
  )
  if (R.equals(0, R.length(array))) {
    return setImmediate(cb)
  }
  this._query(query, cb)
}

MysqlDOWN.prototype._iterator = function(options) {
  return new MysqlIterator(this, options)
}

module.exports = MysqlDOWN
