const util = require('util')
const PassThrough = require('stream').PassThrough
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const mysql = require('mysql')
const sqlHelper = require('./sql')
const R = require('ramda')

function MysqlIterator(db, options) {
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

  this._stream.once('end', () => {
    this._endEmitted = true
  })

  query.push('SELECT * from ' + db.table)

  if (R.and(start, end)) {
    query.push('WHERE `key` <= ' + start + ' AND `key` >= ' + end)
  } else if (start) {
    query.push('WHERE `key` <= ' + start)
  } else if (end) {
    query.push('WHERE `key` >= ' + end)
  }
  query.push(`ORDER BY \`key\` ${options.reverse ? 'DESC' : ''}`)

  if (R.gt(options.limit, -1)) {
    query.push('LIMIT ' + options.limit)
  }

  db._streamingQuery(query.join('\n'), (err, s) => {
    if (err) {
      return console.log(err)
    }
    // what is this for?
    //this._foobar = s
    s.pipe(this._stream)
    // s.once('close', function() {
    //   throw new Error('CLOSE')
    // })
  })
}

util.inherits(MysqlIterator, AbstractIterator)

MysqlIterator.prototype._next = function(callback) {
  var self = this,
    obj = this._stream.read(),
    onReadable = function() {
      self._stream.removeListener('end', onEnd)
      self._next(callback)
    },
    onEnd = function() {
      self._stream.removeListener('readable', onReadable)
      callback()
    },
    key,
    value

  if (this._endEmitted) callback()
  else if (obj === null) {
    this._stream.once('readable', onReadable)

    this._stream.once('end', onEnd)
  } else {
    key = obj.key
    if (!this._keyAsBuffer) key = key.toString()

    value = obj.value
    if (!this._valueAsBuffer) value = value.toString()

    callback(null, key, value)
  }
}

MysqlIterator.prototype._end = function(callback) {
  this._stream.end()
  callback()
}

module.exports = MysqlIterator
