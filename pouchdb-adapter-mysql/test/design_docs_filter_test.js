const test = require('tape')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
PouchDB.plugin(require('pouchdb-mapreduce'))
const db = PouchDB(
  'JSON:' +
    JSON.stringify({
      host: 'localhost',
      port: 3306,
      database: 'test',
      table: 'design_docs1',
      user: 'root'
    }),
  {
    adapter: 'mysql'
  }
)

test('design_docs', t => {
  const doc = {
    _id: '_design/foo',
    views: {
      scores: {
        map: 'function (doc) { if (doc.score) { emit(null, doc.score); } }',
        reduce: 'function (keys, values, rereduce) { return sum(values); }'
      }
    },
    filters: { even: 'function (doc) { return doc.integer % 2 === 0; }' }
  }
  const docs1 = [
    doc,
    { _id: '0', integer: 0 },
    { _id: '1', integer: 1 },
    { _id: '2', integer: 2 },
    { _id: '3', integer: 3 }
  ]
  const docs2 = [
    { _id: '4', integer: 4 },
    { _id: '5', integer: 5 },
    { _id: '6', integer: 6 },
    { _id: '7', integer: 7 }
  ]
  let count = 0

  db
    .put(doc)
    .catch(err => {
      return { ok: true }
    })
    .then(res => {
      t.ok(res.ok, 'wrote design doc')
      db
        .bulkDocs({ docs: docs1 })
        .then(() => {
          let changes = db
            .changes({
              live: true,
              filter: 'foo/even'
            })
            .on('change', () => {
              count += 1
              if (count === 4) {
                changes.cancel()
              }
            })
            .on('complete', result => {
              t.equals(result.status, 'cancelled')
              t.end()
              db.close()
            })
            .on('error', () => {
              t.end()
            })
          return db.bulkDocs({ docs: docs2 })
        })
        .catch(err => {
          console.log(err)
          t.end()
        })
    })

    .catch(err => {
      console.log(err)
      t.end()
      db.destroy()
      db.close()
    })
})
