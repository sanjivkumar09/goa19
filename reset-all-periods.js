const connection = require("./src/config/connectDB.js");

async function resetAllPeriods() {
    try {
        console.log("╔═══════════════════════════════════════════════╗");
        console.log("║   🔧 RESETTING ALL GAME PERIODS              ║");
        console.log("╚═══════════════════════════════════════════════╝");
        console.log("");

        const timeNow = Date.now();
        let date = new Date();
        let years = date.getFullYear();
        let months = String(date.getMonth() + 1).padStart(2, '0');
        let days = String(date.getDate()).padStart(2, '0');
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        let currentPeriod = `${years}${months}${days}${hours}${minutes}001`;

        console.log(`📅 Current Date/Time: ${years}-${months}-${days} ${hours}:${minutes}`);
        console.log(`🎮 New Period Format: ${currentPeriod}`);
        console.log("");

        // Reset WinGo games
        console.log("🎰 Resetting WinGo Games...");
        const wingoGames = ['wingo', 'wingo3', 'wingo5', 'wingo10'];
        for (const gameName of wingoGames) {
            await connection.execute('DELETE FROM wingo WHERE game = ?', [gameName]);
            await connection.execute(
                'INSERT INTO wingo (period, amount, game, status, time) VALUES (?, ?, ?, ?, ?)',
                [currentPeriod, 0, gameName, 0, timeNow]
            );
            console.log(`  ✓ Reset ${gameName}`);
        }
        console.log("");

        // Reset K3 games
        console.log("🎲 Resetting K3 Games...");
        const k3Games = [1, 3, 5, 10];
        for (const game of k3Games) {
            await connection.execute('DELETE FROM k3 WHERE game = ?', [game]);
            await connection.execute(
                'INSERT INTO k3 (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)',
                [currentPeriod, 0, game, 0, timeNow]
            );
            console.log(`  ✓ Reset K3 game ${game}`);
        }
        console.log("");

        // Reset 5D games
        console.log("🎯 Resetting 5D Games...");
        const d5Games = [1, 3, 5, 10];
        for (const game of d5Games) {
            await connection.execute('DELETE FROM 5d WHERE game = ?', [game]);
            await connection.execute(
                'INSERT INTO 5d (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)',
                [currentPeriod, '00000', game, 0, timeNow]
            );
            console.log(`  ✓ Reset 5D game ${game}`);
        }
        console.log("");

        console.log("╔═══════════════════════════════════════════════╗");
        console.log("║   ✅ ALL PERIODS RESET SUCCESSFULLY!         ║");
        console.log("╚═══════════════════════════════════════════════╝");
        console.log("");
        console.log(`📋 Summary:`);
        console.log(`  ✓ WinGo: 4 games reset (wingo, wingo3, wingo5, wingo10)`);
        console.log(`  ✓ K3: 4 games reset (1min, 3min, 5min, 10min)`);
        console.log(`  ✓ 5D: 4 games reset (1min, 3min, 5min, 10min)`);
        console.log(`  ✓ All periods now: ${currentPeriod}`);
        console.log("");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error resetting periods:", error.message);
        console.error(error);
        process.exit(1);
    }
}

resetAllPeriods();
