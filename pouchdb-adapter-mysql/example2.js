require('dotenv').config()
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB(
  'JSON:' +
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

// db.info().then(console.log.bind(console))
// db.post({ foo: 'bar' }).then(console.log.bind(console))
// db.allDocs().then(console.log.bind(console))
