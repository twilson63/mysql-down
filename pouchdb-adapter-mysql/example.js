require('dotenv').config()
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB('mysql://root@localhost:3306/test/blahhh', {
  adapter: 'mysql'
})
