const crypto = require('crypto');
const connection = require('../config/connectDB.js');
require('dotenv').config();

let ioInstance = null;

// Mathematical Combination Multiplier calculation
function calculateMultiplier(totalTiles, mineCount, picksCount, houseEdge = 0.05) {
    if (picksCount <= 0) return 1.0;
    const safeTiles = totalTiles - mineCount;
    if (picksCount > safeTiles) picksCount = safeTiles;

    let probability = 1.0;
    for (let i = 0; i < picksCount; i++) {
        probability *= (safeTiles - i) / (totalTiles - i);
    }

    if (probability <= 0) return 1.0;
    const fairMultiplier = 1.0 / probability;
    const finalMultiplier = fairMultiplier * (1.0 - houseEdge);
    return Math.max(1.0, Math.floor(finalMultiplier * 100) / 100);
}

function calculatePayout(betAmount, multiplier) {
    return Math.floor(betAmount * multiplier * 100) / 100;
}

// Generate N unique cryptographically random mine positions
function generateMines(totalTiles, count) {
    const positions = new Set();
    while (positions.size < count) {
        const rand = crypto.randomInt(0, totalTiles);
        positions.add(rand);
    }
    return Array.from(positions).sort((a, b) => a - b);
}

// Auto ensure database tables exist on server start
const ensureMinesTables = async () => {
    try {
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

        const timeNow = Date.now();
        await connection.execute(`INSERT IGNORE INTO \`admin_settings\` (\`setting_key\`, \`setting_value\`, \`updated_at\`) VALUES
          ('mines_min_bet', '10', ${timeNow}),
          ('mines_max_bet', '50000', ${timeNow}),
          ('mines_house_edge', '0.05', ${timeNow}),
          ('mines_maintenance_mode', '0', ${timeNow}),
          ('mines_emergency_stop', '0', ${timeNow}),
          ('mines_max_multiplier', '10000', ${timeNow});`);

        console.log('💎 Mines Database verified and ready.');
    } catch (err) {
        console.error('Error ensuring mines tables:', err.message);
    }
};

// Initialize Game Engine
const initMinesEngine = async (io) => {
    ioInstance = io;
    console.log('💎 Initializing Mines Game Engine...');
    await ensureMinesTables();

    if (io) {
        io.on('connection', (socket) => {
            socket.on('mines:join', () => {
                socket.emit('mines:joined', { status: true });
            });
        });
    }
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

// Helper: Read Game Config from admin_settings
const getSettings = async () => {
    const defaultSettings = {
        boardRows: 5,
        boardColumns: 5,
        defaultMineCount: 5,
        minMineCount: 1,
        maxMineCount: 24,
        minBet: 10,
        maxBet: 50000,
        houseEdge: 0.05,
        maxAllowedMultiplier: 10000.0,
        maxPayoutPerGame: 1000000.0,
        emergencyStop: false,
        maintenanceMode: false,
    };

    try {
        const [rows] = await connection.execute(
            'SELECT `setting_key`, `setting_value` FROM `admin_settings` WHERE `setting_key` LIKE "mines_%"'
        );

        if (rows && rows.length > 0) {
            rows.forEach((row) => {
                if (row.setting_key === 'mines_min_bet') defaultSettings.minBet = parseFloat(row.setting_value) || 10;
                if (row.setting_key === 'mines_max_bet') defaultSettings.maxBet = parseFloat(row.setting_value) || 50000;
                if (row.setting_key === 'mines_house_edge') defaultSettings.houseEdge = parseFloat(row.setting_value) || 0.05;
                if (row.setting_key === 'mines_maintenance_mode') defaultSettings.maintenanceMode = row.setting_value === '1';
                if (row.setting_key === 'mines_emergency_stop') defaultSettings.emergencyStop = row.setting_value === '1';
                if (row.setting_key === 'mines_max_multiplier') defaultSettings.maxAllowedMultiplier = parseFloat(row.setting_value) || 10000;
            });
        }
    } catch (err) {
        console.error('getSettings error:', err.message);
    }

    return defaultSettings;
};

// View Page Handler
const minesPage = async (req, res) => {
    return res.render('bet/mines/mines.ejs');
};

// API: Live User Wallet Balance from MySQL
const getWallet = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Authentication required. Please log in to DIU-win.'
            });
        }

        const [freshUsers] = await connection.execute(
            'SELECT `id_user`, `phone`, `name_user`, `money`, `money_user` FROM `users` WHERE `phone` = ?',
            [user.phone]
        );
        const freshUser = (freshUsers && freshUsers.length > 0) ? freshUsers[0] : user;
        const rawBal = (freshUser.money_user !== null && freshUser.money_user !== undefined) ? freshUser.money_user : freshUser.money;
        const balance = parseFloat(rawBal || 0);

        return res.status(200).json({
            wallet: {
                id: String(freshUser.id_user || freshUser.phone),
                userId: String(freshUser.id_user || freshUser.phone),
                username: freshUser.name_user || freshUser.phone,
                balance,
                currency: 'INR'
            }
        });
    } catch (err) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Refresh Real Wallet Balance
