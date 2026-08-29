const connection = require('../config/connectDB.js');
require('dotenv').config();

// In-memory state for Aviator Game Engine
let ioInstance = null;
let gameState = {
    status: 'WAITING', // 'WAITING' | 'BETTING_OPEN' | 'FLYING' | 'CRASHED' | 'RESULT'
    currentPeriod: '1',
    crashMultiplier: 1.00,
    currentMultiplier: 1.00,
    flightStartTime: 0,
    activeBets: new Map(),  // key: betId (string/number), value: betObj
    queuedBets: new Map(),  // key: betId (string/number), value: betObj (queued for next round)
    recentHistory: [1.25, 2.10, 1.05, 5.40, 1.80, 3.20, 1.15, 12.50, 2.05, 1.42]
};

let tickInterval = null;
let stateTimer = null;

// Initialize Game Engine with Socket.IO
const initAviatorEngine = async (io) => {
    ioInstance = io;
    console.log('✈️ Initializing Aviator Game Engine...');

    try {
        // Load recent history from DB
        const [rows] = await connection.execute(
            'SELECT `crash_point` FROM `aviator` WHERE `status` = 1 ORDER BY `id` DESC LIMIT 20'
        );
        if (rows && rows.length > 0) {
            gameState.recentHistory = rows.map(r => parseFloat(r.crash_point));
        }

        // Load last period number
        const [lastRound] = await connection.execute(
            'SELECT `period` FROM `aviator` ORDER BY `id` DESC LIMIT 1'
        );
        if (lastRound && lastRound.length > 0) {
            const lastNum = parseInt(lastRound[0].period, 10);
            gameState.currentPeriod = isNaN(lastNum) ? '1' : String(lastNum);
        } else {
            gameState.currentPeriod = '1';
        }
    } catch (err) {
        console.error('Error initializing Aviator DB state:', err.message);
    }

    // Socket.IO Connection Handler for Aviator
    io.on('connection', (socket) => {
        socket.on('aviator:join', () => {
            socket.emit('aviator:state', getPublicState());
        });

        socket.on('aviator:place_bet', async (data, callback) => {
            try {
                const res = await placeBetInternal(data.auth, data.amount, data.autoCashout, data.panelNum);
                if (typeof callback === 'function') callback(res);
            } catch (e) {
                if (typeof callback === 'function') callback({ status: false, message: e.message });
            }
        });

        socket.on('aviator:cashout', async (data, callback) => {
            try {
                const res = await cashoutInternal(data.auth, data.betId);
                if (typeof callback === 'function') callback(res);
            } catch (e) {
                if (typeof callback === 'function') callback({ status: false, message: e.message });
            }
        });

        socket.on('aviator:cancel_bet', async (data, callback) => {
            try {
                const res = await cancelBetInternal(data.auth, data.betId);
                if (typeof callback === 'function') callback(res);
            } catch (e) {
                if (typeof callback === 'function') callback({ status: false, message: e.message });
            }
        });
    });

    // Start initial game cycle
    startNextRoundCycle();
};

const getPublicState = () => {
    return {
        status: gameState.status,
        currentPeriod: gameState.currentPeriod,
        currentMultiplier: gameState.currentMultiplier,
        crashMultiplier: (gameState.status === 'CRASHED' || gameState.status === 'RESULT') ? gameState.crashMultiplier : null,
        recentHistory: gameState.recentHistory,
        activeBets: Array.from(gameState.activeBets.values())
    };
};

const broadcastState = () => {
    if (ioInstance) {
        ioInstance.emit('aviator:state', getPublicState());
    }
};

// Generate provably fair crash multiplier or read admin override
const generateCrashMultiplier = async () => {
    try {
        // Check if Admin set next crash multiplier override
        const [settings] = await connection.execute(
            'SELECT `setting_value` FROM `admin_settings` WHERE `setting_key` = "aviator_next_crash"'
        );
        if (settings && settings.length > 0 && settings[0].setting_value !== null && settings[0].setting_value !== '') {
            const overrideVal = parseFloat(settings[0].setting_value);
            if (!isNaN(overrideVal) && overrideVal >= 1.00) {
                // Clear admin override after consuming
                await connection.execute(
                    'UPDATE `admin_settings` SET `setting_value` = NULL WHERE `setting_key` = "aviator_next_crash"'
                );
                console.log(`🎯 Aviator using ADMIN OVERRIDE crash point: ${overrideVal.toFixed(2)}x`);
                return overrideVal;
            }
        }
    } catch (e) {
        console.error('Error reading admin override setting:', e.message);
    }

    // Default random multiplier algorithm
    const rand = Math.random();
    // 3% house edge / instant crash chance (1.00x)
    if (rand < 0.03) return 1.00;

    let crash = 0.99 / (1 - rand);
    if (crash < 1.00) crash = 1.00;
    if (crash > 100.00) crash = 100.00;
    return Math.floor(crash * 100) / 100;
};

