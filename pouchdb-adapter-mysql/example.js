const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('./adapter'))
const db = PouchDB('bar', {
  adapter: 'mysql',
  prefix: 'foo/'
})

// db
//   .put({ _id: 'boop3', hello: 'world' })
//   .then(res => console.log(res))
//   .catch(err => console.log(err.message))
db
  .allDocs({ include_docs: true })
  .then(res => console.log(JSON.stringify(res, null, 2)))
