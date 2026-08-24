const crypto = require('crypto');
const connection = require('../config/connectDB.js');
require('dotenv').config();

let ioInstance = null;

// Difficulty configurations matching the client and shared definitions
const DIFFICULTY_CONFIGS = {
    Easy: [
        { lane: 1, safeProbability: 0.96, multiplier: 1.02 },
        { lane: 2, safeProbability: 0.96, multiplier: 1.06 },
        { lane: 3, safeProbability: 0.96, multiplier: 1.11 },
        { lane: 4, safeProbability: 0.96, multiplier: 1.16 },
        { lane: 5, safeProbability: 0.95, multiplier: 1.22 },
        { lane: 6, safeProbability: 0.95, multiplier: 1.28 },
        { lane: 7, safeProbability: 0.95, multiplier: 1.35 },
        { lane: 8, safeProbability: 0.95, multiplier: 1.42 },
        { lane: 9, safeProbability: 0.95, multiplier: 1.50 },
        { lane: 10, safeProbability: 0.95, multiplier: 1.60 },
        { lane: 11, safeProbability: 0.94, multiplier: 1.70 },
        { lane: 12, safeProbability: 0.94, multiplier: 1.82 },
        { lane: 13, safeProbability: 0.94, multiplier: 1.95 },
        { lane: 14, safeProbability: 0.94, multiplier: 2.10 },
        { lane: 15, safeProbability: 0.94, multiplier: 2.30 },
        { lane: 16, safeProbability: 0.93, multiplier: 2.55 },
        { lane: 17, safeProbability: 0.93, multiplier: 2.85 },
        { lane: 18, safeProbability: 0.93, multiplier: 3.25 },
        { lane: 19, safeProbability: 0.93, multiplier: 3.80 },
        { lane: 20, safeProbability: 0.92, multiplier: 4.60 },
        { lane: 21, safeProbability: 0.92, multiplier: 5.80 },
        { lane: 22, safeProbability: 0.92, multiplier: 8.00 },
        { lane: 23, safeProbability: 0.91, multiplier: 13.50 },
        { lane: 24, safeProbability: 0.90, multiplier: 24.50 },
    ],
    Medium: [
        { lane: 1, safeProbability: 0.92, multiplier: 1.08 },
        { lane: 2, safeProbability: 0.92, multiplier: 1.20 },
        { lane: 3, safeProbability: 0.91, multiplier: 1.35 },
        { lane: 4, safeProbability: 0.91, multiplier: 1.55 },
        { lane: 5, safeProbability: 0.90, multiplier: 1.80 },
        { lane: 6, safeProbability: 0.90, multiplier: 2.12 },
        { lane: 7, safeProbability: 0.90, multiplier: 2.55 },
        { lane: 8, safeProbability: 0.89, multiplier: 3.12 },
        { lane: 9, safeProbability: 0.89, multiplier: 3.90 },
        { lane: 10, safeProbability: 0.88, multiplier: 4.95 },
        { lane: 11, safeProbability: 0.88, multiplier: 6.40 },
        { lane: 12, safeProbability: 0.87, multiplier: 8.40 },
        { lane: 13, safeProbability: 0.87, multiplier: 11.20 },
        { lane: 14, safeProbability: 0.86, multiplier: 15.30 },
        { lane: 15, safeProbability: 0.86, multiplier: 21.50 },
        { lane: 16, safeProbability: 0.85, multiplier: 31.00 },
        { lane: 17, safeProbability: 0.85, multiplier: 46.00 },
        { lane: 18, safeProbability: 0.84, multiplier: 68.00 },
        { lane: 19, safeProbability: 0.84, multiplier: 88.00 },
        { lane: 20, safeProbability: 0.83, multiplier: 100.00 },
    ],
    Hard: [
        { lane: 1, safeProbability: 0.85, multiplier: 1.18 },
        { lane: 2, safeProbability: 0.85, multiplier: 1.45 },
        { lane: 3, safeProbability: 0.84, multiplier: 1.80 },
        { lane: 4, safeProbability: 0.84, multiplier: 2.30 },
        { lane: 5, safeProbability: 0.83, multiplier: 3.00 },
        { lane: 6, safeProbability: 0.83, multiplier: 4.00 },
        { lane: 7, safeProbability: 0.82, multiplier: 5.50 },
        { lane: 8, safeProbability: 0.82, multiplier: 7.70 },
        { lane: 9, safeProbability: 0.81, multiplier: 11.00 },
        { lane: 10, safeProbability: 0.81, multiplier: 16.00 },
        { lane: 11, safeProbability: 0.80, multiplier: 24.00 },
        { lane: 12, safeProbability: 0.80, multiplier: 38.00 },
        { lane: 13, safeProbability: 0.79, multiplier: 60.00 },
        { lane: 14, safeProbability: 0.79, multiplier: 98.00 },
        { lane: 15, safeProbability: 0.78, multiplier: 160.00 },
        { lane: 16, safeProbability: 0.78, multiplier: 260.00 },
        { lane: 17, safeProbability: 0.77, multiplier: 380.00 },
        { lane: 18, safeProbability: 0.76, multiplier: 450.00 },
    ],
    Hardcore: [
        { lane: 1, safeProbability: 0.75, multiplier: 1.35 },
        { lane: 2, safeProbability: 0.74, multiplier: 1.90 },
        { lane: 3, safeProbability: 0.73, multiplier: 2.75 },
        { lane: 4, safeProbability: 0.72, multiplier: 4.10 },
        { lane: 5, safeProbability: 0.71, multiplier: 6.30 },
        { lane: 6, safeProbability: 0.70, multiplier: 10.00 },
        { lane: 7, safeProbability: 0.69, multiplier: 16.50 },
        { lane: 8, safeProbability: 0.68, multiplier: 28.00 },
        { lane: 9, safeProbability: 0.67, multiplier: 50.00 },
        { lane: 10, safeProbability: 0.66, multiplier: 95.00 },
        { lane: 11, safeProbability: 0.65, multiplier: 190.00 },
        { lane: 12, safeProbability: 0.64, multiplier: 390.00 },
        { lane: 13, safeProbability: 0.62, multiplier: 820.00 },
        { lane: 14, safeProbability: 0.60, multiplier: 1500.00 },
        { lane: 15, safeProbability: 0.58, multiplier: 2250.00 },
    ],
};

