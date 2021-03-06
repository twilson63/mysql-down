require('dotenv').config()
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB('foobar', {
  adapter: 'mysql',
  prefix: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beepboop'
  }
})

db.info().then(console.log.bind(console))
// db.post({ foo: 'bar' }).then(console.log.bind(console))
// db.allDocs().then(console.log.bind(console))
