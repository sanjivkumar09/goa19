const connection = require("./src/config/connectDB.js");

async function resetPredictions() {
    try {
        console.log("Resetting prediction sequences to enable random predictions...");
        
        // Set all wingo prediction columns to -1 (random mode)
        await connection.execute(
            `UPDATE admin SET wingo1 = ?, wingo3 = ?, wingo5 = ?, wingo10 = ?`,
            ['-1', '-1', '-1', '-1']
        );
        
        console.log("✅ Successfully reset all prediction sequences to -1 (random mode)");
        console.log("The 1min, 3min, 5min, and 10min Wingo games will now generate random predictions.");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error resetting predictions:", error);
        process.exit(1);
    }
}

resetPredictions();
