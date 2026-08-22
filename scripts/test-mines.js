const connection = require('../src/config/connectDB.js');
const minesController = require('../src/controllers/minesController.js');

async function test() {
    console.log('Testing Mines Controller and Database initialization...');
    try {
        await minesController.ensureMinesTables();
        console.log('✅ ensureMinesTables succeeded!');

        const [tables] = await connection.execute('SHOW TABLES LIKE "mines_rounds"');
        console.log('✅ mines_rounds table exists:', tables.length > 0);

        const [settings] = await connection.execute('SELECT * FROM `admin_settings` WHERE `setting_key` LIKE "mines_%"');
        console.log('✅ admin_settings for mines:', settings.map(s => `${s.setting_key}=${s.setting_value}`).join(', '));

        console.log('All tests passed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
}

test();
