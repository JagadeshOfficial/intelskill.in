/*
List MySQL tables and columns.
Usage (PowerShell):
  $env:MYSQL_HOST='localhost'; $env:MYSQL_USER='root'; $env:MYSQL_PASSWORD='pwd'; $env:MYSQL_DATABASE='your_db'; node tools/list_mysql_tables.js

This script uses environment variables:
  MYSQL_HOST, MYSQL_PORT (optional), MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
*/

const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || null;

  if (!database) {
    console.error('Please set MYSQL_DATABASE environment variable to the database you want to inspect.');
    process.exit(1);
  }

  const conn = await mysql.createConnection({ host, port, user, password, database });
  console.log(`Connected to MySQL ${host}:${port} as ${user} (database: ${database})`);

  // List tables
  const [tables] = await conn.query("SHOW TABLES");
  const tableKey = Object.keys(tables[0] || {})[0];
  if (!tableKey) {
    console.log('No tables found.');
    await conn.end();
    return;
  }

  console.log('\nTables found:');
  for (const row of tables) {
    const tableName = row[tableKey];
    console.log(' -', tableName);

    // Describe columns
    const [cols] = await conn.query('SHOW FULL COLUMNS FROM `' + tableName + '`');
    console.log('   Columns:');
    for (const c of cols) {
      console.log(`     - ${c.Field} (${c.Type}) ${c.Null === 'NO' ? 'NOT NULL' : ''} ${c.Key ? 'KEY' : ''} ${c.Extra || ''}`);
    }
  }

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
