================================================================================
    HOSTINGER UPLOAD INSTRUCTIONS FOR SKYNOXX.LIVE
================================================================================

📦 WHAT TO UPLOAD TO HOSTINGER
================================

Upload these files/folders to your Hostinger public_html directory:

✅ ESSENTIAL FILES (MUST UPLOAD):
---------------------------------
1. .env                    - Database credentials (CRITICAL!)
2. .gitignore              - Security settings
3. package.json            - Project dependencies
4. package-lock.json       - Dependency lock file
5. goa.sql                 - Database backup file
6. src/ (entire folder)    - All application code
   ├── config/
   ├── controllers/
   ├── modal/
   ├── public/
   ├── routes/
   ├── server.js
   └── views/

📋 DATABASE CREDENTIALS (Already configured in .env)
====================================================
Database Host:     localhost
Database Name:     u938578626_games
Database User:     u938578626_skynoxx
Database Password: 1*hz$Tk>

❌ DO NOT UPLOAD:
-----------------
- node_modules/           (will be installed on server automatically)
- .git/                   (version control, not needed)
- h/ folder               (already removed)
- temp files              (already removed)
- *.md files              (documentation only)

================================================================================

🚀 QUICK START STEPS:
=====================

STEP 1: Import Database (5 minutes)
------------------------------------
1. Go to: hpanel.hostinger.com
2. Navigate to: Websites → skynoxx.live → Databases → phpMyAdmin
3. Select database: u938578626_games
4. Click "Import" tab
5. Upload file: goa.sql
6. Click "Go" and wait for success message

STEP 2: Upload Files (10 minutes)
----------------------------------
Method A - File Manager (Easiest):
1. Go to: Websites → skynoxx.live → Files → File Manager
2. Open: public_html folder
3. Delete any existing files
4. Upload all files listed above (drag & drop or use Upload button)
5. Verify .env file is uploaded (it's hidden, check "Show hidden files")

Method B - FTP (For Large Projects):
1. Get FTP credentials from Hostinger
2. Use FileZilla or similar FTP client
3. Connect to your server
4. Navigate to: /public_html
5. Upload all files

STEP 3: Configure Node.js (5 minutes)
--------------------------------------
1. Go to: Websites → skynoxx.live → Advanced → Node.js
2. Set these values:
   - Application mode: Production
   - Application root: /public_html
   - Startup file: src/server.js
   - Node.js version: 18.x or 20.x (latest LTS)
3. Click "Create Application" or "Start"

STEP 4: Install Dependencies
-----------------------------
Hostinger will automatically run: npm install
(This happens when you start the Node.js application)

If manual installation needed via SSH:
cd public_html
npm install --production

STEP 5: Enable SSL Certificate (5 minutes)
-------------------------------------------
1. Go to: Websites → skynoxx.live → Security → SSL
2. Click "Enable" for free SSL
3. Wait 10-15 minutes for activation

STEP 6: Verify Website is Live
-------------------------------
Visit: https://skynoxx.live
- Homepage should load
- Games should work
- Login/Registration should function

================================================================================

⚠️ IMPORTANT SECURITY NOTES:
=============================

1. CHANGE JWT SECRET:
   After deployment, edit .env file on server and change:
   JWT_SECRET=your_jwt_secret_key_here_change_this_to_random_string
   
   To generate a strong secret, run on server via SSH:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

2. NEVER share your database password
3. NEVER commit .env file to GitHub/Git
4. Enable automatic backups in Hostinger

================================================================================

✅ SUCCESS CHECKLIST:
=====================
After deployment, verify:

□ Database imported (check phpMyAdmin for tables)
□ All files uploaded to public_html
□ .env file present on server
□ Node.js application running
□ Website loads at https://skynoxx.live
□ SSL certificate active (green padlock)
□ User registration works
□ User login works
□ Games are functional
□ Payment pages load

================================================================================

📞 NEED HELP?
=============

Hostinger Support: 24/7 Live Chat in control panel
Documentation: See HOSTING_SETUP.md and DEPLOYMENT_CHECKLIST.md

================================================================================

🎉 YOUR WEBSITE IS READY TO GO LIVE!
=====================================

Just follow the 6 steps above and your website will be running on:
https://skynoxx.live

Estimated total deployment time: 30-45 minutes

================================================================================
