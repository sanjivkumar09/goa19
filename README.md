# 🎮 Goa Games - Lottery Gaming Platform

A full-featured lottery gaming platform with WinGo, K3, and 5D games.

---

## 🚀 Quick Start

### **Start the Server**
```bash
Double-click: START-SERVER-NOW.bat
```
Or use command line:
```bash
npm start
```

### **Stop the Server**
```bash
Double-click: STOP-GOA-GAMES.bat
```

---

## 🔗 Access URLs

### **User Pages**
- Home: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`

### **Admin Panel**
- Admin Login: `http://localhost:3000/login`
- WinGo Management: `http://localhost:3000/admin/manager/index`
- K3 Management: `http://localhost:3000/admin/manager/k3`
- 5D Management: `http://localhost:3000/admin/manager/5d`

---

## 👤 Login Credentials

### **Admin Account**
```
Phone: 9981474023
Password: 1234
```

### **Test User Account**
```
Phone: 1234567890
Password: 1234
```

---

## 📋 Project Structure

```
goa19/
├── src/
│   ├── config/          # Database and configuration
│   ├── controllers/     # Business logic
│   ├── modal/           # Database models
│   ├── public/          # Static assets (CSS, JS, images)
│   ├── routes/          # API routes
│   ├── views/           # EJS templates
│   └── server.js        # Main server file
├── package.json         # Dependencies
├── START-SERVER-NOW.bat # Start server shortcut
├── STOP-GOA-GAMES.bat   # Stop server shortcut
└── README.md            # This file
```

---

## 🎮 Available Games

### **1. WinGo**
- Time intervals: 1 min, 3 min, 5 min, 10 min
- Bet on colors (Red/Green/Purple) and numbers (0-9)
- Big/Small betting options

### **2. K3 (Dice)**
- Time intervals: 1 min, 3 min, 5 min, 10 min
- Three dice game
- Bet on sum, combinations, same numbers

### **3. 5D**
- Time intervals: 1 min, 3 min, 5 min, 10 min
- Five-digit lottery
- Multiple betting options

---

## 🛠️ Maintenance Scripts

### **Reset Game Periods (if dates are wrong)**
```bash
node fix-game-periods.js
```
This resets K3 and 5D game periods to current date.

### **Complete Reset (all games)**
```bash
node reset-all-periods.js
```
This resets WinGo, K3, and 5D periods to current date.

---

## 🔧 Troubleshooting

### **Problem: Server won't start**
**Solution:**
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if port 3000 is free
4. Run: `STOP-GOA-GAMES.bat` then `START-SERVER-NOW.bat`

### **Problem: Games show old dates**
**Solution:**
```bash
node fix-game-periods.js
npm start
```

### **Problem: Admin page shows "Loading..."**
**Solution:**
1. Make sure you're logged in as admin
2. Clear browser cache: `Ctrl + Shift + R`
3. Check login credentials: `9981474023 / 1234`

### **Problem: Database errors**
**Solution:**
1. Make sure MySQL is running
2. Check database connection in `src/config/connectDB.js`
3. Verify database name is `games`

---

## 📦 Dependencies

Main technologies used:
- **Node.js** - Server runtime
- **Express** - Web framework
- **MySQL2** - Database driver
- **Socket.io** - Real-time communication
- **EJS** - Template engine
- **node-cron** - Scheduled tasks

To install dependencies:
```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file with:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=games
PORT=3000
```

---

## 📝 Important Notes

1. **Always log in before accessing admin panel**
2. **Use admin credentials**: `9981474023 / 1234`
3. **Server must be running** for games to work
4. **Clear browser cache** if you see old data
5. **Games auto-update** every minute via cron jobs

---

## 🚀 Production Deployment

### **Before deploying:**
1. Update database credentials in `.env`
2. Change admin password
3. Set `NODE_ENV=production`
4. Configure proper domain/URL
5. Set up SSL certificate
6. Configure firewall rules

### **Start in production:**
```bash
npm start
```

Or use PM2:
```bash
npm install -g pm2
pm2 start src/server.js --name "goa-games"
pm2 save
pm2 startup
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs in the terminal
3. Check browser console for JavaScript errors (F12)
4. Verify database connection

---

## ✅ System Requirements

- **Node.js**: v14 or higher
- **MySQL**: v5.7 or higher
- **RAM**: 512MB minimum
- **Disk Space**: 500MB minimum
- **OS**: Windows, Linux, or macOS

---

## 🎯 Quick Reference

### **Start Server**
```
START-SERVER-NOW.bat
```

### **Stop Server**
```
STOP-GOA-GAMES.bat
```

### **Access Admin**
```
URL: http://localhost:3000/login
Login: 9981474023 / 1234
```

### **Reset Periods**
```
node fix-game-periods.js
```

---

**Last Updated:** 2026-01-19
**Version:** 1.0.0
**Status:** Production Ready
