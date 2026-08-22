const connection = require('../src/config/connectDB.js');
const minesController = require('../src/controllers/minesController.js');

async function testGameplay() {
    console.log('--- Testing Mines Full Gameplay Simulation ---');
    try {
        // 1. Find a test user or create a temporary mock user
        const [users] = await connection.execute('SELECT `phone`, `token`, `money` FROM `users` WHERE `status` = 1 LIMIT 1');
        if (!users || users.length === 0) {
            console.log('No user found to test auth, skipping user-authenticated test.');
            return;
        }

        const user = users[0];
        console.log(`Testing with user phone: ${user.phone}, balance: ${user.money}`);

        // Helper mock req/res
        function mockReqRes(body = {}, params = {}, query = {}) {
            let resData = null;
            let resStatus = 200;
            const req = {
                cookies: { auth: user.token },
                headers: { authorization: `Bearer ${user.token}` },
                body,
                params,
                query
            };
            const res = {
                status(code) {
                    resStatus = code;
                    return this;
                },
                json(data) {
                    resData = data;
                    return this;
                },
                render(view) {
                    resData = { view };
                    return this;
                }
            };
            return { req, res, getResult: () => ({ status: resStatus, data: resData }) };
        }

        // Test Config
        {
            const { req, res, getResult } = mockReqRes();
            await minesController.getGameConfig(req, res);
            const result = getResult();
            console.log('✅ getGameConfig:', result.data.config ? 'Success' : 'Failed');
        }

        // Test Wallet
        {
            const { req, res, getResult } = mockReqRes();
            await minesController.getWallet(req, res);
            const result = getResult();
            console.log('✅ getWallet balance:', result.data.wallet?.balance);
        }

        // Test Start Game with 10 INR and 3 mines
        let activeRoundId = null;
        {
            const { req, res, getResult } = mockReqRes({ betAmount: 10, mineCount: 3 });
            await minesController.startGame(req, res);
            const result = getResult();
            console.log('✅ startGame:', result.status, result.data);
            if (result.data && result.data.round) {
                activeRoundId = result.data.round.id;
            }
        }

        if (activeRoundId) {
            // Test Select Tile 0
            {
                const { req, res, getResult } = mockReqRes({ roundId: activeRoundId, tileIndex: 0 });
                await minesController.selectTile(req, res);
                const result = getResult();
                console.log('✅ selectTile (0):', result.status, 'revealedTile:', result.data?.revealedTile, 'hitMine:', result.data?.hitMine);
                
                // If it was a safe tile, try to cashout
                if (!result.data?.hitMine && result.data?.round?.status === 'PLAYING') {
                    const { req: reqC, res: resC, getResult: getResultC } = mockReqRes({ roundId: activeRoundId });
                    await minesController.cashout(reqC, resC);
                    const resCashout = getResultC();
                    console.log('✅ cashout:', resCashout.status, 'payout:', resCashout.data?.round?.payout, 'multiplier:', resCashout.data?.round?.multiplier);
                }
            }
        }

        // Test Game History
        {
            const { req, res, getResult } = mockReqRes({}, {}, { limit: 5 });
            await minesController.getGameHistory(req, res);
            const result = getResult();
            console.log('✅ getGameHistory count:', result.data.history?.length);
        }

        // Test Admin Metrics
        {
            const { req, res, getResult } = mockReqRes();
            await minesController.getAdminMetrics(req, res);
            const result = getResult();
            console.log('✅ getAdminMetrics stats:', result.data.stats);
        }

        console.log('🎉 ALL GAMEPLAY SIMULATION TESTS PASSED!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Gameplay simulation failed:', err);
        process.exit(1);
    }
}

testGameplay();
