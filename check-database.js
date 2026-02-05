const connection = require("./src/config/connectDB.js");

async function checkDatabase() {
    try {
        console.log("Checking database structure...\n");
        
        // Check users table
        const [usersTable] = await connection.query("DESCRIBE users");
        console.log("✓ Users table structure:");
        console.log(usersTable.map(col => `  - ${col.Field}: ${col.Type}`).join('\n'));
        
        // Check point_list table
        try {
            const [pointListTable] = await connection.query("DESCRIBE point_list");
            console.log("\n✓ Point_list table structure:");
            console.log(pointListTable.map(col => `  - ${col.Field}: ${col.Type}`).join('\n'));
        } catch (err) {
            console.log("\n✗ Point_list table does NOT exist or there's an error");
            console.log("  Error:", err.message);
            console.log("\n  Creating point_list table...");
            
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS point_list (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    phone VARCHAR(20) UNIQUE,
                    money DECIMAL(10, 2) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("  ✓ point_list table created successfully!");
        }
        
        console.log("\n✓ Database check complete!");
        process.exit(0);
    } catch (error) {
        console.error("✗ Database check error:", error.message);
        process.exit(1);
    }
}

checkDatabase();
