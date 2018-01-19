const mysqldown = require('./index')
const levelup = require('levelup')
const encode = require('encoding-down')

const db = levelup(
  encode(mysqldown('mysql://root@localhost:3306/beep/foo2'), {
    valueEncoding: 'json'
  })
)

db.put(1, { bar: 'bam' }).then(() => {
  db.get(1).then(v => console.log(v.bar))
})

db
  .createReadStream()
  .on('data', data => {
    console.log('key', data.key.toString())
    console.log('value', data.value)
  })
  .on('close', function() {
    console.log('it is over now')
  })