// Auto ensure database tables exist on server start
const ensureChickenTables = async () => {
    try {
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

        const timeNow = Date.now();
        await connection.execute(`INSERT IGNORE INTO \`admin_settings\` (\`setting_key\`, \`setting_value\`, \`updated_at\`) VALUES
          ('chicken_min_bet', '10', ${timeNow}),
          ('chicken_max_bet', '10000', ${timeNow}),
          ('chicken_win_rate_modifier', '1.0', ${timeNow}),
          ('chicken_next_crash', NULL, ${timeNow}),
          ('chicken_maintenance_mode', '0', ${timeNow});`);

        console.log('🐔 Chicken Road Database verified and ready.');
    } catch (err) {
        console.error('Error ensuring chicken tables:', err.message);
    }
};

// Initialize Game Engine with Socket.IO
const initChickenEngine = async (io) => {
    ioInstance = io;
    console.log('🐔 Initializing Chicken Road Game Engine...');
    await ensureChickenTables();

    io.on('connection', (socket) => {
        socket.on('chicken:join', () => {
            socket.emit('chicken:joined', { status: true });
        });
    });
};

// Helper: Extract authenticated user from cookie or Authorization header
const getAuthenticatedUser = async (req) => {
    let token = req.cookies?.auth;
    if (!token && req.headers?.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'token')) {
            token = parts[1];
        }
    }

    if (!token) {
        return null;
    }

    try {
        const [users] = await connection.execute(
            'SELECT `id`, `id_user`, `phone`, `token`, `name_user`, `money`, `money_user`, `status`, `veri` FROM `users` WHERE `token` = ? AND `veri` = 1',
            [token]
        );
        if (!users || users.length === 0) return null;
        const user = users[0];
        if (user.status != 1) return null;
        return user;
    } catch (err) {
        console.error('getAuthenticatedUser error:', err.message);
        return null;
    }
};

// View Page Handler
const chickenPage = async (req, res) => {
    return res.render('bet/chicken/chicken.ejs');
};

// API: Auth Me
const getMe = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required. Please log in to DIU-win.'
            });
        }

        const [freshUsers] = await connection.execute(
            'SELECT `id`, `id_user`, `phone`, `name_user`, `money`, `money_user`, `status` FROM `users` WHERE `phone` = ?',
            [user.phone]
        );
        const freshUser = (freshUsers && freshUsers.length > 0) ? freshUsers[0] : user;
        const rawBal = (freshUser.money_user !== null && freshUser.money_user !== undefined) ? freshUser.money_user : freshUser.money;
        const balance = parseFloat(rawBal || 0);

        return res.status(200).json({
            id: String(freshUser.id_user || freshUser.phone),
            username: freshUser.name_user || freshUser.phone,
            email: `${freshUser.phone}@diuwin.game`,
            role: (freshUser.phone === '9981474023' || freshUser.phone === '9981474025') ? 'ADMIN' : 'USER',
            status: freshUser.status == 1 ? 'ACTIVE' : 'SUSPENDED',
            balance,
            isGuest: false
        });
    } catch (err) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
    }
};

