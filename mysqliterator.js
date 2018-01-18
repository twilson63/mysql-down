const util = require('util')
const PassThrough = require('stream').PassThrough
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const mysql = require('mysql')
const sqlHelper = require('./sql')
const R = require('ramda')

const MysqlIterator = (db, options) => {
  let query = []
  const start = R.gt(R.length(options.start), 0)
    ? mysql.escape(options.start)
    : null
  const end = R.gt(R.length(options.end), 0) ? mysql.escape(options.end) : null

  AbstractIterator.call(this, db)
  this._reverse = !!options.reverse
  this._keyAsBuffer = !!options.keyAsBuffer
  this._valueAsBuffer = !!options.valueAsBuffer

  this._stream = new PassThrough({
    objectMode: true
  })
  this._once('end', function() {
    self._endEmitted = true
  })
  query.push('SELECT * from ' + db.table)

  if (R.and(start, end)) {
    query.push('WHERE `key` <= ' + start + ' AND `key` >= ' + end)
  } else if (start) {
    query.push('WHERE `key` <= ' + start)
  } else if (end) {
    query.push('WHERE `key` >= ' + end)
  }
  query.push('ORDER BY `key` ' + options.reverse ? 'DESC' : 'ASC')

  if (R.gt(options.limit, -1)) {
    query.push('LIMIT ' + options.limit)
  }

  db._streamingQuery(query.join('\n'), (err, s) => {
    // what is this for?
    this._foobar = s
    s.pipe(this._stream)
  })
}

module.exports = MysqlIterator
