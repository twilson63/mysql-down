const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB('foo/bar', {
  adapter: 'mysql'
})

db.put({ _id: 'boop3', hello: 'world' }).catch(err => console.log(err.message))
db
  .allDocs({ include_docs: true })
  .then(res => console.log(JSON.stringify(res, null, 2)))
