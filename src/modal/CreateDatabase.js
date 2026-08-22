const connection = require("../config/connectDB");
require('dotenv').config();

let timeNow = Date.now();

const CreateWingo = async(req, res) => {
    
    // Reset DataBase Wingo
    await connection.execute('DELETE FROM wingo');

    let arr = ['wingo10', 'wingo5', 'wingo3', 'wingo'];

    for (let i = 0; i < arr.length; i++) {
        const sql = "INSERT INTO wingo SET period = ?, game = ?, amount = 6, status = 1, time = ?";
        await connection.execute(sql, ['2022070110000', arr[i], timeNow]);
        const sql_1 = "INSERT INTO wingo SET period = ?, game = ?, amount = 0, status = 0, time = ?";
        await connection.execute(sql_1, ['2022070110001', arr[i], timeNow]);
    }
    console.log("Create Success Database Wingo.");
}
const Create5D = async(req, res) => {
    
    // Reset DataBase 5D
    await connection.execute('DELETE FROM 5d');

    let arr = [10, 5, 3, 1];

    for (let i = 0; i < arr.length; i++) {
        const sql = "INSERT INTO 5d SET period = ?, result = ?, game = ?, status = 1, time = ?";
        await connection.execute(sql, ['2022070110000', '23521', arr[i], timeNow]);
        const sql_1 = "INSERT INTO 5d SET period = ?, result = ?, game = ?, status = 0, time = ?";
        await connection.execute(sql_1, ['2022070110001', '0', arr[i], timeNow]);
    }
    console.log("Create Success Database 5D.");
}

const CreateK3 = async(req, res) => {
    
    // Reset DataBase K3
    await connection.execute('DELETE FROM k3');

    let arr = [10, 5, 3, 1];

    for (let i = 0; i < arr.length; i++) {
        const sql = "INSERT INTO k3 SET period = ?, result = ?, game = ?, status = 1, time = ?";
        await connection.execute(sql, ['2022070110000', '235', arr[i], timeNow]);
        const sql_1 = "INSERT INTO k3 SET period = ?, result = ?, game = ?, status = 0, time = ?";
        await connection.execute(sql_1, ['2022070110001', '0', arr[i], timeNow]);
    }
    console.log("Create Success Database k3.");
    console.log("Please press ctrl + C and enter npm start to run the server.");
}

const Level = async(req, res) => {
    
    // Reset DataBase Level
    await connection.execute('DELETE FROM level');

    await connection.execute("INSERT INTO level SET id = 7, level = 6, f1 = 1, f2 = 0.3, f3 = 0.09, f4 = 0.027");
    await connection.execute("INSERT INTO level SET id = 6, level = 5, f1 = 0.9, f2 = 0.27, f3 = 0.081, f4 = 0.0243");
    await connection.execute("INSERT INTO level SET id = 5, level = 4, f1 = 0.85, f2 = 0.255, f3 = 0.0765, f4 = 0.023");
    await connection.execute("INSERT INTO level SET id = 4, level = 3, f1 = 0.8, f2 = 0.24, f3 = 0.072, f4 = 0.0216");
    await connection.execute("INSERT INTO level SET id = 3, level = 2, f1 = 0.75, f2 = 0.225, f3 = 0.0675, f4 = 0.0203");
    await connection.execute("INSERT INTO level SET id = 2, level = 1, f1 = 0.7, f2 = 0.21, f3 = 0.063, f4 = 0.0189");
    await connection.execute("INSERT INTO level SET id = 1, level = 0, f1 = 0.6, f2 = 0.18, f3 = 0.054, f4 = 0.0162");
}

const NapRut = async(req, res) => {
    
    // Reset DataBase Level
    await connection.execute('DELETE FROM bank_recharge');
    await connection.execute("INSERT INTO `bank_recharge` (`id`, `name_bank`, `name_user`, `stk`, `type`, `time`) VALUES (NULL, 'MB BANK', 'NGUYEN NHAT LONG', '0800103725300', 'bank', '1655689155500')");
    await connection.execute("INSERT INTO `bank_recharge` (`id`, `name_bank`, `name_user`, `stk`, `type`, `time`) VALUES (NULL, 'MOMO', 'NGUYEN NHAT LONG', '387633464', 'momo', '1655689155500')");
}

const Admin = async(req, res) => {
    
    // Reset DataBase Level
    await connection.execute('DELETE FROM admin');
    await connection.execute("INSERT INTO `admin` (`id`, `wingo1`, `wingo3`, `wingo5`, `wingo10`, `k5d`, `k5d3`, `k5d5`, `k5d10`, `win_rate`, `telegram`, `cskh`, `app`) VALUES (NULL, '-1', '-1', '-1', '-1', '-1', '-1', '-1', '-1', '80', 'https://t.me/dreamsister', 'https://t.me/ChenQiaoYing', '#')");
}