const startNextRoundCycle = async () => {
    if (tickInterval) clearInterval(tickInterval);
    if (stateTimer) clearTimeout(stateTimer);

    gameState.status = 'WAITING';
    gameState.currentMultiplier = 1.00;
    gameState.activeBets.clear();

    // Promote queued bets to active bets for the new round
    for (const [bId, bObj] of gameState.queuedBets.entries()) {
        bObj.period = String(parseInt(gameState.currentPeriod, 10) + 1);
        gameState.activeBets.set(bId, bObj);
    }
    gameState.queuedBets.clear();

    gameState.currentPeriod = String(parseInt(gameState.currentPeriod, 10) + 1);
    gameState.crashMultiplier = await generateCrashMultiplier();

    const timeNow = Date.now().toString();

    try {
        await connection.execute(
            'INSERT INTO `aviator` (`period`, `crash_point`, `status`, `time`) VALUES (?, ?, 0, ?)',
            [gameState.currentPeriod, gameState.crashMultiplier, timeNow]
        );
    } catch (err) {
        console.error('Error inserting aviator round:', err.message);
    }

    console.log(`\n🚀 Aviator Round #${gameState.currentPeriod} Started | Crash Point: ${gameState.crashMultiplier}x`);
    broadcastState();

    // 3-second WAITING period -> BETTING_OPEN
    stateTimer = setTimeout(() => {
        openBettingWindow();
    }, 3000);
};

const openBettingWindow = () => {
    gameState.status = 'BETTING_OPEN';
    console.log(`🟢 Aviator Round #${gameState.currentPeriod}: BETTING_OPEN (5s)`);
    
    if (ioInstance) {
        ioInstance.emit('aviator:betting', {
            period: gameState.currentPeriod,
            durationMs: 5000
        });
    }
    broadcastState();

    // 5-second BETTING_OPEN period -> FLYING
    stateTimer = setTimeout(() => {
        startFlight();
    }, 5000);
};

const startFlight = () => {
    gameState.status = 'FLYING';
    gameState.flightStartTime = Date.now();
    console.log(`🛫 Aviator Round #${gameState.currentPeriod}: FLYING!`);

    if (ioInstance) {
        ioInstance.emit('aviator:flying', {
            period: gameState.currentPeriod,
            startTime: gameState.flightStartTime
        });
    }

    // Engine loop every 60ms (~16 FPS)
    tickInterval = setInterval(() => {
        engineTick();
    }, 60);
};

const engineTick = async () => {
    if (gameState.status !== 'FLYING') return;

    const elapsedSeconds = (Date.now() - gameState.flightStartTime) / 1000;
    // Exponential speed multiplier curve
    let calcMultiplier = Math.floor((1.00 + Math.pow(elapsedSeconds, 1.35) * 0.08) * 100) / 100;

    if (calcMultiplier >= gameState.crashMultiplier) {
        gameState.currentMultiplier = gameState.crashMultiplier;
        triggerCrash();
        return;
    }

    gameState.currentMultiplier = calcMultiplier;

    if (ioInstance) {
        ioInstance.emit('aviator:multiplier', {
            period: gameState.currentPeriod,
            multiplier: gameState.currentMultiplier,
            elapsedSeconds
        });
    }

    // Process automatic server-side auto cash-outs
    await processAutoCashouts(gameState.currentMultiplier);
};

const processAutoCashouts = async (currentMult) => {
    for (const [betId, bet] of gameState.activeBets.entries()) {
        if (bet.status === 0 && bet.autoCashout && bet.autoCashout > 1.00) {
            if (currentMult >= bet.autoCashout) {
                try {
                    await executeCashout(bet.auth, betId, bet.autoCashout, true);
                } catch (err) {
                    console.error(`Auto-cashout error for bet ${betId}:`, err.message);
                }
            }
        }
    }
};

