const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importSql(port, filePath) {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'games';

  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Importing ${filePath} -> ${host}:${port}/${dbName} ...`);
    const conn = await mysql.createConnection({ host, port: parseInt(port,10), user, password, database: dbName, multipleStatements: true });
    await conn.query(sql);
    await conn.end();
    console.log('✓ Import completed successfully');
    return true;
  } catch (err) {
    console.error('✗ Import failed:', err.message);
    return false;
  }
}

if (require.main === module) {
  const port = process.argv[2] || process.env.DB_PORT || '3306';
  const filePath = process.argv[3] || './games (7).sql';
  importSql(port, filePath).then(success => process.exit(success ? 0 : 1));
}
