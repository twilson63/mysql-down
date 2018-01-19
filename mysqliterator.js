const util = require('util')
const PassThrough = require('stream').PassThrough
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const mysql = require('mysql')
const sqlHelper = require('./sql')
const R = require('ramda')

function MysqlIterator(db, options) {
  let query = []
  let start = R.gt(R.length(options.start), 0)
    ? mysql.escape(options.start)
    : null
  if (R.gt(R.length(options.gte), 0)) {
    start = mysql.escape(options.gte)
  }
  let end = R.gt(R.length(options.end), 0) ? mysql.escape(options.end) : null
  if (R.gt(R.length(options.lte), 0)) {
    end = mysql.escape(options.lte)
  }

  let gt = R.gt(R.length(options.gt), 0) ? mysql.escape(options.gt) : null

  let lt = R.gt(R.length(options.lt), 0) ? mysql.escape(options.lt) : null

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

  // don't know if this will always work
  if (R.and(options.reverse, R.and(R.or(start, gt), R.not(R.or(end, lt))))) {
    if (R.and(start, R.not(end))) {
      end = start
      start = null
    }
    if (R.and(gt, R.not(lt))) {
      lt = gt
      gt = null
    }
  } else if (
    R.and(options.reverse, R.and(R.or(end, lt), R.not(R.or(start, gt))))
  ) {
    if (R.and(end, R.not(start))) {
      start = end
      end = null
    }
    if (R.and(lt, R.not(gt))) {
      gt = lt
      lt = null
    }
  } else if (options.reverse) {
    let placeholder = end
    end = start
    start = placeholder
  }

  query.push('SELECT * from ' + db.table)

  if (R.or(start, end)) {
    if (R.and(start, end)) {
      query.push('WHERE `key` <= ' + end + ' AND `key` >= ' + start)
    } else if (end) {
      query.push('WHERE `key` <= ' + end)
    } else if (start) {
      query.push('WHERE `key` >= ' + start)
    }
  } else if (R.or(gt, lt)) {
    if (R.and(gt, lt)) {
      query.push('WHERE `key` < ' + lt + ' AND `key` > ' + gt)
    } else if (lt) {
      query.push('WHERE `key` < ' + lt)
    } else if (gt) {
      query.push('WHERE `key` > ' + gt)
    }
  }

  query.push(`ORDER BY \`key\` ${options.reverse ? 'DESC' : 'ASC'}`)

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