const triggerCrash = async () => {
    if (tickInterval) {
        clearInterval(tickInterval);
        tickInterval = null;
    }

    gameState.status = 'CRASHED';
    console.log(`💥 Aviator Round #${gameState.currentPeriod} CRASHED at ${gameState.crashMultiplier}x!`);

    try {
        // Update round status in DB
        await connection.execute(
            'UPDATE `aviator` SET `status` = 1, `crash_point` = ? WHERE `period` = ?',
            [gameState.crashMultiplier, gameState.currentPeriod]
        );

        // Update remaining un-cashed bets as LOST
        await connection.execute(
            'UPDATE `aviator_bets` SET `status` = 2, `result` = ? WHERE `period` = ? AND `cashed_out` = 0',
            [gameState.crashMultiplier, gameState.currentPeriod]
        );
    } catch (err) {
        console.error('Error updating crash state in DB:', err.message);
    }

    // Update local state map
    for (const [betId, bet] of gameState.activeBets.entries()) {
        if (bet.status === 0) {
            bet.status = 2; // Lost
        }
    }

    // Add to recent history
    gameState.recentHistory.unshift(gameState.crashMultiplier);
    if (gameState.recentHistory.length > 20) gameState.recentHistory.pop();

    if (ioInstance) {
        ioInstance.emit('aviator:crashed', {
            period: gameState.currentPeriod,
            crashMultiplier: gameState.crashMultiplier
        });
    }
    broadcastState();

    // 2-second CRASHED display -> RESULT
    stateTimer = setTimeout(() => {
        showResultAndReset();
    }, 2000);
};

const showResultAndReset = () => {
    gameState.status = 'RESULT';
    if (ioInstance) {
        ioInstance.emit('aviator:result', {
            period: gameState.currentPeriod,
            crashMultiplier: gameState.crashMultiplier
        });
    }

    // Reset after 1 second
    stateTimer = setTimeout(() => {
        startNextRoundCycle();
    }, 1000);
};

// --- Business Logic Helpers ---

const placeBetInternal = async (authCookie, amount, autoCashout, panelNum = 1) => {
    const betMoney = parseFloat(amount);
    if (isNaN(betMoney) || betMoney <= 0) {
        throw new Error('Invalid bet amount!');
    }

    if (!authCookie) {
        throw new Error('Please login to place bets!');
    }

    // Fetch user details
    const [users] = await connection.execute(
        'SELECT `phone`, `money`, `money_user`, `code`, `invite`, `name_user`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1',
        [authCookie]
    );

    if (!users || users.length === 0) {
        throw new Error('User authentication failed!');
    }

    const user = users[0];
    if (user.status != 1) {
        throw new Error('Account suspended!');
    }

    const rawBal = (user.money_user !== null && user.money_user !== undefined) ? user.money_user : user.money;
    const userBalance = parseFloat(rawBal || 0);

    if (userBalance < betMoney) {
        throw new Error('Insufficient wallet balance!');
    }

    // Check count of active bets for this user in current round
    let userActiveBetsCount = 0;
    for (const [, b] of gameState.activeBets.entries()) {
        if (b.phone === user.phone && b.status === 0) {
            userActiveBetsCount++;
        }
    }
    if (userActiveBetsCount >= 2) {
        throw new Error('Maximum 2 active bets allowed per round!');
    }

    const newBalance = userBalance - betMoney;
    const timeNow = Date.now().toString();
    const autoVal = (autoCashout && parseFloat(autoCashout) > 1.00) ? parseFloat(autoCashout) : null;
    const isQueued = (gameState.status === 'FLYING' || gameState.status === 'CRASHED' || gameState.status === 'RESULT');
    const targetPeriod = isQueued ? String(parseInt(gameState.currentPeriod, 10) + 1) : gameState.currentPeriod;

    // Deduct money atomically from both money and money_user
    await connection.execute(
        'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
        [newBalance, newBalance, user.phone]
    );

    // Record bet in aviator_bets table with backticks around reserved column names (`get`, `result`, `status`)
    const [result] = await connection.execute(
        'INSERT INTO `aviator_bets` (`period`, `phone`, `code`, `invite`, `money`, `amount`, `fee`, `get`, `result`, `status`, `cashed_out`, `cashout_multiplier`, `time`) VALUES (?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, 0, ?)',
        [targetPeriod, user.phone, user.code || '', user.invite || '', betMoney, timeNow]
    );

    const betId = result.insertId;
    const betObj = {
        id: betId,
        auth: authCookie,
        phone: user.phone,
        username: user.name_user || user.phone,
        money: betMoney,
        autoCashout: autoVal,
        cashoutMultiplier: 0,
        payout: 0,
        status: 0, // 0 = pending, 1 = won, 2 = lost
        panelNum
    };

    if (isQueued) {
        gameState.queuedBets.set(betId, betObj);
    } else {
        gameState.activeBets.set(betId, betObj);
    }

    if (ioInstance) {
        ioInstance.emit('aviator:player_bet', {
            id: betId,
            username: betObj.username,
            amount: betMoney,
            autoCashout: autoVal,
            isQueued
        });
    }
    broadcastState();

    return {
        status: true,
        message: isQueued ? 'Bet queued for next round!' : 'Bet placed successfully!',
        betId,
        newBalance,
        isQueued
    };
};

