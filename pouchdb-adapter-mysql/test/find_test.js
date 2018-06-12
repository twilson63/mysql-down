const test = require('tape')
const { has } = require('ramda')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
PouchDB.plugin(require('pouchdb-find'))
// const db = PouchDB('MYSQL:root@localhost:3306/test/find', {
//   adapter: 'mysql'
// })
const db = PouchDB(
  'JSON:' +
    JSON.stringify({
      host: 'localhost',
      port: 3306,
      database: 'test',
      table: 'find',
      user: 'root'
    }),
  {
    adapter: 'mysql'
  }
)

test('create a mango index', t => {
  t.plan(1)
  db
    .createIndex({
      index: {
        fields: ['Title']
      },
      type: 'json'
    })
    .then(res => {
      console.log(res)
      t.ok(true)
    })
    .catch(err => {
      console.log(err)
      t.ok(false)
    })
})

test('done', t => {
  db.destroy()
  t.end()
})
