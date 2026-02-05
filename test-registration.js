const connection = require("./src/config/connectDB.js");
const md5 = require('md5');

async function testRegistration() {
    try {
        console.log("Testing registration process...\n");
        
        const testPhone = "9999999999";
        const testPassword = "test123456";
        
        // 1. Check if phone already exists
        console.log("1. Checking if phone exists...");
        const [check_u] = await connection.query('SELECT * FROM users WHERE phone = ?', [testPhone]);
        if (check_u.length > 0) {
            console.log("   ✗ Phone already exists in database");
            console.log("   User:", check_u[0]);
        } else {
            console.log("   ✓ Phone is available");
        }
        
        // 2. Test data generation
        console.log("\n2. Testing data generation...");
        const randomString = (length) => {
            let result = '';
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };
        const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        const id_user = randomNumber(10000, 99999);
        const otp2 = randomNumber(100000, 999999);
        const name_user = "Member" + randomNumber(10000, 99999);
        const code = randomString(5) + randomNumber(10000, 99999);
        const time = Date.now();
        
        console.log("   id_user:", id_user);
        console.log("   name_user:", name_user);
        console.log("   code:", code);
        console.log("   password hash:", md5(testPassword));
        console.log("   time:", time);
        
        // 3. Test INSERT query
        console.log("\n3. Testing INSERT query...");
        const sql = `INSERT INTO users 
        (id_user,phone,name_user,password,money_user,code,invite,ctv,veri,otp,ip_address,status,time)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        
        try {
            await connection.execute(sql, [
                id_user, testPhone, name_user, md5(testPassword),
                0, code, '', '', 1, otp2, '127.0.0.1', 1, time
            ]);
            console.log("   ✓ User inserted successfully");
        } catch (err) {
            console.log("   ✗ Error inserting user:", err.message);
            console.log("   Error code:", err.code);
            return;
        }
        
        // 4. Test point_list INSERT
        console.log("\n4. Testing point_list INSERT...");
        try {
            await connection.execute('INSERT INTO point_list (phone, money) VALUES (?, ?)', [testPhone, 0]);
            console.log("   ✓ Point_list entry created successfully");
        } catch (err) {
            console.log("   ✗ Error inserting into point_list:", err.message);
            console.log("   (This is optional, not critical)");
        }
        
        // 5. Verify insertion
        console.log("\n5. Verifying insertion...");
        const [verify] = await connection.query('SELECT * FROM users WHERE phone = ?', [testPhone]);
        if (verify.length > 0) {
            console.log("   ✓ User successfully registered!");
            console.log("   User ID:", verify[0].id);
            console.log("   User code:", verify[0].code);
        } else {
            console.log("   ✗ User not found after insertion");
        }
        
        console.log("\n✓ Registration test complete!");
        process.exit(0);
        
    } catch (error) {
        console.error("✗ Test error:", error);
        process.exit(1);
    }
}

testRegistration();
