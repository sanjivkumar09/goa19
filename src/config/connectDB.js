const mysql = require('mysql2/promise');
require('dotenv').config();

// Hostinger MySQL Database Connection for skynoxx.live
// Database credentials are stored in .env file for security
const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'alex',
    database: process.env.DB_NAME || 'games',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection and auto-migrate schema
connection.getConnection()
    .then(async (conn) => {
        console.log('✓ Database connected successfully to:', process.env.DB_NAME || 'games');
        try {
            // 1. Ensure qr_code_image LONGTEXT exists in bank_recharge table
            const [cols] = await conn.query("SHOW COLUMNS FROM `bank_recharge` LIKE 'qr_code_image'");
            if (cols.length === 0) {
                await conn.query("ALTER TABLE `bank_recharge` ADD COLUMN `qr_code_image` LONGTEXT NULL");
                console.log('✓ Added qr_code_image column to bank_recharge table');
            } else {
                await conn.query("ALTER TABLE `bank_recharge` MODIFY COLUMN `qr_code_image` LONGTEXT NULL");
                console.log('✓ Verified qr_code_image column is LONGTEXT in bank_recharge table');
            }

            // 2. Ensure admin_settings table exists
            await conn.query(`CREATE TABLE IF NOT EXISTS \`admin_settings\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`setting_key\` varchar(100) NOT NULL,
                \`setting_value\` text DEFAULT NULL,
                \`updated_at\` bigint(20) DEFAULT NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`setting_key\` (\`setting_key\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

            // 3. Ensure withdraw table has ifsc, sdt, tp columns and today column is VARCHAR(50)
            const ensureWithdrawCol = async (col, type) => {
                const [cols] = await conn.query("SHOW COLUMNS FROM `withdraw` LIKE '" + col + "'");
                if (cols.length === 0) {
                    await conn.query("ALTER TABLE `withdraw` ADD COLUMN `" + col + "` " + type);
                    console.log('✓ Added ' + col + ' column to withdraw table');
                }
            };
            await ensureWithdrawCol('ifsc', 'VARCHAR(50) NULL');
            await ensureWithdrawCol('sdt', 'VARCHAR(50) NULL');
            await ensureWithdrawCol('tp', 'VARCHAR(50) NULL');
            try {
                await conn.query("ALTER TABLE `withdraw` MODIFY COLUMN `today` VARCHAR(50) NULL");
                await conn.query("ALTER TABLE `recharge` MODIFY COLUMN `today` VARCHAR(50) NULL");
            } catch (e) {}

            // 4. Ensure aviator tables exist
            await conn.query(`CREATE TABLE IF NOT EXISTS \`aviator\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`period\` varchar(50) NOT NULL,
                \`crash_point\` decimal(10,2) NOT NULL DEFAULT 1.00,
                \`status\` int(11) NOT NULL DEFAULT 0,
                \`time\` varchar(50) DEFAULT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

            await conn.query(`CREATE TABLE IF NOT EXISTS \`aviator_bets\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`period\` varchar(50) NOT NULL,
                \`phone\` varchar(20) NOT NULL,
                \`code\` varchar(50) DEFAULT NULL,
                \`invite\` varchar(50) DEFAULT NULL,
                \`money\` decimal(10,2) NOT NULL DEFAULT 0.00,
                \`amount\` int(11) NOT NULL DEFAULT 1,
                \`fee\` decimal(10,2) NOT NULL DEFAULT 0.00,
                \`get\` decimal(10,2) NOT NULL DEFAULT 0.00,
                \`result\` decimal(10,2) NOT NULL DEFAULT 0.00,
                \`status\` int(11) NOT NULL DEFAULT 0,
                \`cashed_out\` int(11) NOT NULL DEFAULT 0,
                \`cashout_multiplier\` decimal(10,2) NOT NULL DEFAULT 0.00,
                \`time\` varchar(50) DEFAULT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        } catch (schemaErr) {
            console.error('Schema auto-migration notice:', schemaErr.message);
        }
        conn.release();
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
        console.error('Please check your database credentials in .env file');
    });

module.exports = connection;