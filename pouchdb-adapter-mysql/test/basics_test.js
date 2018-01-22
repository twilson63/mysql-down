const test = require('tape')
const { has } = require('ramda')

const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('../adapter'))
const db = PouchDB('basics', {
  adapter: 'mysql',
  prefix: 'test/'
})

test('add a doc', t => {
  db.post({ test: 'somestuff' }, err => {
    t.notOk(err)
    t.end()
  })
})

test('get invalid id', t => {
  t.plan(1)
  db
    .get(1234)
    .then(() => t.ok(false))
    .catch(e => t.ok(e))
})

test('add a doc with opts object', t => {
  t.plan(1)
  db.post({ test: 'somestuff' }, {}).then(t.ok)
})

test('modify a doc', t => {
  t.plan(1)
  let rev1
  db
    .post({ test: 'some stuff' })
    .then(result => {
      rev1 = result.rev
      return db.put({
        _id: result.id,
        _rev: result.rev,
        another: 'test'
      })
    })
    .then(result => {
      t.notEquals(result.rev, rev1)
    })
})

test('remove doc', t => {
  let id
  t.plan(1)
  db
    .post({ test: 'somestuff' })
    .then(info => {
      id = info.id
      return db.remove({
        test: 'somestuff',
        _id: info.id,
        _rev: info.rev
      })
    })
    .then(() => db.get(id))
    .catch(t.ok)
})

test('remove doc w id rev', t => {
  let id
  t.plan(1)
  db
    .post({ test: 'somestuff' })
    .then(info => {
      id = info.id
      db.remove(info.id, info.rev)
    })
    .then(() => db.get(id))
    .catch(t.ok)
})

test('remove doc leaves stub', t => {
  t.plan(1)
  db
    .post({ _id: 'foo', test: 'somestuff' })
    .then(info => db.remove(info.id, info.rev))
    .then(res => db.get('foo', { rev: res.rev }))
    .then(doc => t.ok(doc._deleted))
    .catch(e => {
      console.log(e)
      t.ok(false)
    })
})

test('bulk docs', t => {
  t.plan(3)
  db
    .bulkDocs({
      docs: [{ test: 'somestuff' }, { test: 'another' }]
    })
    .then(infos => {
      t.equals(infos.length, 2)
      t.ok(infos[0].ok)
      t.ok(infos[1].ok)
    })
})

test('basic checks', t => {
  t.plan(7)
  const db = PouchDB('basic-checks', {
    adapter: 'mysql',
    prefix: 'test/'
  })
  const doc = { _id: '0', a: 1, b: 1 }

  let updateSeq

  db
    .info()
    .then(info => {
      updateSeq = info.updateSeq
      t.equals(info.doc_count, 0)
      return db.put(doc)
    })
    .then(result => {
      t.ok(result.ok)
      t.ok(has('id', result))
      t.ok(has('rev', result))
      return db.info()
    })
    .then(info => {
      t.equals(info.doc_count, 1)
      t.notEquals(info.update_seq, updateSeq)
      return db.get('0', { revs_info: true })
    })
    .then(doc => {
      t.equals(doc._revs_info[0].status, 'available')
      return db.destroy()
    })
    .catch(err => {
      console.log(err)
    })
})

test('done', t => {
  db.close(t.end)
})
