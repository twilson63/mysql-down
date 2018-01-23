# twilson63/mysql-down

[![Build Status](https://travis-ci.org/twilson63/mysql-down.svg?branch=master)](https://travis-ci.org/twilson63/mysql-down)

A Level Down Wrapper around MySQL

## Install

```
npm install twilson63/mysql-down
```

## Connections

When connecting you can supply a connection uri or `[db]/[table]` combination,
if you just supply the db/table then it will assume the connection uri is the
following `mysql://root@localhost:3306/db/table`.

You can also supply the connection uri via env variables

MYSQL_URI=mysql://root@localhost:3306/db?.... node server.js

> If MYSQL_URI is provided, then it will serve as the connection and the location
> will serve as the datastore name

> So if you wanted to connect to remote mysql you would provide the URI via env
> and then call `db = MysqlDOWN('foo')` to represent the table name in the database.

## Example

```
const db = levelup(
  encode(mysqldown('mysql://root@localhost:3306/beep/foo2'), {
    valueEncoding: 'json'
  })
)

db.put(1, { bar: 'bam' }).then(() => {
  db.get(1).then(v => console.log(v.bar))
})

db
  .createReadStream({ gt: 1 })
  .on('data', data => {
    console.log('key', data.key.toString())
    console.log('value', data.value)
  })
  .on('close', function () {
    console.log('it is over now')
  })
```

## SSL Support

### Amazon RDS

SSL Support for Amazon RDS is simple, just add the following environment var

`MYSQL_SSL="Amazon RDS"`

If you are not using Amazon, then you will need to provide an actual ca certificate:

`MYSQL_SSL_CA=[certificate contents]`

See https://github.com/mysqljs/mysql#ssl-options

For more information.

## Testing

Runs the AbstractLevelDOWN Test Suite

```
npm test
```

## Contributions

Welcome

## License

MIT

## Thanks

* [https://github.com/kesla/mysqlDOWN](https://github.com/kesla/mysqlDOWN) from @kesla

* LevelUP and LevelDOWN
