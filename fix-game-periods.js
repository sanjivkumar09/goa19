#!/usr/bin/env node

/**
 * Fix Game Periods - Reset K3 and 5D games with current dates
 * This script will delete old periods and create new ones with current timestamps
 */

const connection = require('./src/config/connectDB.js');

async function fixGamePeriods() {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   🔧 FIXING GAME PERIODS (K3 & 5D)           ║');
    console.log('╚═══════════════════════════════════════════════╝\n');

    try {
        const timeNow = Date.now();
        
        // Generate current period (Format: YYYYMMDDHHmmS)
        let date = new Date();
        let years = date.getFullYear();
        let months = String(date.getMonth() + 1).padStart(2, '0');
        let days = String(date.getDate()).padStart(2, '0');
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        let currentPeriod = `${years}${months}${days}${hours}${minutes}001`;
        
        console.log(`📅 Current Date/Time: ${years}-${months}-${days} ${hours}:${minutes}`);
        console.log(`🎮 New Period Format: ${currentPeriod}\n`);

        // Fix K3 Games
        console.log('🎲 Fixing K3 Games...');
        for (let game of [1, 3, 5, 10]) {
            // Delete old periods
            await connection.execute('DELETE FROM k3 WHERE game = ?', [game]);
            console.log(`  ✓ Cleared old K3 game ${game} periods`);
            
            // Insert new period with current date
            await connection.execute(
                'INSERT INTO k3 (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)',
                [currentPeriod, 0, game, 0, timeNow]
            );
            console.log(`  ✓ Created new K3 game ${game} period: ${currentPeriod}`);
        }

        console.log('\n🎯 Fixing 5D Games...');
        for (let game of [1, 3, 5, 10]) {
            // Delete old periods
            await connection.execute('DELETE FROM 5d WHERE game = ?', [game]);
            console.log(`  ✓ Cleared old 5D game ${game} periods`);
            
            // Insert new period with current date
            await connection.execute(
                'INSERT INTO 5d (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)',
                [currentPeriod, '00000', game, 0, timeNow]
            );
            console.log(`  ✓ Created new 5D game ${game} period: ${currentPeriod}`);
        }

        console.log('\n╔═══════════════════════════════════════════════╗');
        console.log('║   ✅ GAME PERIODS FIXED SUCCESSFULLY!        ║');
        console.log('╚═══════════════════════════════════════════════╝\n');

        console.log('📋 Summary:');
        console.log('  ✓ K3 Games (1min, 3min, 5min, 10min) - Reset');
        console.log('  ✓ 5D Games (1min, 3min, 5min, 10min) - Reset');
        console.log(`  ✓ All periods now use current date: ${years}-${months}-${days}\n`);

        console.log('🚀 Next Steps:');
        console.log('  1. Restart your server: npm start');
        console.log('  2. Refresh admin pages (Ctrl + F5)');
        console.log('  3. Games should now work with current dates!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error fixing game periods:', error);
        process.exit(1);
    }
}

// Run the fix
fixGamePeriods();
