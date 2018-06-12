const test = require('tape')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
const db = PouchDB(
  'JSON:' +
    JSON.stringify({
      host: 'localhost',
      port: 3306,
      database: 'test',
      table: 'alldocs_collation',
      user: 'root'
    }),
  {
    adapter: 'mysql'
  }
)

test('test basic collation', t => {
  let docs = [{ _id: 'z', foo: 'z' }, { _id: 'a', foo: 'a' }]
  db
    .bulkDocs({ docs })
    .then(() => {
      return db.allDocs({
        startkey: 'z',
        endkey: 'z'
      })
    })
    .then(result => {
      t.equals(result.rows.length, 1, 'Exclude a result')
      t.end()
      db.close()
    })
    .catch(err => {
      console.log(err)
      t.end()
      db.destroy()
      db.close()
    })
})