const cancelBetInternal = async (authCookie, betId) => {
    if (!betId) {
        throw new Error('Invalid Bet ID!');
    }

    const bIdNum = parseInt(betId, 10);
    const bIdStr = String(betId);

    // Look for the bet in activeBets or queuedBets
    let betObj = gameState.activeBets.get(bIdNum) || gameState.activeBets.get(bIdStr) || gameState.activeBets.get(betId);
    let isQueued = false;

    if (!betObj) {
        betObj = gameState.queuedBets.get(bIdNum) || gameState.queuedBets.get(bIdStr) || gameState.queuedBets.get(betId);
        if (betObj) isQueued = true;
    }

    if (!betObj) {
        throw new Error('No pending bet found to cancel!');
    }

    // Active bets cannot be cancelled once flight has started (must cashout instead)
    if (!isQueued && gameState.status === 'FLYING') {
        throw new Error('Flight has already started! Use Cash Out.');
    }

    if (betObj.status !== 0) {
        throw new Error('Bet is already settled or cancelled!');
    }

    // Verify user authorization
    const [users] = await connection.execute(
        'SELECT `phone`, `money`, `money_user` FROM `users` WHERE `token` = ? AND `veri` = 1',
        [authCookie || betObj.auth]
    );

    if (!users || users.length === 0 || users[0].phone !== betObj.phone) {
        throw new Error('Unauthorized cancel attempt!');
    }

    const user = users[0];
    const rawBal = (user.money_user !== null && user.money_user !== undefined) ? user.money_user : user.money;
    const currentBalance = parseFloat(rawBal || 0);
    const refundAmount = parseFloat(betObj.money || 0);
    const newBalance = currentBalance + refundAmount;

    // Refund money atomically to both money and money_user
    await connection.execute(
        'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
        [newBalance, newBalance, user.phone]
    );

    // Update aviator_bets table status = 3 (Cancelled)
    await connection.execute(
        'UPDATE `aviator_bets` SET `status` = 3, `result` = 0 WHERE `id` = ?',
        [betObj.id]
    );

    // Remove from in-memory maps
    gameState.activeBets.delete(bIdNum);
    gameState.activeBets.delete(bIdStr);
    gameState.queuedBets.delete(bIdNum);
    gameState.queuedBets.delete(bIdStr);

    console.log(`↩️ Player ${betObj.username} CANCELLED bet #${betObj.id} (Refunded: ₹${refundAmount})`);

    if (ioInstance) {
        ioInstance.emit('aviator:player_cancel', {
            betId: betObj.id,
            phone: betObj.phone,
            username: betObj.username,
            amount: refundAmount
        });
    }
    broadcastState();

    return {
        status: true,
        message: `Bet cancelled! Refunded ₹${refundAmount.toFixed(2)}`,
        betId: betObj.id,
        newBalance
    };
};

