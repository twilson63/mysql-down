const mysql = require('mysql')
const R = require('ramda')

module.exports = {
  createDatabaseAndTable,
  insertInto,
  selectByKey,
  deleteFrom,
  dropTable
}

function createDatabaseAndTable (databaseName, tableName) {
  tableName = R.replace(/-/g, '__', tableName)
  const sql = R.trim(`
CREATE DATABASE IF NOT EXISTS ${databaseName};
USE ${databaseName};
CREATE TABLE IF NOT EXISTS ${tableName} (
  \`id\` int (11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`value\` BLOB,
  \`key\` BLOB,
  UNIQUE (\`key\`(767))
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`)
  return sql
}

function insertInto (tableName, key, value) {
  const escaped = mysql.escape({
    key,
    value
  })
  tableName = R.replace(/-/g, '__', tableName)
  return R.trim(`
INSERT INTO ${tableName} SET ${escaped}
ON DUPLICATE KEY UPDATE ${escaped}`)
}

function selectByKey (tableName, key) {
  key = mysql.escape(key)
  tableName = R.replace(/-/g, '__', tableName)
  return R.trim(`
SELECT \`value\` FROM ${tableName} WHERE \`key\` = ${key}
  `)
}

function deleteFrom (tableName, key) {
  key = mysql.escape(key)
  tableName = R.replace(/-/g, '__', tableName)
  return R.trim(`
DELETE FROM ${tableName} WHERE \`key\` = ${key}
  `)
}

function dropTable (tableName) {
  tableName = R.replace(/-/g, '__', tableName)
  return R.trim(`
DROP TABLE ${tableName};
  `)
}
