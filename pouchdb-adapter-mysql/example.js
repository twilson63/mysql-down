require('dotenv').config()
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB('MYSQL:root@localhost:3306/test/blahhh', {
  adapter: 'mysql'
})

// db.info().then(console.log.bind(console))
// db.post({ foo: 'bar' }).then(console.log.bind(console))
// db.allDocs().then(console.log.bind(console))
