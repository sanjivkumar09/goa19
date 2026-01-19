# 🚀 VPS DEPLOYMENT & UI FIX GUIDE

## ⚠️ PROBLEM: UI Broken / Static Files Not Loading

If CSS, images, and JavaScript files are not loading, follow these steps:

---

## ✅ SOLUTION 1: Fix Static Files Path

### **1. Check File Structure on VPS**

Your VPS should have this structure:
```
/var/www/your-project/
├── src/
│   ├── public/          ← Static files (CSS, JS, images)
│   ├── views/           ← EJS templates
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── package.json
└── .env
```

### **2. Verify Static Files are Uploaded**

SSH into your VPS and run:
```bash
cd /var/www/your-project
ls -la src/public/
```

You should see:
- `css/` folder
- `js/` folder
- `images/` folder
- `banner/` folder

---

## ✅ SOLUTION 2: Check Server Configuration

### **1. Verify Express Static Middleware**

Your `src/server.js` should have:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

### **2. Check .env File on VPS**

Make sure `.env` exists with correct values:
```bash
nano .env
```

Content:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=games
PORT=3000
NODE_ENV=production
```

---

## ✅ SOLUTION 3: Fix File Permissions

### **On VPS, run:**

```bash
cd /var/www/your-project
chmod -R 755 src/public/
chown -R www-data:www-data src/public/
```

---

## ✅ SOLUTION 4: Install Dependencies

```bash
cd /var/www/your-project
npm install
```

---

## ✅ SOLUTION 5: Configure Nginx (If Using Nginx)

Create/edit Nginx config:
```bash
sudo nano /etc/nginx/sites-available/goa-games
```

Add this:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files directly
    location /css/ {
        alias /var/www/your-project/src/public/css/;
        expires 30d;
    }

    location /js/ {
        alias /var/www/your-project/src/public/js/;
        expires 30d;
    }

    location /images/ {
        alias /var/www/your-project/src/public/images/;
        expires 30d;
    }

    location /banner/ {
        alias /var/www/your-project/src/public/banner/;
        expires 30d;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/goa-games /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ SOLUTION 6: Start Server with PM2

```bash
cd /var/www/your-project
pm2 start src/server.js --name goa-games
pm2 save
pm2 startup
```

---

## 🔍 DEBUGGING STEPS

### **1. Check Server Logs**

```bash
pm2 logs goa-games
```

Look for errors related to:
- Static file serving
- Missing files
- Permission denied

### **2. Test Static Files Directly**

Try accessing in browser:
```
http://your-domain.com/css/main.css
http://your-domain.com/images/logo-wingo.webp
http://your-domain.com/js/main.js
```

If these show 404:
- Static files not uploaded correctly
- Path configuration wrong
- Nginx not configured

### **3. Check Browser Console (F12)**

Press F12 in browser and check Console tab for errors like:
```
Failed to load resource: net::ERR_FILE_NOT_FOUND
GET http://your-domain.com/css/main.css 404
```

---

## 📋 QUICK CHECKLIST

- [ ] All files uploaded to VPS
- [ ] `src/public/` folder exists and has content
- [ ] File permissions set (755)
- [ ] `.env` file exists with correct values
- [ ] `npm install` completed
- [ ] PM2 running the server
- [ ] Nginx configured (if using)
- [ ] Database connected
- [ ] No errors in `pm2 logs`

---

## 🚨 COMMON ISSUES & FIXES

### **Issue 1: CSS Files Return 404**

**Fix:**
```bash
# Check if files exist
ls -la src/public/css/

# Fix permissions
chmod -R 755 src/public/

# Restart server
pm2 restart goa-games
```

### **Issue 2: Images Not Loading**

**Fix:**
```bash
# Check images folder
ls -la src/public/images/

# Make sure path is correct in views
# Should be: /images/logo.png (NOT /public/images/logo.png)
```

### **Issue 3: JavaScript Not Working**

**Fix:**
```bash
# Check JS files exist
ls -la src/public/js/

# Check browser console for errors
# Make sure paths in HTML are: /js/main.js (NOT /public/js/main.js)
```

---

## 💡 QUICK FIX COMMAND

Run this on your VPS:
```bash
cd /var/www/your-project
chmod -R 755 src/public/
npm install
pm2 restart goa-games
pm2 logs
```

---

## 📞 STILL NOT WORKING?

### **Send me these:**

1. Output of: `ls -la src/public/`
2. Output of: `pm2 logs --lines 50`
3. Browser console errors (F12 → Console tab)
4. Screenshot of broken UI

---

**Once fixed, your UI will load perfectly!** ✅
