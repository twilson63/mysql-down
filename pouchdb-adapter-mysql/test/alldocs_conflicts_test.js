const test = require('tape')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
const db = PouchDB('alldocs_conflicts', {
  adapter: 'mysql',
  prefix: {
    host: 'localhost',
    port: 3306,
    database: 'test',
    user: 'root'
  }
})

var origDocs = [
  { _id: '0', a: 1, b: 1 },
  { _id: '3', a: 4, b: 16 },
  { _id: '1', a: 2, b: 4 },
  { _id: '2', a: 3, b: 9 }
]

const prop = k => o => o[k]
const propEq = (k, v) => o => o[k] === v

var conflictDoc1 = {
  _id: '3',
  _rev: '2-aa01552213fafa022e6167113ed01087',
  value: 'X'
}
var conflictDoc2 = {
  _id: '3',
  _rev: '2-ff01552213fafa022e6167113ed01087',
  value: 'Z'
}
let winRev

test('conflicts', t => {
  db
    .bulkDocs({
      docs: origDocs
    })
    .then(res => {
      return db.put(conflictDoc1, { new_edits: false })
    })
    .then(() => {
      return db.put(conflictDoc2, { new_edits: false })
    })
    .then(() => {
      return db.get('3')
    })
    .then(doc => {
      winRev = doc
      t.equals(doc._rev, conflictDoc2._rev)
      db
        .changes({
          include_docs: true,
          conflicts: true,
          style: 'all_docs'
        })
        .on('complete', chgs => {
          t.deepEquals(
            chgs.results.map(prop('id')).sort(),
            ['0', '1', '2', '3'],
            'all ids are in _changes'
          )
          const result = chgs.results.filter(propEq('id', '3'))[0]
          t.equals(result.changes.length, 3, 'correct number of chgs')
          t.equals(result.doc._rev, conflictDoc2._rev)
          t.equals(result.doc._id, '3', 'correct doc id')
          t.equals(result.doc._conflicts.length, 2)
          t.equals(conflictDoc1._rev, result.doc._conflicts[0])
          db
            .allDocs({
              include_docs: true,
              conflicts: true
            })
            .then(res => {
              const row = res.rows[3]
              t.equals(res.rows.length, 4, 'correct number of changes')
              t.equals(row.key, '3', 'correct key')
              t.equals(row.value.rev, winRev._rev, 'correct rev')
              t.equals(row.doc._rev, winRev._rev, 'correct rev')
              t.equals(row.doc._id, '3', 'correct order')
              t.equals(row.doc._conflicts.length, 2)
              t.equals(conflictDoc1._rev, res.rows[3].doc._conflicts[0])
              t.end()
              db.destroy()
              db.close()
            })
        })
        .on('error', () => {
          t.end()
        })
    })
    .catch(err => {
      console.log(err)
      db.destroy()
      db.close()
      t.end()
    })
})
