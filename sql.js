const mysql = require('mysql')
const R = require('ramda')

module.exports = {
  createDatabaseAndTable,
  insertInto,
  selectByKey,
  deleteFrom
}

function createDatabaseAndTable (databaseName, tableName) {
  return R.trim(`
CREATE DATABASE IF NOT EXISTS ${databaseName};
USE ${databaseName};
CREATE TABLE IF NOT EXISTS ${tableName} (
  \`id\` int (11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`value\` BLOB,
  \`key\` BLOB,
  UNIQUE (\`key\`(767))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`)
}

function insertInto (tableName, key, value) {
  const escaped = mysql.escape({
    key,
    value
  })

  return R.trim(`
INSERT INTO ${tableName} SET ${escaped}
ON DUPLICATE KEY UPDATE ${escaped}`)
}

function selectByKey (tableName, key) {
  key = mysql.escape(key)
  return R.trim(`
SELECT \`value\` FROM ${tableName} WHERE \`key\` = ${key}
  `)
}

function deleteFrom (tableName, key) {
  key = mysql.escape(key)
  return R.trim(`
DELETE FROM ${tableName} WHERE \`key\` = ${key}
  `)
}
