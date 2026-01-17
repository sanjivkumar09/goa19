# Hostinger Hosting Setup Guide for skynoxx.live

## Database Configuration

Your MySQL database has been configured with the following credentials:

- **Host**: localhost
- **Database Name**: u938578626_games
- **Username**: u938578626_skynoxx
- **Password**: 1*hz$Tk>

## Setup Steps

### 1. Import Your Database

1. Log into Hostinger control panel (hpanel.hostinger.com)
2. Go to **Websites** → **skynoxx.live** → **Databases** → **phpMyAdmin**
3. Select your database: `u938578626_games`
4. Click on **Import** tab
5. Upload your `goa.sql` file
6. Click **Go** to import

### 2. Upload Your Application Files

Upload all project files to your Hostinger hosting account:

#### Via File Manager:
1. Go to **Websites** → **skynoxx.live** → **Files** → **File Manager**
2. Navigate to `public_html` directory
3. Upload all files from your local project (excluding `node_modules`)

#### Via FTP (Recommended for large projects):
1. Get FTP credentials from Hostinger
2. Use FileZilla or any FTP client
3. Upload files to `public_html` directory

### 3. Install Node.js Dependencies

1. Access SSH terminal (Hostinger provides SSH access)
2. Navigate to your project directory:
   ```bash
   cd public_html
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### 4. Configure Environment Variables

The `.env` file is already created with your database credentials. 

**IMPORTANT SECURITY NOTES:**
- Never commit `.env` file to Git
- Keep your database password secure
- Update JWT_SECRET in `.env` with a strong random string

### 5. Start Your Application

#### For Hostinger Node.js Hosting:

1. In Hostinger control panel, go to **Advanced** → **Node.js**
2. Set the application entry point to: `src/server.js`
3. Set Node.js version to latest LTS (18.x or higher)
4. The application will start automatically

#### Manual Start (via SSH):
```bash
npm start
```

#### For Production (with PM2):
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/server.js --name "goa-games"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
```

### 6. Configure Domain

1. Make sure your domain `skynoxx.live` points to Hostinger nameservers
2. In Hostinger, go to **Websites** → **skynoxx.live** → **Domains**
3. Add or verify your domain

### 7. SSL Certificate

1. Go to **Websites** → **skynoxx.live** → **Security** → **SSL**
2. Enable free SSL certificate
3. Wait 10-15 minutes for activation

## Important Files

- `.env` - Database credentials (DO NOT commit to git)
- `.gitignore` - Files to exclude from version control
- `goa.sql` - Database structure and data to import
- `src/config/connectDB.js` - Updated database connection file

## Verification Checklist

- [ ] Database imported successfully
- [ ] All files uploaded to hosting
- [ ] Node modules installed
- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Website accessible via domain
- [ ] SSL certificate active

## Troubleshooting

### Database Connection Errors:
- Verify database credentials in `.env` file
- Check if database exists in phpMyAdmin
- Ensure database user has proper permissions

### Application Not Starting:
- Check Node.js version compatibility
- Review error logs in Hostinger panel
- Verify all dependencies are installed

### Port Issues:
- Hostinger manages ports automatically
- Don't hardcode port numbers
- Use `process.env.PORT` in your application

## Support

For Hostinger-specific issues:
- Contact: Hostinger Support Chat
- Knowledge Base: https://support.hostinger.com

For application issues:
- Check logs: `pm2 logs` or Hostinger error logs
- Review console output for errors

## Security Recommendations

1. **Change Default Passwords**: Update your database password regularly
2. **Use Strong JWT Secret**: Generate a random 256-bit string
3. **Enable Firewall**: Configure Hostinger security settings
4. **Regular Backups**: Schedule automatic database backups
5. **Keep Updated**: Regularly update Node.js packages
6. **Monitor Logs**: Check application logs regularly

---

**Your website is now ready for hosting on skynoxx.live!** 🚀
