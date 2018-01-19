var test = require('tape'),
  testCommon = require('./testCommon'),
  MysqlDOWN = require('./')
// testBuffer = require('fs').readFileSync(
//   require('path').join(__dirname, 'testdata.bin')
// ),

/*** compatibility with basic LevelDOWN API ***/

require('./test/leveldown-test').args(MysqlDOWN, test)
require('./test/open-test').open(MysqlDOWN, test, testCommon)
require('./test/del-test').setUp(MysqlDOWN, test, testCommon)
require('./test/del-test').args(test)
require('./test/get-test').setUp(MysqlDOWN, test, testCommon)
require('./test/get-test').args(test)
require('./test/put-test').setUp(MysqlDOWN, test, testCommon)
require('./test/put-test').args(test)

require('./test/put-get-del-test').all(MysqlDOWN, test, testCommon)

require('./test/batch-test').all(MysqlDOWN, test, testCommon)

//
// require('./abstract/chained-batch-test').setUp(factory, test, testCommon)
// require('./abstract/chained-batch-test').args(test)
//
// require('./abstract/close-test').close(factory, test, testCommon)
//
// require('./abstract/iterator-test').setUp(factory, test, testCommon)
// require('./abstract/iterator-test').args(test)
// require('./abstract/iterator-test').sequence(test)
