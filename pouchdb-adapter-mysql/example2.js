require('dotenv').config()
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB(
  'json://' +
    JSON.stringify({
      host: 'localhost',
      port: 3306,
      user: 'twilson63a',
      password: 'foo/bar',
      database: 'mymwa',
      table: 'foobar'
    }),
  {
    adapter: 'mysql'
  }
)
