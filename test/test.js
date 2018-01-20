const test = require('tape')
const testCommon = require('./testCommon')
const MysqlDOWN = require('../')
const testBuffer = new Buffer('hello')

require('abstract-leveldown/abstract/leveldown-test').args(MysqlDOWN, test)
require('abstract-leveldown/abstract/open-test').args(
  MysqlDOWN,
  test,
  testCommon
)
require('abstract-leveldown/abstract/del-test').all(MysqlDOWN, test, testCommon)
require('abstract-leveldown/abstract/put-test').all(MysqlDOWN, test, testCommon)
require('abstract-leveldown/abstract/get-test').all(MysqlDOWN, test, testCommon)
require('abstract-leveldown/abstract/put-get-del-test').all(
  MysqlDOWN,
  test,
  testCommon,
  testBuffer
)
require('abstract-leveldown/abstract/close-test').close(
  MysqlDOWN,
  test,
  testCommon
)

require('abstract-leveldown/abstract/iterator-test').all(
  MysqlDOWN,
  test,
  testCommon
)

require('abstract-leveldown/abstract/chained-batch-test').all(
  MysqlDOWN,
  test,
  testCommon
)
require('abstract-leveldown/abstract/approximate-size-test').setUp(
  MysqlDOWN,
  test,
  testCommon
)
require('abstract-leveldown/abstract/approximate-size-test').args(
  MysqlDOWN,
  test,
  testCommon
)

require('abstract-leveldown/abstract/ranges-test').all(
  MysqlDOWN,
  test,
  testCommon
)

require('abstract-leveldown/abstract/batch-test').all(
  MysqlDOWN,
  test,
  testCommon
)

test('last test', t => {
  console.log('**** Done ****')
  t.end()
  process.exit(0)
})
//require('./custom-tests.js').all(MysqlDOWN, test, testCommon)
