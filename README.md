# Goa Games - BDG WIN Premium Theme

## 🎨 Theme Overview

This project has been completely redesigned with the **BDG WIN Premium Theme** featuring:
- **Rich metallic gold accents** (#D4AF37)
- **Premium dark grey background** (#2a2a2a)  
- **Elegant, modern UI** with smooth animations
- **Fully responsive design** for all devices
- **Production-ready** with optimized CSS

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure database (edit .env file)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=games
PORT=3000
NODE_ENV=development
SERVER_HOST=localhost
JWT_SECRET=your_jwt_secret_key_here

# Start development server
npm start

# Start with PM2 (production)
pm2 start src/server.js --name "goa-games"
```

## 📁 Project Structure

```
goa19/
├── src/
│   ├── controllers/       # Backend logic
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── views/             # EJS templates
│   │   ├── home/          # Home page
│   │   ├── account/       # Login/Register
│   │   ├── wallet/        # Wallet pages
│   │   ├── member/        # Profile pages
│   │   ├── promotion/     # Promotion pages
│   │   ├── checkIn/       # Rewards pages
│   │   └── bet/           # Game pages
│   └── public/
│       ├── css/           # Stylesheets
│       │   ├── main.css           # Base styles
│       │   ├── home-modern.css    # Home page styles
│       │   └── pages-global.css   # Global theme
│       ├── js/            # JavaScript files
│       └── images/        # Image assets
└── package.json
```

## 🎨 Theme Colors

### Primary Gold Palette
```css
--primary-gold: #D4AF37;    /* Metallic gold */
--secondary-gold: #C5A028;  /* Darker gold */
--accent-gold: #E6BE4E;     /* Bright gold accent */
--dark-gold: #B8941E;       /* Deep gold */
```

### Backgrounds
```css
--bg-grey: #2a2a2a;         /* Main background */
--bg-dark: #1f1f1f;         /* Darker areas */
--bg-card: rgba(30, 30, 46, 0.8); /* Card backgrounds */
```

### Text Colors
```css
--text-gold: #D4AF37;       /* Gold text */
--text-light: #e0e0e0;      /* Light grey text */
--text-white: #ffffff;      /* White text */
```

## 🌟 Key Features

### ✅ Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interactions

### ✅ Modern UI Components
- Golden gradient buttons with hover effects
- Transparent game cards with golden accents
- Premium dark cards with golden borders
- Animated loading states
- Smooth transitions and animations

### ✅ User Pages
- **Home**: Games showcase with golden theme
- **Login/Register**: Premium dark login with golden accents
- **Wallet**: Balance display and transactions
- **Profile**: User information and settings
- **Promotions**: Referral system
- **Check-in**: Daily rewards
- **Games**: WinGo, K3, 5D lottery games

### ✅ Admin Panel
- Game management (WinGo, K3, 5D)
- User management
- Transaction monitoring
- Settings and configuration

## 🔧 Configuration

### Database Setup
1. Create MySQL database
2. Import schema from `goa.sql`
3. Update `.env` with database credentials

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=games

# Server
PORT=3000
SERVER_HOST=localhost
NODE_ENV=production

# Security
JWT_SECRET=your_secure_random_string_here
```

## 🎯 Production Deployment

### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/server.js --name "goa-games"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using Node.js Directly
```bash
# Set environment
export NODE_ENV=production

# Start server
node src/server.js
```

### Deploy to Hostinger VPS
```bash
# Upload files via FTP or use deployment script
npm run deploy

# Or manually via SSH
rsync -avz --exclude 'node_modules' ./ user@server:/path/to/app
ssh user@server 'cd /path/to/app && npm install && pm2 restart goa-games'
```

## 🎮 Features

### User Features
- ✅ User registration and login
- ✅ Wallet system (deposit/withdrawal)
- ✅ Daily check-in rewards
- ✅ Referral/promotion system
- ✅ Multiple lottery games (WinGo, K3, 5D)
- ✅ Real-time game updates
- ✅ Transaction history
- ✅ Profile management

### Admin Features
- ✅ Game result management
- ✅ User management
- ✅ Transaction approval
- ✅ Settings configuration
- ✅ Statistics and reports

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting
- Input validation

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /F /PID <PID>

# Kill the process (Linux/Mac)
kill -9 <PID>
```

### Database Connection Error
1. Check if MySQL is running
2. Verify database credentials in `.env`
3. Ensure database exists
4. Check firewall settings

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/forgot-password` - Password recovery

### Wallet
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/recharge` - Deposit funds
- `POST /api/wallet/withdrawal` - Withdraw funds

### Games
- `GET /api/win/period` - Get current WinGo period
- `POST /api/win/bet` - Place WinGo bet
- `GET /api/k3/period` - Get current K3 period
- `POST /api/k3/bet` - Place K3 bet
- `GET /api/5d/period` - Get current 5D period
- `POST /api/5d/bet` - Place 5D bet

## 🎨 Customization

### Changing Colors
Edit `src/public/css/pages-global.css`:
```css
:root {
    --primary-gold: #YOUR_COLOR;
    --secondary-gold: #YOUR_COLOR;
}
```

### Adding New Pages
1. Create EJS template in `src/views/`
2. Add route in `src/routes/web.js`
3. Create controller in `src/controllers/`
4. Add styles (use `pages-global.css` for consistency)

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For issues or questions:
- Check troubleshooting section
- Review console logs: `pm2 logs goa-games`
- Check server logs in `/logs` directory

## 🚀 Version History

### v2.0.0 - BDG WIN Premium Theme (Current)
- ✅ Complete UI redesign with gold/grey theme
- ✅ Responsive design improvements
- ✅ Performance optimizations
- ✅ Production-ready enhancements
- ✅ Global theme system
- ✅ Enhanced security features

### v1.0.0 - Initial Release
- Basic functionality
- Original theme

---

**Made with ❤️ for premium gaming experience**