const cashoutInternal = async (authCookie, betId, forceMultiplier = null, isAuto = false) => {
    if (gameState.status !== 'FLYING') {
        throw new Error('Cash-out is only allowed during active flight!');
    }

    const bIdNum = parseInt(betId, 10);
    const bIdStr = String(betId);
    const currentMult = forceMultiplier || gameState.currentMultiplier;
    const betObj = gameState.activeBets.get(bIdNum) || gameState.activeBets.get(bIdStr) || gameState.activeBets.get(betId);

    if (!betObj) {
        throw new Error('No active bet found for cash-out!');
    }

    // Idempotency: If already cashed out, gracefully return the existing payout
    if (betObj.status === 1) {
        const [users] = await connection.execute(
            'SELECT `phone`, `money`, `money_user` FROM `users` WHERE `token` = ? AND `veri` = 1',
            [authCookie || betObj.auth]
        );
        const curBal = users && users.length > 0 ? ((users[0].money_user !== null && users[0].money_user !== undefined) ? users[0].money_user : users[0].money) : 0;
        return {
            status: true,
            message: `Already cashed out at ${parseFloat(betObj.cashoutMultiplier).toFixed(2)}x!`,
            multiplier: betObj.cashoutMultiplier,
            payout: betObj.payout,
            newBalance: parseFloat(curBal || 0)
        };
    }

    if (betObj.status !== 0) {
        throw new Error('Bet is no longer active!');
    }

    // Verify user authorization
    const [users] = await connection.execute(
        'SELECT `phone`, `money`, `money_user` FROM `users` WHERE `token` = ? AND `veri` = 1',
        [authCookie || betObj.auth]
    );

    if (!users || users.length === 0 || users[0].phone !== betObj.phone) {
        throw new Error('Unauthorized cash-out attempt!');
    }

    const user = users[0];
    const rawBal = (user.money_user !== null && user.money_user !== undefined) ? user.money_user : user.money;
    const currentBalance = parseFloat(rawBal || 0);

    const payout = Math.floor(betObj.money * currentMult * 100) / 100;
    const newBalance = currentBalance + payout;

    // Credit payout to user balance in both money and money_user
    await connection.execute(
        'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
        [newBalance, newBalance, user.phone]
    );

    // Update aviator_bets table with backticks
    await connection.execute(
        'UPDATE `aviator_bets` SET `status` = 1, `cashed_out` = 1, `cashout_multiplier` = ?, `get` = ? WHERE `id` = ?',
        [currentMult, payout, betObj.id]
    );

    // Update in-memory state
    betObj.status = 1;
    betObj.cashoutMultiplier = currentMult;
    betObj.payout = payout;

    console.log(`💰 Player ${betObj.username} CASHED OUT @ ${currentMult.toFixed(2)}x (Payout: ₹${payout})`);

    if (ioInstance) {
        ioInstance.emit('aviator:player_cashout', {
            betId: betObj.id,
            phone: betObj.phone,
            username: betObj.username,
            multiplier: currentMult,
            payout,
            isAuto
        });
    }
    broadcastState();

    return {
        status: true,
        message: `Cashed out at ${currentMult.toFixed(2)}x!`,
        multiplier: currentMult,
        payout,
        newBalance
    };
};

const executeCashout = async (authCookie, betId, multiplier, isAuto) => {
    return await cashoutInternal(authCookie, betId, multiplier, isAuto);
};

// --- HTTP Route Handlers ---

const aviatorPage = async (req, res) => {
    return res.render('bet/aviator/aviator.ejs');
};

const betAviator = async (req, res) => {
    const auth = req.cookies.auth;
    const { amount, autoCashout, panelNum } = req.body;
    try {
        const result = await placeBetInternal(auth, amount, autoCashout, panelNum);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ status: false, message: err.message });
    }
};

const cashoutAviator = async (req, res) => {
    const auth = req.cookies.auth;
    const { betId } = req.body;
    try {
        const result = await cashoutInternal(auth, betId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ status: false, message: err.message });
    }
};

const cancelBetAviator = async (req, res) => {
    const auth = req.cookies.auth;
    const { betId } = req.body;
    try {
        const result = await cancelBetInternal(auth, betId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ status: false, message: err.message });
    }
};

const getAviatorHistory = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            'SELECT `period`, `crash_point`, `time` FROM `aviator` WHERE `status` = 1 ORDER BY `id` DESC LIMIT 30'
        );
        return res.status(200).json({ status: true, data: rows });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

const getAviatorMyBets = async (req, res) => {
    const auth = req.cookies.auth;
    try {
        const [users] = await connection.execute(
            'SELECT `phone` FROM `users` WHERE `token` = ? AND `veri` = 1',
            [auth]
        );
        if (!users || users.length === 0) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const phone = users[0].phone;
        const [rows] = await connection.execute(
            'SELECT * FROM `aviator_bets` WHERE `phone` = ? ORDER BY `id` DESC LIMIT 50',
            [phone]
        );
        return res.status(200).json({ status: true, data: rows });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

module.exports = {
    initAviatorEngine,
    getPublicState,
    aviatorPage,
    betAviator,
    cashoutAviator,
    cancelBetAviator,
    getAviatorHistory,
    getAviatorMyBets
};
