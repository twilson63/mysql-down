const util = require('util')
const url = require('url')
const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN

const mysql = require('mysql')
const sqlHelper = require('./sql')
const MysqlIterator = require('./mysqliterator')
const setImmediate = global.setImmediate || process.nextTick
const R = require('ramda')

function MysqlDOWN(location) {
  if (!(this instanceof MysqlDOWN)) {
    return new MysqlDOWN(location)
  }

  AbstractLevelDOWN.call(this, location)

  const parsed = R.evolve(
    {
      hostname: v => (R.isNil(v) ? 'localhost' : v),
      port: v => (R.isNil(v) ? 3306 : v),
      auth: v => (R.isNil(v) ? 'root' : v)
    },
    url.parse(location)
  )

  // test
  const parsedPath = parsed.path.split('/').filter(Boolean)
  let auth = parsed.auth
  let user = auth
  let password = null

  if (R.and(R.is(String, auth), R.contains(':', auth))) {
    auth = R.split(':', auth)
    user = R.head(auth)
    password = R.or(R.tail(auth), '')
  }

  this.connInfo = {
    host: parsed.hostname,
    port: parsed.port,
    user: user,
    password: password,
    multipleStatements: true
  }

  this.database = R.head(parsedPath)
  this.table = R.tail(parsedPath)
}

util.inherits(MysqlDOWN, AbstractLevelDOWN)

MysqlDOWN.prototype._query = function(query, callback) {
  this.pool.getConnection(function(err, connection) {
    if (err) {
      return callback(err)
    }
    connection.query(query, (err, result) => {
      connection.release()

      callback(err, result)
    })
  })
}

MysqlDOWN.prototype._streamingQuery = function(query, callback) {
  this.pool.getConnection(function(err, connection) {
    if (err) {
      return callback(err)
    }

    let stream

    stream = connection.query(query).stream({ highWaterMark: 100 })

    console.log('streaming query')
    stream.once('end', () => {
      connection.release()
    })

    callback(null, stream)
  })
}

MysqlDOWN.prototype._parseValue = function(array, asBuffer) {
  asBuffer = R.isNil(asBuffer) ? true : asBuffer
  return asBuffer
    ? R.prop('value', R.head(array))
    : R.toString(R.prop('value', R.head(array)))
}

MysqlDOWN.prototype._open = function(options, cb) {
  this.pool = mysql.createPool(this.connInfo)

  this._query(
    sqlHelper.createDatabaseAndTable(this.database, this.table),
    (err, result) => {
      if (err) {
        return cb(err)
      }
      this.pool.config.connectionConfig.database = this.database

      cb(null)
    }
  )
}

MysqlDOWN.prototype._close = function(cb) {
  this.pool.end(cb)
}

MysqlDOWN.prototype._put = function(key, value, options, cb) {
  setImmediate(() => {
    this._query(sqlHelper.insertInto(this.table, key, value), cb)
  })
}

MysqlDOWN.prototype._get = function(key, options, cb) {
  setImmediate(() => {
    this._query(sqlHelper.selectByKey(this.table, key), (err, obj) => {
      if (R.and(R.not(err), R.equals(0, R.length(obj)))) {
        err = new Error('notFound')
      }
      if (err) {
        return cb(err)
      }
      cb(null, this._parseValue(obj, options.asBuffer))
    })
  })
}

MysqlDOWN.prototype._del = function(key, options, callback) {
  setImmediate(() => {
    this._query(sqlHelper.deleteFrom(this.table, key), callback)
  })
}

MysqlDOWN.prototype._batch = function(array, options, cb) {
  const query = R.join(
    ';\n',
    R.map(elm => {
      return R.propEq('type', 'del', elm)
        ? sqlHelper.deleteFrom(this.table, elm.key)
        : sqlHelper.insertInto(this.table, elm.key, elm.value)
    }, array)
  )
  if (R.equals(0, R.length(array))) {
    return setImmediate(() => cb(null))
  }
  setImmediate(() => this._query(query, cb))
}

MysqlDOWN.prototype._iterator = function(options) {
  return new MysqlIterator(this, options)
}

module.exports = MysqlDOWN
