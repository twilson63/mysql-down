const test = require('tape')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
PouchDB.plugin(require('pouchdb-mapreduce'))
const db = PouchDB('design_docs_query', {
  adapter: 'mysql',
  prefix: 'test/'
})

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

test('Basic Views', t => {
  let docs = [
    doc,
    { _id: 'dale', score: 3 },
    { _id: 'mikeal', score: 5 },
    { _id: 'max', score: 4 },
    { _id: 'nuno', score: 3 }
  ]
  if (!db.query) {
    console.log('map reduce not supported')
    t.end()
    db.close()
    return
  }
  db
    .bulkDocs({ docs })
    .then(() => db.query('foo/scores', { reduce: false }))
    .then(result => {
      t.equals(result.rows.length, 4, 'correct # of results')
      return db.query('foo/scores')
    })
    .then(result => {
      t.equals(result.rows[0].value, 15, 'Reduce gave correct result')
      return
    })
    .then(() => {
      return Promise.all([
        db.query('foo/scores', { reduce: false }),
        db.query('foo/scores', { reduce: false })
      ])
    })
    .then(results => {
      t.equals(results[0].rows.length, 4)
      t.equals(results[1].rows.length, 4)
      return
    })
    .then(() => {
      db.destroy()
      db.close(() => {
        console.log('done')
        t.end()
        //process.exit(0)
      })
    })
    .catch(err => {
      console.log(err)
      console.log(err)
      t.end()
      db.close()
    })
})