const resetWallet = async (req, res) => {
    return await getWallet(req, res);
};

// API: Game Config
const getGameConfig = async (req, res) => {
    try {
        const config = await getSettings();
        return res.status(200).json({ config });
    } catch (err) {
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Start Game
const startGame = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Please log in to play MINES.' });
        }

        const config = await getSettings();
        if (config.maintenanceMode) {
            return res.status(503).json({ error: 'MAINTENANCE_MODE', message: 'Mines game is currently under maintenance.' });
        }
        if (config.emergencyStop) {
            return res.status(503).json({ error: 'EMERGENCY_STOP', message: 'New game rounds are temporarily suspended.' });
        }

        const betAmount = parseFloat(req.body.betAmount);
        const mineCount = parseInt(req.body.mineCount, 10);

        if (isNaN(betAmount) || betAmount < config.minBet || betAmount > config.maxBet) {
            return res.status(400).json({
                error: 'INVALID_BET',
                message: `Bet amount must be between ₹${config.minBet} and ₹${config.maxBet}.`
            });
        }

        const totalTiles = config.boardRows * config.boardColumns;
        if (isNaN(mineCount) || mineCount < config.minMineCount || mineCount > config.maxMineCount || mineCount >= totalTiles) {
            return res.status(400).json({
                error: 'INVALID_MINES',
                message: `Mine count must be between ${config.minMineCount} and ${config.maxMineCount}.`
            });
        }

        // Check for active PLAYING round
        const [activeRounds] = await connection.execute(
            'SELECT * FROM `mines_rounds` WHERE `phone` = ? AND `status` = "PLAYING" LIMIT 1',
            [user.phone]
        );

        if (activeRounds && activeRounds.length > 0) {
            const active = activeRounds[0];
            const selectedTiles = JSON.parse(active.selected_tiles || '[]');
            const nextMult = calculateMultiplier(totalTiles, active.mine_count, selectedTiles.length + 1, active.house_edge);
            
            const [freshUsers] = await connection.execute('SELECT `money`, `money_user` FROM `users` WHERE `phone` = ?', [user.phone]);
            const curBal = freshUsers && freshUsers.length > 0 ? parseFloat(freshUsers[0].money_user !== null ? freshUsers[0].money_user : freshUsers[0].money) : 0;

            return res.status(200).json({
                round: {
                    id: active.id,
                    createdAt: active.time,
                    betAmount: parseFloat(active.bet_amount),
                    mineCount: active.mine_count,
                    boardRows: active.board_rows,
                    boardColumns: active.board_cols,
                    selectedTiles,
                    multiplier: parseFloat(active.multiplier),
                    nextMultiplier: nextMult,
                    status: 'PLAYING',
                    payout: 0.0
                },
                walletBalance: curBal
            });
        }

        // Check user balance directly from MySQL users table
        const [freshUsers] = await connection.execute(
            'SELECT `id_user`, `phone`, `money`, `money_user` FROM `users` WHERE `phone` = ?',
            [user.phone]
        );
        const freshUser = (freshUsers && freshUsers.length > 0) ? freshUsers[0] : user;
        const currentBal = parseFloat(freshUser.money_user !== null && freshUser.money_user !== undefined ? freshUser.money_user : freshUser.money) || 0;

        if (currentBal < betAmount) {
            return res.status(400).json({
                error: 'INSUFFICIENT_BALANCE',
                message: `Insufficient balance. Current balance is ₹${currentBal.toFixed(2)}. Please recharge your wallet.`
            });
        }

        // Deduct bet atomically from MySQL users table
        const newBal = currentBal - betAmount;
        await connection.execute(
            'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
            [newBal, newBal, user.phone]
        );

        // Generate cryptographically secure mine positions
        const minePositions = generateMines(totalTiles, mineCount);
        const serverSeed = crypto.randomBytes(32).toString('hex');
        const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
        const roundId = 'MN_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
        const timeNow = Date.now().toString();

        await connection.execute(
            'INSERT INTO `mines_rounds` (`id`, `phone`, `bet_amount`, `mine_count`, `board_rows`, `board_cols`, `mine_positions`, `selected_tiles`, `house_edge`, `multiplier`, `status`, `payout`, `server_seed`, `server_seed_hash`, `time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1.00, "PLAYING", 0.00, ?, ?, ?)',
            [
                roundId,
                user.phone,
                betAmount,
                mineCount,
                config.boardRows,
                config.boardColumns,
                JSON.stringify(minePositions),
                JSON.stringify([]),
                config.houseEdge,
                serverSeed,
                serverSeedHash,
                timeNow
            ]
        );

        if (ioInstance) {
            ioInstance.emit('mines:live_bet', {
                roundId,
                username: (user.name_user || user.phone).slice(0, 4) + '****',
                betAmount,
                mineCount,
                time: timeNow
            });
        }

        const nextMult = calculateMultiplier(totalTiles, mineCount, 1, config.houseEdge);

        return res.status(200).json({
            round: {
                id: roundId,
                createdAt: timeNow,
                betAmount,
                mineCount,
                boardRows: config.boardRows,
                boardColumns: config.boardColumns,
                selectedTiles: [],
                multiplier: 1.00,
                nextMultiplier: nextMult,
                status: 'PLAYING',
                payout: 0.0
            },
            walletBalance: newBal
        });
    } catch (err) {
        console.error('startGame error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Select Tile
const selectTile = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
        }

        const roundId = req.body.roundId;
        const tileIndex = parseInt(req.body.tileIndex, 10);

        if (!roundId || isNaN(tileIndex)) {
            return res.status(400).json({ error: 'INVALID_INPUT', message: 'Invalid round ID or tile index.' });
        }

        const [rounds] = await connection.execute(
            'SELECT * FROM `mines_rounds` WHERE `id` = ? AND `phone` = ? LIMIT 1',
            [roundId, user.phone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Game round not found.' });
        }

        const round = rounds[0];
        if (round.status !== 'PLAYING') {
            return res.status(400).json({ error: 'ROUND_NOT_ACTIVE', message: `Round is already ${round.status}.` });
        }

        const totalTiles = round.board_rows * round.board_cols;
        if (tileIndex < 0 || tileIndex >= totalTiles) {
            return res.status(400).json({ error: 'OUT_OF_BOUNDS', message: 'Tile index out of bounds.' });
        }

        const selectedTiles = JSON.parse(round.selected_tiles || '[]');
        if (selectedTiles.includes(tileIndex)) {
            return res.status(400).json({ error: 'ALREADY_SELECTED', message: 'Tile already revealed.' });
        }

        const minePositions = JSON.parse(round.mine_positions || '[]');
        const isMine = minePositions.includes(tileIndex);
        const timeNow = Date.now().toString();

        if (isMine) {
            // Player hit a mine! Game LOST
            await connection.execute(
                'UPDATE `mines_rounds` SET `status` = "LOST", `ended_at` = ? WHERE `id` = ?',
                [timeNow, roundId]
            );

            const [freshUsers] = await connection.execute('SELECT `money`, `money_user` FROM `users` WHERE `phone` = ?', [user.phone]);
            const curBal = freshUsers && freshUsers.length > 0 ? parseFloat(freshUsers[0].money_user !== null ? freshUsers[0].money_user : freshUsers[0].money) : 0;

            return res.status(200).json({
                round: {
                    id: round.id,
                    createdAt: round.time,
                    completedAt: timeNow,
                    betAmount: parseFloat(round.bet_amount),
                    mineCount: round.mine_count,
                    boardRows: round.board_rows,
                    boardColumns: round.board_cols,
                    selectedTiles: [...selectedTiles, tileIndex],
                    multiplier: parseFloat(round.multiplier),
                    status: 'LOST',
                    payout: 0.0,
                    minePositions
                },
                walletBalance: curBal,
                hitMine: true,
                revealedTile: 'MINE'
            });
        } else {
            // Player uncovered a safe GEM!
            const newSelected = [...selectedTiles, tileIndex];
            const picksCount = newSelected.length;
            const houseEdge = parseFloat(round.house_edge) || 0.05;
            const newMultiplier = calculateMultiplier(totalTiles, round.mine_count, picksCount, houseEdge);
            const safeTilesCount = totalTiles - round.mine_count;

            let newStatus = 'PLAYING';
            let payout = 0.0;
            let endedAt = null;

            // Fetch current balance from MySQL
            const [freshUsers] = await connection.execute(
                'SELECT `money`, `money_user` FROM `users` WHERE `phone` = ?',
                [user.phone]
            );
            let userBalance = freshUsers && freshUsers.length > 0 ? parseFloat(freshUsers[0].money_user !== null ? freshUsers[0].money_user : freshUsers[0].money) : 0;

            if (picksCount === safeTilesCount) {
                // All gems found! Instant WIN
                newStatus = 'WON';
                payout = calculatePayout(parseFloat(round.bet_amount), newMultiplier);
                endedAt = timeNow;

                // Credit payout directly to user balance in MySQL
                userBalance += payout;
                await connection.execute(
                    'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
                    [userBalance, userBalance, user.phone]
                );
            }

            await connection.execute(
                'UPDATE `mines_rounds` SET `selected_tiles` = ?, `multiplier` = ?, `status` = ?, `payout` = ?, `ended_at` = ? WHERE `id` = ?',
                [JSON.stringify(newSelected), newMultiplier, newStatus, payout, endedAt, roundId]
            );

            const nextMult = picksCount < safeTilesCount
                ? calculateMultiplier(totalTiles, round.mine_count, picksCount + 1, houseEdge)
                : newMultiplier;

            return res.status(200).json({
                round: {
                    id: round.id,
                    createdAt: round.time,
                    completedAt: endedAt,
                    betAmount: parseFloat(round.bet_amount),
                    mineCount: round.mine_count,
                    boardRows: round.board_rows,
                    boardColumns: round.board_cols,
                    selectedTiles: newSelected,
                    multiplier: newMultiplier,
                    nextMultiplier: nextMult,
                    status: newStatus,
                    payout,
                    ...(newStatus === 'WON' ? { minePositions } : {})
                },
                walletBalance: userBalance,
                hitMine: false,
                revealedTile: 'GEM'
            });
        }
    } catch (err) {
        console.error('selectTile error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Cash Out
const cashout = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
        }

        const roundId = req.body.roundId;
        if (!roundId) {
            return res.status(400).json({ error: 'INVALID_INPUT', message: 'Round ID is required.' });
        }

        const [rounds] = await connection.execute(
            'SELECT * FROM `mines_rounds` WHERE `id` = ? AND `phone` = ? LIMIT 1',
            [roundId, user.phone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Game round not found.' });
        }

        const round = rounds[0];
        if (round.status !== 'PLAYING') {
            return res.status(400).json({ error: 'ROUND_NOT_ACTIVE', message: `Round is already ${round.status}.` });
        }

        const selectedTiles = JSON.parse(round.selected_tiles || '[]');
        if (selectedTiles.length === 0) {
            return res.status(400).json({ error: 'MIN_PICKS_REQUIRED', message: 'Must reveal at least one safe gem before cashing out.' });
        }

        const betAmount = parseFloat(round.bet_amount);
        const multiplier = parseFloat(round.multiplier);
        const payout = calculatePayout(betAmount, multiplier);
        const timeNow = Date.now().toString();

        // Credit winnings to user balance in MySQL
        const [freshUsers] = await connection.execute(
            'SELECT `money`, `money_user` FROM `users` WHERE `phone` = ?',
            [user.phone]
        );
        let userBalance = freshUsers && freshUsers.length > 0 ? parseFloat(freshUsers[0].money_user !== null ? freshUsers[0].money_user : freshUsers[0].money) : 0;
        userBalance += payout;

        await connection.execute(
            'UPDATE `users` SET `money` = ?, `money_user` = ? WHERE `phone` = ?',
            [userBalance, userBalance, user.phone]
        );

        const minePositions = JSON.parse(round.mine_positions || '[]');
        await connection.execute(
            'UPDATE `mines_rounds` SET `status` = "CASHED_OUT", `payout` = ?, `ended_at` = ? WHERE `id` = ?',
            [payout, timeNow, roundId]
        );

        return res.status(200).json({
            round: {
                id: round.id,
                createdAt: round.time,
                completedAt: timeNow,
                betAmount,
                mineCount: round.mine_count,
                boardRows: round.board_rows,
                boardColumns: round.board_cols,
                selectedTiles,
                multiplier,
                status: 'CASHED_OUT',
                payout,
                minePositions
            },
            walletBalance: userBalance
        });
    } catch (err) {
        console.error('cashout error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Active Round (Page Reload Recovery)
const getActiveRound = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(200).json({ round: null });
        }

        const [rounds] = await connection.execute(
            'SELECT * FROM `mines_rounds` WHERE `phone` = ? AND `status` = "PLAYING" ORDER BY `time` DESC LIMIT 1',
            [user.phone]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(200).json({ round: null });
        }

        const round = rounds[0];
        const selectedTiles = JSON.parse(round.selected_tiles || '[]');
        const totalTiles = round.board_rows * round.board_cols;
        const nextMult = selectedTiles.length < totalTiles - round.mine_count
            ? calculateMultiplier(totalTiles, round.mine_count, selectedTiles.length + 1, parseFloat(round.house_edge) || 0.05)
            : parseFloat(round.multiplier);

        return res.status(200).json({
            round: {
                id: round.id,
                createdAt: round.time,
                betAmount: parseFloat(round.bet_amount),
                mineCount: round.mine_count,
                boardRows: round.board_rows,
                boardColumns: round.board_cols,
                selectedTiles,
                multiplier: parseFloat(round.multiplier),
                nextMultiplier: nextMult,
                status: 'PLAYING',
                payout: 0.0
            }
        });
    } catch (err) {
        console.error('getActiveRound error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: User Game History from MySQL
const getGameHistory = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        const limit = parseInt(req.query.limit, 10) || 20;

        let query = 'SELECT * FROM `mines_rounds` WHERE `status` IN ("WON", "LOST", "CASHED_OUT")';
        const params = [];

        if (user) {
            query += ' AND `phone` = ?';
            params.push(user.phone);
        }

        query += ' ORDER BY `time` DESC LIMIT ?';
        params.push(String(limit));

        const [rounds] = await connection.execute(query, params);

        const history = (rounds || []).map((r) => ({
            id: r.id,
            createdAt: r.time,
            completedAt: r.ended_at,
            betAmount: parseFloat(r.bet_amount),
            mineCount: r.mine_count,
            boardRows: r.board_rows,
            boardColumns: r.board_cols,
            selectedTiles: JSON.parse(r.selected_tiles || '[]'),
            multiplier: parseFloat(r.multiplier),
            status: r.status,
            payout: parseFloat(r.payout),
            minePositions: JSON.parse(r.mine_positions || '[]')
        }));

        return res.status(200).json({ history });
    } catch (err) {
        console.error('getGameHistory error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Round Details by ID
const getRoundById = async (req, res) => {
    try {
        const roundId = req.params.id;
        const [rounds] = await connection.execute(
            'SELECT * FROM `mines_rounds` WHERE `id` = ? LIMIT 1',
            [roundId]
        );

        if (!rounds || rounds.length === 0) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Round not found.' });
        }

        const r = rounds[0];
        return res.status(200).json({
            round: {
                id: r.id,
                createdAt: r.time,
                completedAt: r.ended_at,
                betAmount: parseFloat(r.bet_amount),
                mineCount: r.mine_count,
                boardRows: r.board_rows,
                boardColumns: r.board_cols,
                selectedTiles: JSON.parse(r.selected_tiles || '[]'),
                multiplier: parseFloat(r.multiplier),
                status: r.status,
                payout: parseFloat(r.payout),
                minePositions: r.status !== 'PLAYING' ? JSON.parse(r.mine_positions || '[]') : undefined
            }
        });
    } catch (err) {
        console.error('getRoundById error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Admin Metrics & Statistics from MySQL
const getAdminMetrics = async (req, res) => {
    try {
        const [statsRows] = await connection.execute(`
            SELECT 
                COUNT(*) as total_rounds,
                COALESCE(SUM(bet_amount), 0) as total_wagered,
                COALESCE(SUM(payout), 0) as total_payouts,
                COALESCE(SUM(CASE WHEN status = 'LOST' THEN 1 ELSE 0 END), 0) as total_mine_hits,
                COALESCE(SUM(CASE WHEN status IN ('WON', 'CASHED_OUT') THEN 1 ELSE 0 END), 0) as total_cashouts
            FROM \`mines_rounds\`
        `);

        const [recentRounds] = await connection.execute(`
            SELECT * FROM \`mines_rounds\` ORDER BY \`time\` DESC LIMIT 50
        `);

        const stats = statsRows[0] || {};
        const totalWagered = parseFloat(stats.total_wagered || 0);
        const totalPayouts = parseFloat(stats.total_payouts || 0);
        const houseProfit = totalWagered - totalPayouts;
        const rtp = totalWagered > 0 ? ((totalPayouts / totalWagered) * 100).toFixed(2) : '0.00';

        const config = await getSettings();

        return res.status(200).json({
            stats: {
                totalGames: parseInt(stats.total_rounds || 0, 10),
                totalBets: totalWagered,
                totalPayouts: totalPayouts,
                houseProfit: houseProfit,
                rtpPercentage: parseFloat(rtp),
                totalMineHits: parseInt(stats.total_mine_hits || 0, 10),
                totalCashOuts: parseInt(stats.total_cashouts || 0, 10),
            },
            config,
            recentRounds: (recentRounds || []).map(r => ({
                id: r.id,
                phone: r.phone,
                betAmount: parseFloat(r.bet_amount),
                mineCount: r.mine_count,
                multiplier: parseFloat(r.multiplier),
                payout: parseFloat(r.payout),
                status: r.status,
                selectedCount: JSON.parse(r.selected_tiles || '[]').length,
                time: r.time
            }))
        });
    } catch (err) {
        console.error('getAdminMetrics error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

// API: Update Admin Settings
const updateAdminConfig = async (req, res) => {
    try {
        const { minBet, maxBet, houseEdge, maintenanceMode, emergencyStop, maxMultiplier } = req.body;
        const timeNow = Date.now();

        if (minBet !== undefined) {
            await connection.execute('REPLACE INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("mines_min_bet", ?, ?)', [String(minBet), timeNow]);
        }
        if (maxBet !== undefined) {
            await connection.execute('REPLACE INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("mines_max_bet", ?, ?)', [String(maxBet), timeNow]);
        }
        if (houseEdge !== undefined) {
            await connection.execute('REPLACE INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("mines_house_edge", ?, ?)', [String(houseEdge), timeNow]);
        }
        if (maintenanceMode !== undefined) {
            await connection.execute('REPLACE INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("mines_maintenance_mode", ?, ?)', [maintenanceMode ? '1' : '0', timeNow]);
        }
        if (emergencyStop !== undefined) {
            await connection.execute('REPLACE INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("mines_emergency_stop", ?, ?)', [emergencyStop ? '1' : '0', timeNow]);
        }
        if (maxMultiplier !== undefined) {
            await connection.execute('REPLACE INTO `admin_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES ("mines_max_multiplier", ?, ?)', [String(maxMultiplier), timeNow]);
        }

        const updatedConfig = await getSettings();
        return res.status(200).json({ config: updatedConfig, message: 'Settings updated successfully.' });
    } catch (err) {
        console.error('updateAdminConfig error:', err);
        return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
};

module.exports = {
    ensureMinesTables,
    initMinesEngine,
    minesPage,
    getWallet,
    resetWallet,
    getGameConfig,
    startGame,
    selectTile,
    cashout,
    getActiveRound,
    getGameHistory,
    getRoundById,
    getAdminMetrics,
    updateAdminConfig,
};
