# 🚀 DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT TASKS

### **1. Database Updates (DONE ON SERVER FIRST!)**
- [x] Run SQL updates on production database
- [x] Verify columns added to result_k3, result_5d, admin tables
- [ ] **IMPORTANT:** Backup production database before pushing code!

### **2. Environment Configuration**
- [ ] Check `.env` file has correct production values:
  ```
  DB_HOST=your_production_host
  DB_USER=your_production_user
  DB_PASS=your_production_password
  DB_NAME=games (or mumbai on production)
  PORT=3000
  NODE_ENV=production
  ```

### **3. Files to Upload**
```
✅ src/ (all source code)
✅ package.json
✅ package-lock.json
✅ .babelrc
✅ .htaccess
✅ .gitignore
✅ README.md
✅ fix-game-periods.js (utility)
✅ reset-all-periods.js (utility)
```

### **4. Files NOT to Upload (Optional/Local)**
```
❌ DATABASE_CHANGES.md (documentation only)
❌ database-update.sql (already ran)
❌ QUICK-UPDATE.sql (already ran)
❌ remaining-queries.sql (already ran)
❌ update.sql (already ran)
❌ update-step-by-step.txt (instructions only)
❌ START-SERVER-NOW.bat (Windows only)
❌ STOP-GOA-GAMES.bat (Windows only)
```

---

## 📦 DEPLOYMENT STEPS

### **Method 1: Git Push (Recommended)**

1. **Stage all important files:**
   ```bash
   git add src/
   git add package.json
   git add README.md
   git add .gitignore
   git add .htaccess
   git add .babelrc
   git add fix-game-periods.js
   git add reset-all-periods.js
   ```

2. **Commit changes:**
   ```bash
   git commit -m "Fix: Added missing database columns and updated period generation"
   ```

3. **Push to repository:**
   ```bash
   git push origin main
   ```

4. **On server, pull changes:**
   ```bash
   cd /path/to/your/project
   git pull origin main
   npm install
   pm2 restart all
   ```

### **Method 2: FTP/File Manager**

1. **Upload these folders:**
   - `src/` (entire folder)
   
2. **Upload these files:**
   - `package.json`
   - `package-lock.json`
   - `.htaccess`
   - `README.md`

3. **On server terminal:**
   ```bash
   cd /path/to/your/project
   npm install
   pm2 restart all
   ```

---

## ⚠️ CRITICAL: Database First!

**BEFORE pushing code, ensure database is updated!**

The new code expects these columns to exist:
- `result_k3.join_bet`
- `result_k3.typeGame`
- `result_5d.join_bet`
- `result_5d.typeGame`
- `admin.k3d`
- `admin.k3d3`
- `admin.k3d5`
- `admin.k3d10`

If database isn't updated first, the site will crash!

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### **1. Check Server Logs**
```bash
pm2 logs
```
Look for:
- ✅ "Server running on localhost:3000"
- ✅ "Database connected successfully"
- ❌ NO "Unknown column" errors

### **2. Test Admin Pages**
- Login: `http://your-domain.com/login`
- WinGo Admin: Should show data
- K3 Admin: Should show data (not "Loading...")
- 5D Admin: Should show data (not "Loading...")

### **3. Test User Functions**
- Register new account
- Place a bet on WinGo
- Place a bet on K3
- Place a bet on 5D
- Check wallet/recharge

---

## 🎯 ROLLBACK PLAN (If Something Goes Wrong)

### **Quick Rollback:**
```bash
cd /path/to/your/project
git reset --hard HEAD~1
pm2 restart all
```

### **Database Rollback:**
Restore from backup:
```bash
mysql -u user -p games < backup.sql
```

---

## ✅ DEPLOYMENT SUCCESS CRITERIA

- [ ] Server starts without errors
- [ ] No "Unknown column" errors in logs
- [ ] All 3 admin pages load (WinGo, K3, 5D)
- [ ] Games show current date (2026)
- [ ] Users can place bets
- [ ] Admin can manage results

---

## 📝 NOTES

- Database changes are **permanent** (columns added)
- Code changes are **reversible** (git revert)
- Always test on staging first if possible
- Keep database backup before any changes

---

**Ready to deploy!** ✅
