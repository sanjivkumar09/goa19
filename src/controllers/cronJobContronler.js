const connection = require("../config/connectDB.js");
const winGoController = require("./winGoController.js");
const k5Controller = require("./k5Controller.js");
const k3Controller = require("./k3Controller.js");
const cron = require('node-cron');

// Initialize game periods if they don't exist
const initializeGamePeriods = async () => {
    try {
        const timeNow = Date.now();
        let date = new Date();
        let years = date.getFullYear();
        let months = String(date.getMonth() + 1).padStart(2, '0');
        let days = String(date.getDate()).padStart(2, '0');
        let todayPrefix = `${years}${months}${days}`;
        
        // Initialize WinGo games
        const wingoGames = [
            { game: 1, name: 'wingo' },
            { game: 3, name: 'wingo3' },
            { game: 5, name: 'wingo5' },
            { game: 10, name: 'wingo10' }
        ];
        
        for (const { game, name } of wingoGames) {
            const [existing] = await connection.query(`SELECT * FROM wingo WHERE game = '${name}' AND status = 0 LIMIT 1`);
            if (!existing || existing.length === 0) {
                const [last] = await connection.query(`SELECT period FROM wingo WHERE game = '${name}' ORDER BY id DESC LIMIT 1`);
                let startPeriod = `${todayPrefix}0001`;
                if (last && last.length > 0 && String(last[0].period).startsWith(todayPrefix)) {
                    let seq = (parseInt(String(last[0].period).slice(todayPrefix.length), 10) || 0) + 1;
                    startPeriod = `${todayPrefix}${String(seq).padStart(4, '0')}`;
                }
                console.log(`Initializing ${name} game period with: ${startPeriod}`);
                await connection.execute(
                    `INSERT INTO wingo (period, amount, game, status, time) VALUES (?, ?, ?, ?, ?)`,
                    [startPeriod, 0, name, 0, timeNow]
                );
            }
        }
        
        // Initialize K3 games
        const k3Games = [1, 3, 5, 10];
        for (const game of k3Games) {
            const [existing] = await connection.query(`SELECT * FROM k3 WHERE game = ${game} AND status = 0 LIMIT 1`);
            if (!existing || existing.length === 0) {
                const [last] = await connection.query(`SELECT period FROM k3 WHERE game = ${game} ORDER BY id DESC LIMIT 1`);
                let startPeriod = `${todayPrefix}0001`;
                if (last && last.length > 0 && String(last[0].period).startsWith(todayPrefix)) {
                    let seq = (parseInt(String(last[0].period).slice(todayPrefix.length), 10) || 0) + 1;
                    startPeriod = `${todayPrefix}${String(seq).padStart(4, '0')}`;
                }
                console.log(`Initializing K3 game ${game} period with: ${startPeriod}`);
                await connection.execute(
                    `INSERT INTO k3 (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)`,
                    [startPeriod, 0, game, 0, timeNow]
                );
            }
        }
        
        // Initialize 5D games
        const d5Games = [1, 3, 5, 10];
        for (const game of d5Games) {
            const [existing] = await connection.query(`SELECT * FROM 5d WHERE game = ${game} AND status = 0 LIMIT 1`);
            if (!existing || existing.length === 0) {
                const [last] = await connection.query(`SELECT period FROM 5d WHERE game = ${game} ORDER BY id DESC LIMIT 1`);
                let startPeriod = `${todayPrefix}0001`;
                if (last && last.length > 0 && String(last[0].period).startsWith(todayPrefix)) {
                    let seq = (parseInt(String(last[0].period).slice(todayPrefix.length), 10) || 0) + 1;
                    startPeriod = `${todayPrefix}${String(seq).padStart(4, '0')}`;
                }
                console.log(`Initializing 5D game ${game} period with: ${startPeriod}`);
                await connection.execute(
                    `INSERT INTO 5d (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)`,
                    [startPeriod, '00000', game, 0, timeNow]
                );
            }
        }
        
        console.log('Game periods initialization complete!');
    } catch (error) {
        console.error('Error initializing game periods:', error);
    }
};

const cronJobGame1p = (io) => {
    cron.schedule('*/1 * * * *', async() => {
        await winGoController.addWinGo(1);
        await winGoController.handlingWinGo1P(1);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo" ORDER BY `id` DESC LIMIT 2 ', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });

        await k5Controller.add5D(1);
        await k5Controller.handling5D(1);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': '1' });

        await k3Controller.addK3(1);
        await k3Controller.handlingK3(1);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '1' });
    });
    cron.schedule('*/3 * * * *', async() => {
        await winGoController.addWinGo(3);
        await winGoController.handlingWinGo1P(3);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo3" ORDER BY `id` DESC LIMIT 2 ', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });

        await k5Controller.add5D(3);
        await k5Controller.handling5D(3);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': '3' });

        await k3Controller.addK3(3);
        await k3Controller.handlingK3(3);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '3' });
    });
    cron.schedule('*/5 * * * *', async() => {
        await winGoController.addWinGo(5);
        await winGoController.handlingWinGo1P(5);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo5" ORDER BY `id` DESC LIMIT 2 ', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });

        await k5Controller.add5D(5);
        await k5Controller.handling5D(5);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': '5' });

        await k3Controller.addK3(5);
        await k3Controller.handlingK3(5);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '5' });
    });
    cron.schedule('*/10 * * * *', async() => {
        await winGoController.addWinGo(10);
        await winGoController.handlingWinGo1P(10);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2 ', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });

        
        await k5Controller.add5D(10);
        await k5Controller.handling5D(10);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': '10' });

        await k3Controller.addK3(10);
        await k3Controller.handlingK3(10);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '10' });
    });

    cron.schedule('* * 0 * * *', async() => {
        await connection.execute('UPDATE users SET roses_today = ?', [0]);
        await connection.execute('UPDATE point_list SET money = ?', [0]);
    });
}

module.exports = { cronJobGame1p, initializeGamePeriods };