# pouchdb-adapter-mysql

LevelDOWN Adapter for running pouchdb and pouchdb server using an mysql backend.

## PouchDB Example

```js
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-mysql'))
const db = PouchDB('dbname', {
  adapter: 'mysql',
  prefix: {
    host: 'localhost',
    port: 3306,
    user: 'testuser',
    password: 'testpassword',
    database: 'test'
  }
})

db
  .allDocs({ include_docs: true })
  .then(res => console.log(JSON.stringify(res, null, 2)))
```

---

You can also run PouchDB Server

```js
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-adapter-mysql'))
const MPouchDB = PouchDB.defaults({
  adapter: 'mysql',
  prefix: {
    host: 'localhost',
    port: 3306,
    user: 'testuser',
    password: 'testpassword',
    database: 'test'
  }
})
var express = require('express')
var app = express()

app.use(require('express-pouchdb')(MPouchDB))
const db = MPouchDB('dbname')

app.listen(3000)
```

> CAVEAT: Assumes mysql is running locally on 3306 with no password for root

---

## How to run with Custom MySql uri

You can run with a custom mysql uri using the `MYSQL_URI` env variable containing the
custom connection info.

> URI Pattern mysql://user:pass@server:PORT/database

```
export MYSQL_URI=mysql://user:pass@server.com:3306/mydb
node server.js
```

Then you do not need a prefix, just supply the pouchdb dbName

```js
const db = PouchDB('mydb', { adapter: 'mysql' })
```

## How to run with an encrypted connection

Running an encrypted connection is all about getting the ca certificate and
supplying it as an env var

MSQL_SSL=...cert here...

## Contributing

All contributions are welcome

## License

MIT
