const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB('blahhh', {
  adapter: 'mysql',
  prefix: 'foo/'
})
