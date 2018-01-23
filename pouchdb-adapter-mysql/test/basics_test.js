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
      console.log('err', err)
    })
})

test('Doc Validation', t => {
  t.plan(2)
  const bad_docs = [
    { _zing: 4 },
    { _zoom: 'hello' },
    {
      zane: 'goldfish',
      _fan: 'something smells delicious'
    },
    { _bing: { 'wha?': 'soda can' } }
  ]
  db.bulkDocs({ docs: bad_docs }).catch(err => {
    t.equal(err.name, 'doc_validation')
    t.equal(err.message, 'Bad special document member: _zing')
  })
})

test('Testing Valid Id', t => {
  t.plan(2)
  db
    .post({
      _id: 123,
      test: 'somestuff'
    })
    .catch(err => {
      t.ok(err)
      t.equals(err.name, 'bad_request')
    })
})

test('put doc without id should fail', t => {
  t.plan(2)
  db.put({ test: 'somestuff' }).catch(err => {
    t.ok(err)
    t.equals(err.message, '_id is required for puts')
  })
})

test('put doc with bad reserved id', t => {
  t.plan(3)
  db
    .put({
      _id: '_i_test',
      test: 'somestuff'
    })
    .catch(err => {
      t.ok(err)
      t.equals(err.status, 400)
      t.equals(
        err.message,
        'Only reserved document ids may start with underscore.'
      )
    })
})

test('update_seq persists', t => {
  t.plan(2)
  let db = PouchDB('update_seq', {
    adapter: 'mysql',
    prefix: 'test/'
  })

  db
    .post({ test: 'somestuff' })
    .then(() => db.close())
    .then(() => {
      db = PouchDB('update_seq', {
        adapter: 'mysql',
        prefix: 'test/'
      })
      return db.info()
    })
    .then(info => {
      t.notEquals(info.update_seq, 0)
      t.equals(info.doc_count, 1)
      return db.destroy()
    })
    .catch(err => {
      console.log('err', err)
    })
})

test('error when doc is not an object', t => {
  t.plan(5)
  var doc1 = [{ _id: 'foo' }, { _id: 'bar' }]
  var doc2 = 'this is not an object'
  db.post(doc1).catch(t.ok)
  db.post(doc2).catch(t.ok)
  db.put(doc1).catch(t.ok)
  db.put(doc2).catch(t.ok)
  db.bulkDocs({ docs: [doc1, doc2] }).catch(t.ok)
})

test('db info', t => {
  t.plan(4)
  let db = PouchDB('info', {
    adapter: 'mysql',
    prefix: 'test/'
  })

  db.info().then(info => {
    t.equals(info.db_name, 'info')
    t.equals(info.auto_compaction, false)
    t.equals(info.adapter, 'mysql')
    t.equals(info.doc_count, 0)
    return db.destroy()
  })
})

test('putting returns {ok: true}', t => {
  t.plan(5)
  db
    .put({ _id: '_local/foo' })
    .then(res => t.ok(res.ok))
    .then(() => db.put({ _id: 'quux' }))
    .then(res => t.ok(res.ok))
    .then(() => db.bulkDocs([{ _id: '_local/bar' }, { _id: 'baz' }]))
    .then(res => {
      t.equals(res.length, 2)
      t.ok(res[0].ok)
      t.ok(res[1].ok)
    })
})

test('done', t => {
  db.destroy()
  t.end()
})
