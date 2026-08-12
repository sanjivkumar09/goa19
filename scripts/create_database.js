const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'games';
  const port = process.argv[2] || process.env.DB_PORT || 3306;

  try {
    const conn = await mysql.createConnection({ host, user, password, port: parseInt(port,10) });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✓ Database exists or was created:', dbName);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Error creating database:', err.message);
    console.error('Make sure MySQL is running (e.g., start XAMPP) and credentials in .env are correct.');
    process.exit(1);
  }
})();
