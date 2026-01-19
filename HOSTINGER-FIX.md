# 🔧 HOSTINGER VPS FIX GUIDE

## ⚠️ CURRENT ISSUES DETECTED:

1. ✅ Server is running as `game-server` (not in `/var/www/goa19`)
2. ✅ Project is located in `/root/src/`
3. ⚠️ Running OLD code (before UI fixes)
4. ⚠️ Some code errors in `userController.js`

---

## 🚀 QUICK FIX - RUN THESE COMMANDS:

Copy and paste this entire block in your SSH terminal:

```bash
# Step 1: Find where your project is
cd /root
pwd
ls -la

# Step 2: Stop old server
pm2 stop all
pm2 delete all

# Step 3: Navigate to your project
cd /root/src
pwd

# Step 4: Check if it's a git repo
git status

# Step 5: If git exists, pull latest code
git pull origin main

# Step 6: If no git, we need to upload files differently
# (I'll help with this if needed)

# Step 7: Install dependencies
npm install

# Step 8: Fix permissions
chmod -R 755 public/

# Step 9: Start server with new name
pm2 start server.js --name goa-games
pm2 save

# Step 10: Check logs
pm2 logs goa-games --lines 30
```

---

## 📂 YOUR PROJECT LOCATION:

Based on your logs, your project is in:
- **Location:** `/root/src/`
- **Running as:** `game-server` (PM2 process)
- **Server file:** `/root/src/server.js`

---

## 🔄 IF YOU NEED TO UPDATE FILES:

### **Option A: Using Git (BEST)**

```bash
cd /root/src
git remote -v
# If git is set up:
git pull origin main
pm2 restart goa-games
```

### **Option B: Using FileZilla/FTP**

1. Connect via FTP to your VPS
2. Navigate to `/root/src/`
3. Upload ONLY these updated files:
   - `src/config/configEngine.js`
4. Then restart:
```bash
pm2 restart goa-games
```

### **Option C: Manual File Update**

```bash
# Edit the config file
nano /root/src/config/configEngine.js
```

Replace the content with this:

```javascript
const express = require('express');
const path = require('path');

const configViewEngine = (app) => {
    // Use absolute path for static files (works on all environments)
    app.use(express.static(path.join(__dirname, '../public')));
    app.set('view engine', "ejs");
    app.set('views', path.join(__dirname, '../views'));
}

module.exports = configViewEngine;
```

Save: `Ctrl+X`, then `Y`, then `Enter`

Then restart:
```bash
pm2 restart goa-games
```

---

## ✅ COMPLETE FIX SCRIPT:

Run this entire block:

```bash
# Stop all servers
pm2 stop all
pm2 delete all

# Navigate to project
cd /root/src

# Backup old config
cp config/configEngine.js config/configEngine.js.backup

# Update config file (Option C from above)
nano config/configEngine.js
# Paste the new code, save with Ctrl+X, Y, Enter

# Fix permissions
chmod -R 755 public/
chmod -R 755 views/

# Start server
pm2 start server.js --name goa-games --watch
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs goa-games --lines 50
```

---

## 🌐 ACCESS YOUR SITE:

After running the commands:
- **URL:** http://93.127.167.248:3000
- **Or:** http://your-domain.com

---

## 📊 CHECK IF IT'S WORKING:

```bash
# Check PM2 status
pm2 status

# Check if port 3000 is open
netstat -tulpn | grep 3000

# Test locally
curl http://localhost:3000

# Check logs
pm2 logs goa-games --lines 50
```

---

## 🚨 TROUBLESHOOTING:

### **Issue 1: Static files still not loading**

```bash
cd /root/src
ls -la public/
ls -la public/css/
ls -la public/images/
```

Make sure folders exist. If not:
```bash
# You need to upload the public folder via FTP
```

### **Issue 2: Server crashes**

```bash
pm2 logs goa-games --lines 100
# Look for errors and send them to me
```

### **Issue 3: Can't access from browser**

```bash
# Check if Nginx is blocking
systemctl status nginx

# Check firewall
ufw status
```

---

## 💡 NEXT STEPS:

1. Run the Quick Fix commands above
2. Send me the output of: `pm2 logs goa-games --lines 50`
3. Try accessing: http://93.127.167.248:3000
4. Let me know if UI loads correctly!

---

**I'm here to help if you get stuck on any step!** 🚀
