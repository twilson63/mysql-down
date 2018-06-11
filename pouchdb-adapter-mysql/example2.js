require('dotenv').config()
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB(
  JSON.stringify({
    host: 'localhost',
    port: 3306,
    user: 'twilson63a',
    password: 'foo/bar',
    path: 'mymwa/foobar'
  }),
  {
    adapter: 'mysql'
  }
)
