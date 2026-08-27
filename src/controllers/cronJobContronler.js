const connection = require("../config/connectDB.js");
const winGoController = require("./winGoController.js");
const k5Controller = require("./k5Controller.js");
const k3Controller = require("./k3Controller.js");
const cron = require('node-cron');

// Initialize game periods ensuring active monotonic periods
const initializeGamePeriods = async () => {
    try {
        const timeNow = Date.now();
        const kolkataParts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date());
        const kYear = kolkataParts.find(p => p.type === 'year').value;
        const kMonth = kolkataParts.find(p => p.type === 'month').value;
        const kDay = kolkataParts.find(p => p.type === 'day').value;
        let todayPrefix = `${kYear}${kMonth}${kDay}`;
        let tz = 'Asia/Kolkata';
        
        console.log(`[GAME_ENGINE] Initializing periods on date=${todayPrefix}, tz=${tz}`);

        // Initialize WinGo games
        const wingoGames = [
            { game: 1, name: 'wingo' },
            { game: 3, name: 'wingo3' },
            { game: 5, name: 'wingo5' },
            { game: 10, name: 'wingo10' }
        ];
        
        for (const { game, name } of wingoGames) {
            // Close any stale status = 0 periods from older dates or duplicates
            await connection.execute(
                `UPDATE wingo SET status = 1, amount = IF(amount = 0, FLOOR(RAND()*10), amount) WHERE game = ? AND status = 0 AND period NOT LIKE ?`,
                [name, `${todayPrefix}%`]
            );

            const [existing] = await connection.query(`SELECT * FROM wingo WHERE game = ? AND status = 0 ORDER BY id DESC LIMIT 1`, [name]);
            if (!existing || existing.length === 0) {
                const [last] = await connection.query(`SELECT period FROM wingo WHERE game = ? ORDER BY id DESC LIMIT 1`, [name]);
                let startPeriod = `${todayPrefix}0001`;
                if (last && last.length > 0 && String(last[0].period).startsWith(todayPrefix)) {
                    let seq = (parseInt(String(last[0].period).slice(todayPrefix.length), 10) || 0) + 1;
                    startPeriod = `${todayPrefix}${String(seq).padStart(4, '0')}`;
                }
                console.log(`[WINGO_ENGINE] Initializing ${name} period: ${startPeriod}`);
                await connection.execute(
                    `INSERT INTO wingo (period, amount, game, status, time) VALUES (?, ?, ?, ?, ?)`,
                    [startPeriod, 0, name, 0, timeNow]
                );
            }
        }
        
        // Initialize K3 games
        const k3Games = [1, 3, 5, 10];
        for (const game of k3Games) {
            // Close any stale status = 0 periods from older dates
            await connection.execute(
                `UPDATE k3 SET status = 1, result = IF(result = 0, 111, result) WHERE game = ? AND status = 0 AND period NOT LIKE ?`,
                [game, `${todayPrefix}%`]
            );

            const [existing] = await connection.query(`SELECT * FROM k3 WHERE game = ? AND status = 0 ORDER BY id DESC LIMIT 1`, [game]);
            if (!existing || existing.length === 0) {
                const [last] = await connection.query(`SELECT period FROM k3 WHERE game = ? ORDER BY id DESC LIMIT 1`, [game]);
                let startPeriod = `${todayPrefix}0001`;
                if (last && last.length > 0 && String(last[0].period).startsWith(todayPrefix)) {
                    let seq = (parseInt(String(last[0].period).slice(todayPrefix.length), 10) || 0) + 1;
                    startPeriod = `${todayPrefix}${String(seq).padStart(4, '0')}`;
                }
                console.log(`[K3_ENGINE] Initializing K3 game ${game} period: ${startPeriod}`);
                await connection.execute(
                    `INSERT INTO k3 (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)`,
                    [startPeriod, 0, game, 0, timeNow]
                );
            }
        }
        
        // Initialize 5D games
        const d5Games = [1, 3, 5, 10];
        for (const game of d5Games) {
            // Close any stale status = 0 periods from older dates or duplicates (e.g. 20260119)
            await connection.execute(
                `UPDATE 5d SET status = 1, result = IF(result = '00000', LPAD(FLOOR(RAND()*100000), 5, '0'), result) WHERE game = ? AND status = 0 AND period NOT LIKE ?`,
                [game, `${todayPrefix}%`]
            );

            const [existing] = await connection.query(`SELECT * FROM 5d WHERE game = ? AND status = 0 ORDER BY id DESC LIMIT 1`, [game]);
            if (!existing || existing.length === 0) {
                const [last] = await connection.query(`SELECT period FROM 5d WHERE game = ? ORDER BY id DESC LIMIT 1`, [game]);
                let startPeriod = `${todayPrefix}0001`;
                if (last && last.length > 0 && String(last[0].period).startsWith(todayPrefix)) {
                    let seq = (parseInt(String(last[0].period).slice(todayPrefix.length), 10) || 0) + 1;
                    startPeriod = `${todayPrefix}${String(seq).padStart(4, '0')}`;
                }
                console.log(`[5D_ENGINE] Initializing 5D game ${game} period: ${startPeriod}`);
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

// Concurrency guard map to prevent overlapping ticks
const runningLocks = {
    1: false,
    3: false,
    5: false,
    10: false
};

// Bounded retry helper for MySQL deadlocks (ER_LOCK_DEADLOCK / errno 1213 / SQLSTATE 40001)
async function runWithDeadlockRetry(fn, maxRetries = 3, initialDelayMs = 50) {
    let attempts = 0;
    while (true) {
        try {
            return await fn();
        } catch (err) {
            attempts++;
            const isDeadlock = err && (
                err.code === 'ER_LOCK_DEADLOCK' ||
                err.errno === 1213 ||
                err.sqlState === '40001' ||
                (err.message && err.message.includes('Deadlock found'))
            );
            if (isDeadlock && attempts <= maxRetries) {
                const backoff = initialDelayMs * Math.pow(2, attempts - 1) + Math.floor(Math.random() * 30);
                console.warn(`[MYSQL_RETRY] Deadlock detected (attempt ${attempts}/${maxRetries}), retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                continue;
            }
            throw err;
        }
    }
}

// Process a single game tick with full isolation between WinGo, 5D, and K3
async function processGameTick(io, gameType) {
    if (runningLocks[gameType]) {
        console.warn(`[SCHEDULER] ${gameType}m tick already running, skipping overlapping invocation`);
        return;
    }
    runningLocks[gameType] = true;

    try {
        // --- WinGo Engine ---
        try {
            await runWithDeadlockRetry(() => winGoController.addWinGo(gameType));
            await runWithDeadlockRetry(() => winGoController.handlingWinGo1P(gameType));
            const gameName = gameType === 1 ? 'wingo' : `wingo${gameType}`;
            const [winGo] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = ? ORDER BY `id` DESC LIMIT 2', [gameName]);
            io.emit('data-server', { data: winGo });
        } catch (err) {
            console.error(`[WINGO_ENGINE] Error processing WinGo ${gameType}m:`, err.message || err);
        }

        // --- 5D Engine ---
        try {
            await runWithDeadlockRetry(() => k5Controller.add5D(gameType));
            await runWithDeadlockRetry(() => k5Controller.handling5D(gameType));
            const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = ? ORDER BY `id` DESC LIMIT 2', [gameType]);
            io.emit('data-server-5d', { data: k5D, 'game': String(gameType) });
        } catch (err) {
            console.error(`[5D_ENGINE] Error processing 5D ${gameType}m:`, err.message || err);
        }

        // --- K3 Engine ---
        try {
            await runWithDeadlockRetry(() => k3Controller.addK3(gameType));
            await runWithDeadlockRetry(() => k3Controller.handlingK3(gameType));
            const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = ? ORDER BY `id` DESC LIMIT 2', [gameType]);
            io.emit('data-server-k3', { data: k3, 'game': String(gameType) });
        } catch (err) {
            console.error(`[K3_ENGINE] Error processing K3 ${gameType}m:`, err.message || err);
        }
    } finally {
        runningLocks[gameType] = false;
    }
}

const cronJobGame1p = (io) => {
    // 1-Minute Cron
    cron.schedule('*/1 * * * *', async () => {
        await processGameTick(io, 1);
    });

    // 3-Minute Cron
    cron.schedule('*/3 * * * *', async () => {
        await processGameTick(io, 3);
    });

    // 5-Minute Cron
    cron.schedule('*/5 * * * *', async () => {
        await processGameTick(io, 5);
    });

    // 10-Minute Cron
    cron.schedule('*/10 * * * *', async () => {
        await processGameTick(io, 10);
    });

    // Daily Midnight Reset
    cron.schedule('* * 0 * * *', async () => {
        try {
            await connection.execute('UPDATE users SET roses_today = ?', [0]);
            await connection.execute('UPDATE point_list SET money = ?', [0]);
        } catch (err) {
            console.error('[SCHEDULER] Daily reset error:', err.message || err);
        }
    });
};

module.exports = { cronJobGame1p, initializeGamePeriods, runWithDeadlockRetry };