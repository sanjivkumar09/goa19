const mysql = require('mysql2/promise');

// Make sure your MySQL server is running and the database 'goa19' exists.
// The data files are located at C:\xampp\mysql\data\games, but you connect via host/user/password/database.
// If you need to restore/import a database, use phpMyAdmin or mysql CLI to import goa.sql into 'goa19'.
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root', // Change to your MySQL username if different
    password: '', // Change to your MySQL password if set
    database: 'games' // Change to 'goa19' if that's the intended DB name
});

module.exports = connection;