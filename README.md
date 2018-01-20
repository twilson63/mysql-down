# twilson63/mysql-down

[![Build Status](https://travis-ci.org/twilson63/mysql-down.svg?branch=master)](https://travis-ci.org/twilson63/mysql-down)

A Level Down Wrapper around MySQL

## Install

```
npm install twilson63/mysql-down
```

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

## Testing

Runs the AbstractLevelDOWN Test Suite

```
npm test
```

## Contributions

Welcome

## TODOS

* Run PouchDB Test Suite
* Test with TLS MySQL Connections

## License

MIT

## Thanks

* [https://github.com/kesla/mysqlDOWN](https://github.com/kesla/mysqlDOWN) from @kesla

* LevelUP and LevelDOWN
