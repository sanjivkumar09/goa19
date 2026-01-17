# 🚀 Hostinger Deployment Checklist for skynoxx.live

## ✅ Pre-Deployment Checklist (Completed)

### Database Configuration
- ✅ Database credentials configured in `.env` file
- ✅ Connection file updated (`src/config/connectDB.js`)
- ✅ Database name: `u938578626_games`
- ✅ Database user: `u938578626_skynoxx`
- ✅ Connection pooling enabled
- ✅ Auto-reconnect configured

### Security
- ✅ `.env` file created with production credentials
- ✅ `.gitignore` configured to exclude sensitive files
- ✅ Password secured in environment variables
- ⚠️ **ACTION REQUIRED**: Change `JWT_SECRET` to a strong random value

### Code Cleanup
- ✅ Removed development files (`temp`, `run-site.bat`)
- ✅ Removed duplicate folders
- ✅ Removed old backup files
- ✅ Source images moved to public folder
- ✅ All EJS templates updated
- ✅ All errors fixed in code files

### Project Structure
- ✅ All controllers present and functional
- ✅ All views (EJS templates) present
- ✅ All routes configured
- ✅ Public assets organized
- ✅ Database connection configured

---

## 📋 Deployment Steps for Hostinger

### Step 1: Prepare Database (5 minutes)

1. **Log into Hostinger Control Panel**
   - URL: https://hpanel.hostinger.com
   - Go to: Websites → skynoxx.live → Databases → phpMyAdmin

2. **Import Database**
   - Select database: `u938578626_games`
   - Click **Import** tab
   - Choose file: `goa.sql` from your project
   - Scroll down and click **Go**
   - Wait for "Import has been successfully finished"

### Step 2: Upload Project Files (10-15 minutes)

#### Option A: Via File Manager (Recommended for beginners)
1. Go to: Websites → skynoxx.live → Files → File Manager
2. Navigate to `public_html` directory
3. **Delete all existing files** in public_html (if any)
4. Click **Upload** button
5. **Upload these files/folders** (IMPORTANT - upload as-is):
   ```
   ├── .env
   ├── .gitignore
   ├── package.json
   ├── package-lock.json
   └── src/
       ├── config/
       ├── controllers/
       ├── modal/
       ├── public/
       ├── routes/
       ├── server.js
       └── views/
   ```

#### Option B: Via FTP (Recommended for large projects)
1. Get FTP credentials from Hostinger
2. Use FileZilla or similar FTP client
3. Connect to your server
4. Upload all files to `public_html`
5. Ensure `.env` file is uploaded

**Files to Upload:**
- ✅ `.env` (CRITICAL - contains database credentials)
- ✅ `.gitignore`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `goa.sql` (keep a backup copy)
- ✅ Entire `src/` folder

**DO NOT Upload:**
- ❌ `node_modules/` (will be installed on server)
- ❌ `.git/` folder (if present)
- ❌ Any `.md` documentation files (optional)

### Step 3: Configure Node.js Application (5 minutes)

1. **Access Node.js Manager**
   - Go to: Websites → skynoxx.live → Advanced → Node.js

2. **Configure Application**
   - **Application mode**: Production
   - **Application root**: `/public_html` or `/home/u938578626/public_html`
   - **Application URL**: skynoxx.live
   - **Application startup file**: `src/server.js`
   - **Node.js version**: 18.x or 20.x (latest LTS)

3. **Click "Create Application"**

### Step 4: Install Dependencies (Auto or Manual)

#### Automatic (If Hostinger supports it):
- Hostinger will auto-detect `package.json` and run `npm install`

#### Manual via SSH:
```bash
# Connect via SSH
ssh u938578626@skynoxx.live

# Navigate to project directory
cd public_html

# Install dependencies
npm install --production

# If npm install fails, try:
npm install --legacy-peer-deps

# Start application (if not auto-started)
npm start
```

### Step 5: Verify Environment Variables

Via SSH, check if `.env` file exists:
```bash
cd public_html
cat .env
```

Should show:
```
DB_HOST=localhost
DB_USER=u938578626_skynoxx
DB_PASSWORD=1*hz$Tk>
DB_NAME=u938578626_games
PORT=3000
NODE_ENV=production
```

### Step 6: Start Application

1. **Via Hostinger Panel**:
   - Go to Node.js manager
   - Click **Start** or **Restart** application

2. **Via SSH** (if needed):
   ```bash
   cd public_html
   npm start
   ```

