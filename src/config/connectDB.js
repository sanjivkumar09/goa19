const mysql = require('mysql2/promise');
require('dotenv').config();

// Hostinger MySQL Database Connection for skynoxx.live
// Database credentials are stored in .env file for security
const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'alex',
    database: process.env.DB_NAME || 'games',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
connection.getConnection()
    .then(conn => {
        console.log('✓ Database connected successfully to:', process.env.DB_NAME);
        conn.release();
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
        console.error('Please check your database credentials in .env file');
    });

module.exports = connection;