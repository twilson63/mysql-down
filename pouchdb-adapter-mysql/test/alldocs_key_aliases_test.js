const test = require('tape')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
const db = PouchDB('alldocs_aliases', {
  adapter: 'mysql',
  prefix: 'test/'
})

const prop = k => o => o[k]

test('test basic collation', t => {
  let docs = [
    { _id: '0' },
    { _id: '1' },
    { _id: '2' },
    { _id: '3' },
    { _id: '4' },
    { _id: '5' },
    { _id: '6' },
    { _id: '7' },
    { _id: '8' },
    { _id: '9' }
  ]
  db
    .bulkDocs({ docs })
    .then(res => {
      docs[3]._deleted = true
      docs[7]._deleted = true
      docs[3]._rev = res[3].rev
      docs[7]._rev = res[7].rev
      return db.remove(docs[3])
    })
    .then(_ => db.remove(docs[7]))
    .then(_ => db.allDocs())
    .then(res => {
      t.equals(res.rows.length, 8, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5' })
    })
    .then(res => {
      t.equals(res.rows.length, 4, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5', skip: 2, limit: 10 })
    })
    .then(res => {
      t.equals(res.rows.length, 2, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5', limit: 0 })
    })
    .then(res => {
      t.equals(res.rows.length, 0, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ keys: ['5'], limit: 0 })
    })
    .then(res => {
      t.equals(res.rows.length, 0, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ limit: 0 })
    })
    .then(res => {
      t.equals(res.rows.length, 0, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5', descending: true, skip: 1 })
    })
    .then(res => {
      t.equals(res.rows.length, 4, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5', endkey: 'z' })
    })
    .then(res => {
      t.equals(res.rows.length, 4, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5', endkey: '5' })
    })
    .then(res => {
      t.equals(res.rows.length, 1, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5', endkey: '4' })
    })
    .then(res => {
      t.equals(res.rows.length, 0, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '5', endkey: '4', descending: true })
    })
    .then(res => {
      t.equals(res.rows.length, 2, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '3', endkey: '7', descending: false })
    })
    .then(res => {
      t.equals(res.rows.length, 3, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '3', endkey: '7', descending: false })
    })
    .then(res => {
      t.equals(res.rows.length, 3, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '7', endkey: '3', descending: true })
    })
    .then(res => {
      t.equals(res.rows.length, 3, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ startkey: '', endkey: '0' })
    })
    .then(res => {
      t.equals(res.rows.length, 1, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ keys: ['0', '1', '3'] })
    })
    .then(res => {
      t.equals(res.rows.length, 3, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ keys: ['0', '1', '0', '2', '1', '1'] })
    })
    .then(res => {
      t.equals(res.rows.length, 6, 'correctly return rows')
      t.deepEquals(res.rows.map(prop('key')), ['0', '1', '0', '2', '1', '1'])
      return db.allDocs({ keys: [] })
    })
    .then(res => {
      t.equals(res.rows.length, 0, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ keys: ['7'] })
    })
    .then(res => {
      t.equals(res.rows.length, 1, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ key: '3' })
    })
    .then(res => {
      t.equals(res.rows.length, 0, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ key: '2' })
    })
    .then(res => {
      t.equals(res.rows.length, 1, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      return db.allDocs({ key: 'z' })
    })
    .then(res => {
      t.equals(res.rows.length, 0, 'correctly return rows')
      t.equals(res.total_rows, 8, 'correctly return total rows')
      t.end()
      db.destroy()
      db.close()
    })
    .catch(err => {
      console.log(err)
      t.end()
      db.destroy()
      db.close()
    })
})