3. **Using PM2** (recommended for production):
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start src/server.js --name "goa-games"
   
   # Save PM2 configuration
   pm2 save
   
   # Auto-start on reboot
   pm2 startup
   ```

### Step 7: Configure SSL Certificate (5 minutes)

1. Go to: Websites → skynoxx.live → Security → SSL
2. Click **Enable** on free SSL certificate
3. Wait 10-15 minutes for activation
4. Verify HTTPS is working: https://skynoxx.live

### Step 8: Configure Domain (If needed)

1. Go to: Websites → skynoxx.live → Domains
2. Ensure `skynoxx.live` is added
3. Add `www.skynoxx.live` (optional)
4. Check nameservers are pointing to Hostinger

---

## 🔍 Post-Deployment Verification

### Test These Features:

1. **Homepage**
   - ✅ Visit: https://skynoxx.live
   - ✅ Check if homepage loads
   - ✅ Verify logo displays correctly

2. **User Registration**
   - ✅ Go to registration page
   - ✅ Try creating a test account
   - ✅ Check if data saves to database

3. **User Login**
   - ✅ Try logging in
   - ✅ Verify session management works
   - ✅ Check JWT tokens are working

4. **Database Connection**
   - ✅ Check console logs for "Database connected successfully"
   - ✅ Verify no connection errors
   - ✅ Test data reads/writes

5. **Payment Pages**
   - ✅ Test wallet/recharge pages
   - ✅ Verify QR code displays
   - ✅ Check UPI copy functionality

6. **Games**
   - ✅ Test WinGo game loads
   - ✅ Test K3 game loads
   - ✅ Test 5D game loads
   - ✅ Verify game periods update

---

## ⚠️ Important Actions After Deployment

### 1. Change JWT Secret (CRITICAL)
```bash
# Generate strong random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env file with generated secret
# Replace: JWT_SECRET=your_jwt_secret_key_here_change_this_to_random_string
# With: JWT_SECRET=<generated-secret>
```

### 2. Test All Features
- Test user registration and login
- Test all game types
- Test payment/wallet features
- Test admin panel (if applicable)

### 3. Setup Monitoring
- Enable error logging in Hostinger
- Setup email alerts for errors
- Monitor application performance

### 4. Enable Backups
- Setup automatic database backups
- Configure backup frequency (daily recommended)
- Test backup restoration process

### 5. Security Hardening
- Enable Hostinger firewall
- Configure rate limiting (if available)
- Setup fail2ban (if available)
- Review and update security headers

---

## 🐛 Troubleshooting Guide

### Issue: "Cannot connect to database"
**Solution:**
1. Check `.env` file exists and has correct credentials
2. Verify database `u938578626_games` exists in phpMyAdmin
3. Ensure database user has proper permissions
4. Check if `goa.sql` was imported successfully

### Issue: "Module not found" errors
**Solution:**
```bash
cd public_html
rm -rf node_modules package-lock.json
npm install --production
```

### Issue: Application won't start
**Solution:**
1. Check Node.js version (should be 18.x or higher)
2. Review error logs in Hostinger panel
3. Verify `src/server.js` path is correct
4. Check port configuration (Hostinger manages ports automatically)

### Issue: "502 Bad Gateway" error
**Solution:**
1. Restart the application in Node.js manager
2. Check if application is running: `pm2 status`
3. Review application logs: `pm2 logs`
4. Verify `.env` file is present and correct

### Issue: Database import fails
**Solution:**
1. Check `goa.sql` file size (max upload limit)
2. Try importing in smaller chunks
3. Use command line import via SSH:
   ```bash
   mysql -u u938578626_skynoxx -p u938578626_games < goa.sql
   ```

### Issue: SSL certificate not activating
**Solution:**
1. Wait 15-30 minutes (can take time)
2. Verify domain DNS is pointing to Hostinger
3. Clear browser cache
4. Contact Hostinger support if still not working

---

## 📞 Support Resources

### Hostinger Support
- **Live Chat**: Available 24/7 in Hostinger panel
- **Knowledge Base**: https://support.hostinger.com
- **Tutorials**: https://www.hostinger.com/tutorials

### Application Issues
- Check application logs in Hostinger panel
- Review Node.js error messages
- Check browser console for client-side errors

---

## ✅ Final Verification Checklist

Before going live, verify:

- [ ] Database imported successfully (check tables in phpMyAdmin)
- [ ] All files uploaded to `public_html`
- [ ] `.env` file uploaded and contains correct credentials
- [ ] Node dependencies installed (`node_modules` exists)
- [ ] Application is running (check Node.js manager)
- [ ] Homepage loads at https://skynoxx.live
- [ ] SSL certificate is active (HTTPS working)
- [ ] User registration works
- [ ] User login works
- [ ] Games load and function correctly
- [ ] Payment pages work
- [ ] Admin panel accessible (if applicable)
- [ ] JWT_SECRET changed from default
- [ ] Database backups enabled
- [ ] Error monitoring enabled

---

## 🎉 Success Indicators

Your website is successfully deployed when:

1. ✅ https://skynoxx.live loads without errors
2. ✅ Database shows "Connected successfully" in logs
3. ✅ Users can register and login
4. ✅ All games are functional
5. ✅ Payment pages display correctly
6. ✅ SSL certificate shows as secure
7. ✅ No 502/503 errors
8. ✅ Application stays running (doesn't crash)

---

## 📝 Quick Command Reference

```bash
# SSH Access
ssh u938578626@skynoxx.live

# Navigate to project
cd public_html

# Check application status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart goa-games

# Update code (after changes)
git pull  # if using git
npm install
pm2 restart goa-games

# Database backup
mysqldump -u u938578626_skynoxx -p u938578626_games > backup_$(date +%Y%m%d).sql

# Check disk space
df -h

# Check memory usage
free -m
```

---

**Your website is now production-ready! 🚀**

Just follow the steps above, and your website will be live at **https://skynoxx.live**

For detailed setup instructions, refer to `HOSTING_SETUP.md`