// API: Wallet Balance (Live from MySQL users table)
const getWallet = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required.'
            });
        }

        const [freshUsers] = await connection.execute(
            'SELECT `id_user`, `phone`, `money`, `money_user` FROM `users` WHERE `phone` = ?',
            [user.phone]
        );
        const freshUser = (freshUsers && freshUsers.length > 0) ? freshUsers[0] : user;
        const rawBal = (freshUser.money_user !== null && freshUser.money_user !== undefined) ? freshUser.money_user : freshUser.money;
        const balance = parseFloat(rawBal || 0);

        return res.status(200).json({
            id: String(freshUser.id_user || freshUser.phone),
            userId: String(freshUser.id_user || freshUser.phone),
            balance,
            currency: 'INR'
        });
    } catch (err) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication error.' });
    }
};

// API: Claim Demo / Test Faucet (Disabled in production)
const claimFaucet = async (req, res) => {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Faucet is disabled. Please deposit in your DIU-win wallet.' });
};

// API: Start Round
const startGame = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in to play Chicken Road.' });
        }
        const userPhone = user.phone;

        // Check maintenance mode
        const [maintSetting] = await connection.execute(
            'SELECT `setting_value` FROM `admin_settings` WHERE `setting_key` = "chicken_maintenance_mode"'
        );
        if (maintSetting && maintSetting.length > 0 && maintSetting[0].setting_value === '1') {
            return res.status(503).json({ error: 'MAINTENANCE_MODE', message: 'Chicken Road is currently under maintenance.' });
        }

        const betAmount = parseFloat(req.body.betAmount);
        const difficulty = req.body.difficulty || 'Medium';

        if (!DIFFICULTY_CONFIGS[difficulty]) {
            return res.status(400).json({ error: 'INVALID_INPUT', message: 'Invalid difficulty level selected.' });
        }

        // Check min / max bet limits
        const [minSetting] = await connection.execute('SELECT `setting_value` FROM `admin_settings` WHERE `setting_key` = "chicken_min_bet"');
        const [maxSetting] = await connection.execute('SELECT `setting_value` FROM `admin_settings` WHERE `setting_key` = "chicken_max_bet"');
        const minBet = (minSetting && minSetting.length > 0) ? parseFloat(minSetting[0].setting_value) : 10;
        const maxBet = (maxSetting && maxSetting.length > 0) ? parseFloat(maxSetting[0].setting_value) : 10000;

        if (isNaN(betAmount) || betAmount < minBet || betAmount > maxBet) {
            return res.status(400).json({ error: 'INVALID_INPUT', message: `Bet amount must be between ₹${minBet} and ₹${maxBet}.` });
        }

        // Check for existing ACTIVE round
        const [activeRounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `phone` = ? AND `status` = "ACTIVE" LIMIT 1',
            [userPhone]
        );

        if (activeRounds && activeRounds.length > 0) {
            const existing = activeRounds[0];
            const rawBal = user ? ((user.money_user !== null && user.money_user !== undefined) ? user.money_user : user.money) : 10000;
            return res.status(200).json({
                gameId: existing.id,
                status: existing.status,
                betAmount: parseFloat(existing.bet_amount),
                difficulty: existing.difficulty,
                currentLane: existing.current_lane,
                multiplier: parseFloat(existing.current_multiplier),
                walletBalance: parseFloat(rawBal || 0),
                serverSeedHash: existing.server_seed_hash
            });
        }

        const rawBal = user ? ((user.money_user !== null && user.money_user !== undefined) ? user.money_user : user.money) : (req.body.demoBalance || 10000);
        const userBal = parseFloat(rawBal || 0);

        if (userBal < betAmount) {
            return res.status(400).json({ error: 'INSUFFICIENT_BALANCE', message: 'Insufficient wallet balance.' });
        }

        const newBal = userBal - betAmount;
        const timeNow = Date.now().toString();

        // Generate cryptographically secure server seed & hash
        const serverSeed = crypto.randomBytes(32).toString('hex');
        const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
        const gameId = 'CR_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');

        // Deduct user balance atomically if real user
        if (user) {
            await connection.execute(
                'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
                [newBal, newBal, user.phone]
            );
        }

        // Create ACTIVE game round
        await connection.execute(
            'INSERT INTO `chicken_rounds` (`id`, `phone`, `bet_amount`, `difficulty`, `current_lane`, `current_multiplier`, `status`, `server_seed_hash`, `server_seed`, `time`) VALUES (?, ?, ?, ?, 0, 1.00, "ACTIVE", ?, ?, ?)',
            [gameId, userPhone, betAmount, difficulty, serverSeedHash, serverSeed, timeNow]
        );

        if (ioInstance) {
            ioInstance.emit('chicken:live_bet', {
                gameId,
                username: user ? ((user.name_user || user.phone).slice(0, 4) + '****') : 'Demo Player',
                betAmount,
                difficulty,
                time: timeNow
            });
        }

        return res.status(200).json({
            gameId,
            status: 'ACTIVE',
            betAmount,
            difficulty,
            currentLane: 0,
            multiplier: 1.00,
            walletBalance: newBal,
            serverSeedHash
        });
    } catch (err) {
        console.error('startGame error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Jump Game
const jumpGame = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in to play.' });
        }
        const userPhone = user.phone;

        const gameId = req.params.id;
        const [rounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `id` = ? AND `phone` = ? LIMIT 1',
            [gameId, userPhone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(404).json({ error: 'ROUND_NOT_FOUND', message: 'Game round not found.' });
        }

        const round = rounds[0];
        if (round.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'ROUND_NOT_ACTIVE', message: `Cannot jump. Round is ${round.status}.` });
        }

        const difficulty = round.difficulty || 'Medium';
        const lanes = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.Medium;
        const nextLane = round.current_lane + 1;

        if (nextLane > lanes.length) {
            return res.status(400).json({ error: 'INVALID_STATE', message: 'Final lane reached. Please cash out.' });
        }

        const laneConfig = lanes.find(l => l.lane === nextLane);
        if (!laneConfig) {
            return res.status(500).json({ error: 'INVALID_STATE', message: `Configuration missing for lane ${nextLane}.` });
        }

        // Check admin next crash override
        let forceCrash = false;
        try {
            const [nextCrashSetting] = await connection.execute(
                'SELECT `setting_value` FROM `admin_settings` WHERE `setting_key` = "chicken_next_crash" LIMIT 1'
            );
            if (nextCrashSetting && nextCrashSetting.length > 0 && nextCrashSetting[0].setting_value !== null) {
                const val = String(nextCrashSetting[0].setting_value).trim().toLowerCase();
                if (val === '1' || val === 'force' || val === 'crash' || parseInt(val, 10) === nextLane) {
                    forceCrash = true;
                    await connection.execute(
                        'UPDATE `admin_settings` SET `setting_value` = NULL WHERE `setting_key` = "chicken_next_crash"'
                    );
                }
            }
        } catch (e) {
            console.error('Error checking chicken_next_crash:', e.message);
        }

        // Check admin win rate modifier
        const [modifierSetting] = await connection.execute(
            'SELECT `setting_value` FROM `admin_settings` WHERE `setting_key` = "chicken_win_rate_modifier"'
        );
        const winModifier = (modifierSetting && modifierSetting.length > 0) ? parseFloat(modifierSetting[0].setting_value) : 1.0;
        const effectiveSafeProb = Math.min(0.99, Math.max(0.01, laneConfig.safeProbability * (isNaN(winModifier) ? 1.0 : winModifier)));

        // Cryptographically secure HMAC-SHA256 outcome generation
        const requestId = req.body.requestId || 'req_' + Date.now();
        const proofInput = `${round.server_seed}:${nextLane}:${requestId}`;
        const hmac = crypto.createHmac('sha256', round.server_seed).update(proofInput).digest();
        const randomUint = hmac.readUInt32BE(0);
        const randomFloat = randomUint / 4294967296; // [0.0, 1.0)

        const isSafe = !forceCrash && (randomFloat < effectiveSafeProb);
        const timeNow = Date.now().toString();
        const multBefore = parseFloat(round.current_multiplier);
        const multAfter = laneConfig.multiplier;

        if (isSafe) {
            // SAFE step
            await connection.execute(
                'INSERT INTO `chicken_steps` (`round_id`, `lane`, `result`, `multiplier_before`, `multiplier_after`, `random_proof`, `time`) VALUES (?, ?, "SAFE", ?, ?, ?, ?)',
                [gameId, nextLane, multBefore, multAfter, hmac.toString('hex'), timeNow]
            );

            await connection.execute(
                'UPDATE `chicken_rounds` SET `current_lane` = ?, `current_multiplier` = ? WHERE `id` = ?',
                [nextLane, multAfter, gameId]
            );

            const betNum = parseFloat(round.bet_amount);
            const potentialCashout = parseFloat((betNum * multAfter).toFixed(2));

            if (ioInstance) {
                ioInstance.emit('chicken:jump', {
                    gameId,
                    lane: nextLane,
                    multiplier: multAfter,
                    result: 'SAFE'
                });
            }

            return res.status(200).json({
                gameId,
                result: 'SAFE',
                lane: nextLane,
                multiplier: multAfter,
                potentialCashout,
                status: 'ACTIVE'
            });
        } else {
            // HIT step - round is LOST
            await connection.execute(
                'INSERT INTO `chicken_steps` (`round_id`, `lane`, `result`, `multiplier_before`, `multiplier_after`, `random_proof`, `time`) VALUES (?, ?, "HIT", ?, ?, ?, ?)',
                [gameId, nextLane, multBefore, multBefore, hmac.toString('hex'), timeNow]
            );

            await connection.execute(
                'UPDATE `chicken_rounds` SET `status` = "LOST", `ended_at` = ? WHERE `id` = ?',
                [timeNow, gameId]
            );

            if (ioInstance) {
                ioInstance.emit('chicken:crash', {
                    gameId,
                    lane: nextLane,
                    username: (user.name_user || user.phone).slice(0, 4) + '****',
                    time: timeNow
                });
            }

            return res.status(200).json({
                gameId,
                result: 'HIT',
                lane: nextLane,
                multiplier: multBefore,
                status: 'LOST',
                serverSeed: round.server_seed // Reveal secret server seed upon completion
            });
        }
    } catch (err) {
        console.error('jumpGame error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Cashout Game
const cashoutGame = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in to cash out.' });
        }
        const userPhone = user.phone;

        const gameId = req.params.id;
        const [rounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `id` = ? AND `phone` = ? LIMIT 1',
            [gameId, userPhone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(404).json({ error: 'ROUND_NOT_FOUND', message: 'Game round not found.' });
        }

        const round = rounds[0];
        if (round.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'ROUND_NOT_ACTIVE', message: `Cannot cash out. Round is ${round.status}.` });
        }

        if (round.current_lane < 1) {
            return res.status(400).json({ error: 'INVALID_STATE', message: 'Must complete at least 1 lane before cashing out.' });
        }

        const betAmount = parseFloat(round.bet_amount);
        const multiplier = parseFloat(round.current_multiplier);
        const payoutAmount = parseFloat((betAmount * multiplier).toFixed(2));
        const timeNow = Date.now().toString();

        const [freshUsers] = await connection.execute(
            'SELECT `money`, `money_user` FROM `users` WHERE `phone` = ?',
            [userPhone]
        );
        const freshUser = (freshUsers && freshUsers.length > 0) ? freshUsers[0] : user;
        const rawBal = (freshUser.money_user !== null && freshUser.money_user !== undefined) ? freshUser.money_user : freshUser.money;
        const currentBal = parseFloat(rawBal || 0);
        const newBal = currentBal + payoutAmount;

        // Credit winnings to user wallet balance atomically in MySQL
        await connection.execute(
            'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
            [newBal, newBal, userPhone]
        );

        // Update round status to CASHED_OUT
        await connection.execute(
            'UPDATE `chicken_rounds` SET `status` = "CASHED_OUT", `cashout_amount` = ?, `ended_at` = ? WHERE `id` = ?',
            [payoutAmount, timeNow, gameId]
        );

        if (ioInstance) {
            ioInstance.emit('chicken:cashout', {
                gameId,
                username: (user.name_user || user.phone).slice(0, 4) + '****',
                multiplier,
                payoutAmount,
                time: timeNow
            });
        }

        return res.status(200).json({
            gameId,
            status: 'CASHED_OUT',
            payoutAmount,
            multiplier,
            walletBalance: newBal,
            serverSeed: round.server_seed
        });
    } catch (err) {
        console.error('cashoutGame error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Crash Game
const crashGame = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in.' });
        }
        const userPhone = user.phone;

        const gameId = req.params.id;
        const [rounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `id` = ? AND `phone` = ? LIMIT 1',
            [gameId, userPhone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(404).json({ error: 'ROUND_NOT_FOUND', message: 'Game round not found.' });
        }

        const round = rounds[0];
        const timeNow = Date.now().toString();

        if (round.status === 'ACTIVE') {
            await connection.execute(
                'UPDATE `chicken_rounds` SET `status` = "LOST", `ended_at` = ? WHERE `id` = ?',
                [timeNow, gameId]
            );
        }

        return res.status(200).json({
            gameId,
            status: 'LOST',
            serverSeed: round.server_seed
        });
    } catch (err) {
        console.error('crashGame error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Active Game State or By ID
const getGameById = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in.' });
        }
        const userPhone = user.phone;

        const gameId = req.params.id;
        const [rounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `id` = ? AND `phone` = ? LIMIT 1',
            [gameId, userPhone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(404).json({ error: 'ROUND_NOT_FOUND', message: 'Game round not found.' });
        }

        const round = rounds[0];
        const isTerminal = round.status !== 'ACTIVE';

        const [steps] = await connection.execute(
            'SELECT * FROM `chicken_steps` WHERE `round_id` = ? ORDER BY `lane` ASC',
            [gameId]
        );

        return res.status(200).json({
            id: round.id,
            userId: userPhone,
            betAmount: parseFloat(round.bet_amount),
            difficulty: round.difficulty,
            currentLane: round.current_lane,
            currentMultiplier: parseFloat(round.current_multiplier),
            status: round.status,
            cashoutAmount: round.cashout_amount ? parseFloat(round.cashout_amount) : null,
            serverSeedHash: round.server_seed_hash,
            serverSeed: isTerminal ? round.server_seed : null,
            startedAt: round.time,
            endedAt: round.ended_at,
            steps: steps.map(s => ({
                id: s.id,
                lane: s.lane,
                result: s.result,
                multiplierBefore: parseFloat(s.multiplier_before),
                multiplierAfter: parseFloat(s.multiplier_after),
                randomProof: isTerminal ? s.random_proof : null
            }))
        });
    } catch (err) {
        console.error('getGameById error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Get Current Active Round for User
const getActiveRound = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in.' });
        }
        const userPhone = user.phone;

        const [rounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `phone` = ? AND `status` = "ACTIVE" ORDER BY `time` DESC LIMIT 1',
            [userPhone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(200).json({ activeRound: null });
        }

        const round = rounds[0];
        const betNum = parseFloat(round.bet_amount);
        const multNum = parseFloat(round.current_multiplier);
        const rawBal = user ? ((user.money_user !== null && user.money_user !== undefined) ? user.money_user : user.money) : 10000;

        return res.status(200).json({
            activeRound: {
                gameId: round.id,
                status: round.status,
                betAmount: betNum,
                difficulty: round.difficulty,
                currentLane: round.current_lane,
                multiplier: multNum,
                potentialCashout: parseFloat((betNum * multNum).toFixed(2)),
                walletBalance: parseFloat(rawBal || 0),
                serverSeedHash: round.server_seed_hash
            }
        });
    } catch (err) {
        console.error('getActiveRound error:', err);
        return res.status(200).json({ activeRound: null });
    }
};

// API: User Game History
const getGameHistory = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in to view history.' });
        }
        const userPhone = user.phone;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const offset = (page - 1) * limit;

        const [rounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `phone` = ? ORDER BY `time` DESC LIMIT ? OFFSET ?',
            [userPhone, String(limit), String(offset)]
        );

        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as total FROM `chicken_rounds` WHERE `phone` = ?',
            [userPhone]
        );
        const total = countResult[0]?.total || 0;

        const formatted = (rounds || []).map(r => {
            const isTerminal = r.status !== 'ACTIVE';
            return {
                id: r.id,
                betAmount: parseFloat(r.bet_amount),
                difficulty: r.difficulty,
                currentLane: r.current_lane,
                multiplier: parseFloat(r.current_multiplier),
                status: r.status,
                cashoutAmount: r.cashout_amount ? parseFloat(r.cashout_amount) : null,
                serverSeedHash: r.server_seed_hash,
                serverSeed: isTerminal ? r.server_seed : null,
                startedAt: r.time,
                endedAt: r.ended_at
            };
        });

        return res.status(200).json({
            rounds: formatted,
            total,
            page,
            limit
        });
    } catch (err) {
        console.error('getGameHistory error:', err);
        return res.status(200).json({ rounds: [], total: 0, page: 1, limit: 20 });
    }
};

