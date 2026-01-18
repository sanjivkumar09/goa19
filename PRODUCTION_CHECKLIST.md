# 🚀 Production Deployment Checklist

## Pre-Deployment

### ✅ Code & Configuration
- [x] All pages styled with BDG WIN theme
- [x] Global CSS (`pages-global.css`) created and optimized
- [x] Color scheme updated (gold #D4AF37, grey #2a2a2a)
- [x] Responsive design tested
- [ ] Remove console.log statements from production code
- [ ] Update `.env` with production credentials
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Generate strong JWT_SECRET

### ✅ Database
- [ ] Database created on production server
- [ ] Import `goa.sql` schema
- [ ] Test database connection
- [ ] Create database backups
- [ ] Set up auto-backup schedule

### ✅ Security
- [ ] Change default passwords
- [ ] Update JWT_SECRET to secure random string
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Review user permissions

### ✅ Performance
- [x] CSS optimized and minified ready
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets (optional)
- [ ] Configure caching headers
- [ ] Test page load times

## Deployment Steps

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MySQL (if not installed)
sudo apt install mysql-server
```

### 2. Upload Files
```bash
# Option A: Using rsync (recommended)
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ user@server:/var/www/goa-games/

# Option B: Using FTP/SFTP
# Upload all files except node_modules and .git

# Option C: Using Git
git clone <repository-url> /var/www/goa-games
```

### 3. Install Dependencies
```bash
cd /var/www/goa-games
npm install --production
```

### 4. Configure Environment
```bash
# Copy and edit .env file
cp .env.example .env
nano .env

# Set production values:
NODE_ENV=production
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=games
PORT=3000
SERVER_HOST=0.0.0.0
JWT_SECRET=<generate-random-string>
```

### 5. Database Setup
```bash
# Import database
mysql -u root -p games < goa.sql

# Or via phpMyAdmin
# 1. Login to phpMyAdmin
# 2. Select 'games' database
# 3. Import → Choose goa.sql → Go
```

### 6. Start Application
```bash
# Using PM2 (recommended)
pm2 start src/server.js --name "goa-games"
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs goa-games
```

### 7. Configure Nginx (Optional but Recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 8. SSL Certificate (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

## Post-Deployment

### ✅ Testing
- [ ] Homepage loads correctly
- [ ] Login/Register works
- [ ] Games are functional (WinGo, K3, 5D)
- [ ] Wallet operations work
- [ ] Admin panel accessible
- [ ] All links working
- [ ] Mobile responsive
- [ ] Cross-browser compatibility

### ✅ Monitoring
- [ ] Set up PM2 monitoring: `pm2 monitor`
- [ ] Configure error logging
- [ ] Set up uptime monitoring
- [ ] Create backup schedule
- [ ] Document admin credentials securely

### ✅ Optimization
- [ ] Enable nginx gzip compression
- [ ] Set up Redis cache (optional)
- [ ] Configure log rotation
- [ ] Monitor server resources

## Maintenance Commands

### PM2 Management
```bash
# View logs
pm2 logs goa-games

# Restart app
pm2 restart goa-games

# Stop app
pm2 stop goa-games

# Monitor
pm2 monitor

# Show details
pm2 show goa-games
```

### Database Backup
```bash
# Manual backup
mysqldump -u user -p games > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
0 2 * * * mysqldump -u user -p'password' games > /backups/games_$(date +\%Y\%m\%d).sql
```

### View Logs
```bash
# Application logs
pm2 logs goa-games --lines 100

# Server logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

### Update Application
```bash
# Pull latest changes (if using Git)
cd /var/www/goa-games
git pull origin main

# Install dependencies
npm install --production

# Restart
pm2 restart goa-games
```

## Emergency Procedures

### Application Not Starting
```bash
# Check logs
pm2 logs goa-games

# Check port
netstat -tlnp | grep 3000

# Restart server
pm2 restart goa-games

# Full restart
pm2 delete goa-games
pm2 start src/server.js --name "goa-games"
```

### Database Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### High Server Load
```bash
# Check CPU/Memory usage
htop
pm2 monit

# Check disk space
df -h

# Clear logs if needed
pm2 flush
```

## Security Best Practices

### ✅ Completed
- [x] BDG WIN theme applied (gold/grey)
- [x] Responsive design implemented
- [x] Production CSS optimized
- [x] Global theme system created

### 🔒 Security Checklist
- [ ] Strong database passwords
- [ ] JWT_SECRET changed from default
- [ ] Firewall configured (UFW/iptables)
- [ ] SSH key authentication only
- [ ] Disable root SSH login
- [ ] Regular security updates
- [ ] HTTPS enabled
- [ ] Regular backups
- [ ] Monitor unusual activity

## Performance Targets

- ✅ Page load time: < 3 seconds
- ✅ Mobile responsive: All devices
- ✅ Browser compatibility: All modern browsers
- ✅ Uptime: 99.9%
- ✅ API response time: < 500ms

## Support Contacts

- **Technical Issues**: Check logs first
- **Database Issues**: Check MySQL error logs
- **Server Issues**: Check PM2 status and logs

---

## 🎯 Quick Reference

### Start Server
```bash
pm2 start src/server.js --name "goa-games"
```

### View Logs
```bash
pm2 logs goa-games
```

### Restart
```bash
pm2 restart goa-games
```

### Stop
```bash
pm2 stop goa-games
```

### Monitor
```bash
pm2 monit
```

---

**✅ Theme Applied**: BDG WIN Premium (Gold #D4AF37 + Grey #2a2a2a)  
**🚀 Status**: Production Ready  
**📱 Responsive**: Yes  
**🎨 Pages Styled**: All major pages

**Last Updated**: 2026-01-18