const CreateAviator = async(req, res) => {
    // Ensure aviator table
    await connection.execute(`CREATE TABLE IF NOT EXISTS \`aviator\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`period\` varchar(50) NOT NULL,
      \`crash_point\` decimal(10,2) NOT NULL DEFAULT 1.00,
      \`status\` int(11) NOT NULL DEFAULT 0,
      \`time\` varchar(50) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    // Ensure aviator_bets table
    await connection.execute(`CREATE TABLE IF NOT EXISTS \`aviator_bets\` (
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

    // Ensure admin_settings table
    await connection.execute(`CREATE TABLE IF NOT EXISTS \`admin_settings\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`setting_key\` varchar(100) NOT NULL,
      \`setting_value\` text DEFAULT NULL,
      \`updated_at\` bigint(20) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`setting_key\` (\`setting_key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    console.log("Create Success Database Aviator.");
}

const CreateChicken = async(req, res) => {
    // Ensure chicken_rounds table
    await connection.execute(`CREATE TABLE IF NOT EXISTS \`chicken_rounds\` (
      \`id\` varchar(64) NOT NULL,
      \`phone\` varchar(20) NOT NULL,
      \`bet_amount\` decimal(10,2) NOT NULL DEFAULT 0.00,
      \`difficulty\` varchar(20) NOT NULL DEFAULT 'Medium',
      \`current_lane\` int(11) NOT NULL DEFAULT 0,
      \`current_multiplier\` decimal(10,2) NOT NULL DEFAULT 1.00,
      \`cashout_amount\` decimal(10,2) DEFAULT NULL,
      \`status\` varchar(20) NOT NULL DEFAULT 'ACTIVE',
      \`server_seed_hash\` varchar(128) NOT NULL,
      \`server_seed\` varchar(128) NOT NULL,
      \`time\` varchar(50) NOT NULL,
      \`ended_at\` varchar(50) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_phone\` (\`phone\`),
      KEY \`idx_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    // Ensure chicken_steps table
    await connection.execute(`CREATE TABLE IF NOT EXISTS \`chicken_steps\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`round_id\` varchar(64) NOT NULL,
      \`lane\` int(11) NOT NULL,
      \`result\` varchar(20) NOT NULL,
      \`multiplier_before\` decimal(10,2) NOT NULL DEFAULT 1.00,
      \`multiplier_after\` decimal(10,2) NOT NULL DEFAULT 1.00,
      \`random_proof\` text DEFAULT NULL,
      \`time\` varchar(50) NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_round_id\` (\`round_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    // Ensure default chicken admin settings
    await connection.execute(`INSERT IGNORE INTO \`admin_settings\` (\`setting_key\`, \`setting_value\`, \`updated_at\`) VALUES
      ('chicken_min_bet', '10', ${timeNow}),
      ('chicken_max_bet', '10000', ${timeNow}),
      ('chicken_win_rate_modifier', '1.0', ${timeNow}),
      ('chicken_maintenance_mode', '0', ${timeNow});`);

    console.log("Create Success Database Chicken Road.");
}

const CreateMines = async(req, res) => {
    // Ensure mines_rounds table
    await connection.execute(`CREATE TABLE IF NOT EXISTS \`mines_rounds\` (
      \`id\` varchar(64) NOT NULL,
      \`phone\` varchar(20) NOT NULL,
      \`bet_amount\` decimal(10,2) NOT NULL DEFAULT 0.00,
      \`mine_count\` int(11) NOT NULL DEFAULT 5,
      \`board_rows\` int(11) NOT NULL DEFAULT 5,
      \`board_cols\` int(11) NOT NULL DEFAULT 5,
      \`mine_positions\` text NOT NULL,
      \`selected_tiles\` text NOT NULL,
      \`house_edge\` decimal(5,4) NOT NULL DEFAULT 0.0500,
      \`multiplier\` decimal(10,2) NOT NULL DEFAULT 1.00,
      \`status\` varchar(20) NOT NULL DEFAULT 'PLAYING',
      \`payout\` decimal(10,2) NOT NULL DEFAULT 0.00,
      \`server_seed\` varchar(128) DEFAULT NULL,
      \`server_seed_hash\` varchar(128) DEFAULT NULL,
      \`time\` varchar(50) NOT NULL,
      \`ended_at\` varchar(50) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`idx_phone\` (\`phone\`),
      KEY \`idx_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    // Ensure default mines admin settings
    await connection.execute(`INSERT IGNORE INTO \`admin_settings\` (\`setting_key\`, \`setting_value\`, \`updated_at\`) VALUES
      ('mines_min_bet', '10', ${timeNow}),
      ('mines_max_bet', '50000', ${timeNow}),
      ('mines_house_edge', '0.05', ${timeNow}),
      ('mines_maintenance_mode', '0', ${timeNow}),
      ('mines_emergency_stop', '0', ${timeNow}),
      ('mines_max_multiplier', '10000', ${timeNow});`);

    console.log("Create Success Database Mines.");
}

CreateWingo();
Create5D();
CreateK3();
CreateAviator();
CreateChicken();
CreateMines();