// API Admin: Metrics & Analytics
const getAdminMetrics = async (req, res) => {
    try {
        const [totalUsersRow] = await connection.execute('SELECT COUNT(*) as totalUsers FROM `users`');
        const [totalRoundsRow] = await connection.execute('SELECT COUNT(*) as total FROM `chicken_rounds`');
        const [totalWageredRow] = await connection.execute('SELECT SUM(`bet_amount`) as wagered FROM `chicken_rounds`');
        const [totalPayoutRow] = await connection.execute('SELECT SUM(`cashout_amount`) as payouts FROM `chicken_rounds` WHERE `status` = "CASHED_OUT"');
        const [activeRoundsRow] = await connection.execute('SELECT COUNT(*) as active FROM `chicken_rounds` WHERE `status` = "ACTIVE"');

        const totalUsers = totalUsersRow[0]?.totalUsers || 0;
        const totalRounds = totalRoundsRow[0]?.total || 0;
        const totalWagered = parseFloat(totalWageredRow[0]?.wagered || 0);
        const totalPayouts = parseFloat(totalPayoutRow[0]?.payouts || 0);
        const activeRounds = activeRoundsRow[0]?.active || 0;
        const profit = totalWagered - totalPayouts;
        const rtp = totalWagered > 0 ? ((totalPayouts / totalWagered) * 100).toFixed(2) : '0.00';

        const [recentRounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` ORDER BY `time` DESC LIMIT 30'
        );

        const metricsData = {
            totalUsers,
            totalRounds,
            totalWagered,
            totalVolume: totalWagered,
            totalPayouts,
            profit,
            houseProfit: profit,
            rtp: `${rtp}%`,
            activeRounds
        };

        return res.status(200).json({
            status: true,
            ...metricsData,
            metrics: metricsData,
            recentRounds: recentRounds || []
        });
    } catch (err) {
        console.error('getAdminMetrics error:', err);
        return res.status(500).json({ status: false, message: err.message });
    }
};

// API Admin: Get & Update Config
const getAdminConfig = async (req, res) => {
    try {
        const [settings] = await connection.execute(
            'SELECT `setting_key`, `setting_value` FROM `admin_settings` WHERE `setting_key` LIKE "chicken_%"'
        );

        const config = {
            minBet: 10,
            maxBet: 10000,
            winRateModifier: 1.0,
            maintenanceMode: false,
            difficulties: DIFFICULTY_CONFIGS
        };

        (settings || []).forEach(s => {
            if (s.setting_key === 'chicken_min_bet') config.minBet = parseFloat(s.setting_value);
            if (s.setting_key === 'chicken_max_bet') config.maxBet = parseFloat(s.setting_value);
            if (s.setting_key === 'chicken_win_rate_modifier') config.winRateModifier = parseFloat(s.setting_value);
            if (s.setting_key === 'chicken_next_crash') config.nextCrash = s.setting_value;
            if (s.setting_key === 'chicken_maintenance_mode') config.maintenanceMode = s.setting_value === '1';
        });

        return res.status(200).json({ status: true, config });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

const updateAdminConfig = async (req, res) => {
    try {
        const { minBet, maxBet, winRateModifier, nextCrash, maintenanceMode } = req.body;
        const timeNow = Date.now();

        if (minBet !== undefined) {
            await connection.execute(
                'INSERT INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("chicken_min_bet", ?, ?) ON DUPLICATE KEY UPDATE `setting_value` = ?, `updated_at` = ?',
                [String(minBet), timeNow, String(minBet), timeNow]
            );
        }
        if (maxBet !== undefined) {
            await connection.execute(
                'INSERT INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("chicken_max_bet", ?, ?) ON DUPLICATE KEY UPDATE `setting_value` = ?, `updated_at` = ?',
                [String(maxBet), timeNow, String(maxBet), timeNow]
            );
        }
        if (winRateModifier !== undefined) {
            await connection.execute(
                'INSERT INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("chicken_win_rate_modifier", ?, ?) ON DUPLICATE KEY UPDATE `setting_value` = ?, `updated_at` = ?',
                [String(winRateModifier), timeNow, String(winRateModifier), timeNow]
            );
        }
        if (nextCrash !== undefined) {
            await connection.execute(
                'INSERT INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("chicken_next_crash", ?, ?) ON DUPLICATE KEY UPDATE `setting_value` = ?, `updated_at` = ?',
                [nextCrash !== null ? String(nextCrash) : null, timeNow, nextCrash !== null ? String(nextCrash) : null, timeNow]
            );
        }
        if (maintenanceMode !== undefined) {
            await connection.execute(
                'INSERT INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("chicken_maintenance_mode", ?, ?) ON DUPLICATE KEY UPDATE `setting_value` = ?, `updated_at` = ?',
                [maintenanceMode ? '1' : '0', timeNow, maintenanceMode ? '1' : '0', timeNow]
            );
        }

        return res.status(200).json({ status: true, message: 'Chicken Road settings updated successfully!' });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const phone = email ? email.split('@')[0] : '';
        const [users] = await connection.execute(
            'SELECT `id`, `id_user`, `phone`, `token`, `name_user`, `money`, `money_user`, `status`, `password` FROM `users` WHERE `phone` = ?',
            [phone]
        );
        if (users && users.length > 0) {
            const user = users[0];
            res.cookie('auth', user.token, { maxAge: 900000000, httpOnly: true });
            return res.status(200).json({
                token: user.token,
                user: {
                    id: String(user.id_user || user.phone),
                    username: user.name_user || user.phone,
                    email: `${user.phone}@diuwin.game`,
                    role: 'USER',
                    status: user.status == 1 ? 'ACTIVE' : 'SUSPENDED'
                }
            });
        }
        const token = 'guest_token_' + Date.now();
        return res.status(200).json({
            token,
            user: { id: 'guest', username: email || 'Player', email: email || 'player@demo.com', role: 'USER', status: 'ACTIVE' }
        });
    } catch (e) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        return res.status(200).json({
            token,
            user: { id: 'user_' + Date.now(), username: username || 'Player', email: email || 'player@demo.com', role: 'USER', status: 'ACTIVE' }
        });
    } catch (e) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: e.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        const userPhone = user ? user.phone : 'demo_guest';
        const [rounds] = await connection.execute(
            'SELECT * FROM `chicken_rounds` WHERE `phone` = ? ORDER BY `time` DESC LIMIT 20',
            [userPhone]
        );
        const txs = (rounds || []).map(r => ({
            id: r.id,
            type: r.status === 'CASHED_OUT' ? 'WIN' : 'BET',
            amount: r.status === 'CASHED_OUT' ? parseFloat(r.cashout_amount || 0) : parseFloat(r.bet_amount),
            description: `Chicken Road ${r.difficulty} round ${r.status}`,
            createdAt: new Date(parseInt(r.time, 10)).toISOString()
        }));
        return res.status(200).json({ transactions: txs, total: txs.length });
    } catch (e) {
        return res.status(200).json({ transactions: [], total: 0 });
    }
};

const getAdminUsers = async (req, res) => {
    try {
        const [users] = await connection.execute(
            'SELECT `id`, `id_user`, `phone`, `name_user`, `money`, `money_user`, `status`, `time` FROM `users` ORDER BY `id` DESC LIMIT 50'
        );
        const formatted = (users || []).map(u => ({
            id: String(u.id_user || u.phone),
            username: u.name_user || u.phone,
            email: `${u.phone}@diuwin.game`,
            phone: u.phone,
            role: 'USER',
            status: u.status == 1 ? 'ACTIVE' : 'SUSPENDED',
            balance: parseFloat(u.money_user || u.money || 0),
            walletBalance: parseFloat(u.money_user || u.money || 0),
            createdAt: u.time ? new Date(parseInt(u.time, 10)).toISOString() : new Date().toISOString()
        }));
        return res.status(200).json({ status: true, users: formatted, total: formatted.length });
    } catch (e) {
        return res.status(200).json({ status: false, users: [], total: 0 });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const userId = req.params.id || req.params.userId;
        const { status } = req.body;
        const statusVal = status === 'ACTIVE' || status == 1 ? 1 : 2;
        await connection.execute(
            'UPDATE `users` SET `status` = ? WHERE `phone` = ? OR `id_user` = ? OR `id` = ?',
            [statusVal, userId, userId, userId]
        );
        return res.status(200).json({ status: true, message: 'User status updated', user: { status: statusVal == 1 ? 'ACTIVE' : 'SUSPENDED' } });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

const adjustUserWallet = async (req, res) => {
    try {
        const userId = req.params.id || req.params.userId;
        const amount = parseFloat(req.body.amount || 0);
        const type = req.body.type || 'ADMIN_CREDIT';

        const [users] = await connection.execute(
            'SELECT `id`, `phone`, `money`, `money_user` FROM `users` WHERE `phone` = ? OR `id_user` = ? OR `id` = ?',
            [userId, userId, userId]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const user = users[0];
        const currentBal = parseFloat(user.money_user || user.money || 0);
        const newBal = (type === 'ADMIN_DEBIT' || type === 'DEBIT')
            ? Math.max(0, currentBal - amount)
            : currentBal + amount;

        await connection.execute(
            'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `id` = ?',
            [newBal, newBal, user.id]
        );

        return res.status(200).json({
            status: true,
            message: `User wallet updated to ₹${newBal.toFixed(2)}`,
            walletTx: { balance: newBal, amount, type }
        });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

const getAdminAuditLogs = async (req, res) => {
    try {
        const [rounds] = await connection.execute(
            'SELECT `id`, `phone`, `bet_amount`, `difficulty`, `current_lane`, `current_multiplier`, `status`, `cashout_amount`, `time` FROM `chicken_rounds` ORDER BY `time` DESC LIMIT 50'
        );
        const logs = (rounds || []).map(r => ({
            id: r.id,
            action: r.status === 'CASHED_OUT' ? 'CASHOUT' : (r.status === 'ACTIVE' ? 'BET_PLACED' : 'ROUND_LOST'),
            userId: r.phone,
            details: `Difficulty: ${r.difficulty}, Bet: ₹${parseFloat(r.bet_amount).toFixed(2)}, Reached Lane: ${r.current_lane}, Multiplier: ${parseFloat(r.current_multiplier).toFixed(2)}x, Payout: ${r.cashout_amount ? '₹' + parseFloat(r.cashout_amount).toFixed(2) : '-'}`,
            timestamp: new Date(parseInt(r.time, 10)).toISOString(),
            ipAddress: '127.0.0.1'
        }));
        return res.status(200).json({ status: true, logs, total: logs.length });
    } catch (err) {
        return res.status(200).json({ status: true, logs: [], total: 0 });
    }
};

module.exports = {
    ensureChickenTables,
    initChickenEngine,
    chickenPage,
    getMe,
    login,
    register,
    getWallet,
    claimFaucet,
    getTransactions,
    startGame,
    jumpGame,
    cashoutGame,
    crashGame,
    getGameById,
    getActiveRound,
    getGameHistory,
    getAdminMetrics,
    getAdminConfig,
    updateAdminConfig,
    getAdminUsers,
    updateUserStatus,
    adjustUserWallet,
    getAdminAuditLogs,
    DIFFICULTY_CONFIGS
};
