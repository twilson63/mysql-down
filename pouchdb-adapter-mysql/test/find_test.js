const test = require('tape')
const { has } = require('ramda')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
PouchDB.plugin(require('pouchdb-find'))

let prefix = {
  host: 'localhost',
  port: 3306,
  database: 'test',
  user: 'root'
}

let db = PouchDB('find2', {
  adapter: 'mysql',
  prefix
})

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
