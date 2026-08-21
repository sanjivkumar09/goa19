const express = require('express');
const configViewEngine = require('./config/configEngine.js');
const routes = require('./routes/web.js');
const cronJobContronler = require('./controllers/cronJobContronler.js');
const socketIoController = require('./controllers/socketIoController.js');
const aviatorController = require('./controllers/aviatorController.js');
const chickenController = require('./controllers/chickenController.js');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;
const host = process.env.SERVER_HOST || '0.0.0.0';

app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request & Response Logger Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
    const oldJson = res.json;
    res.json = function(data) {
        console.log(`[RESPONSE] ${req.method} ${req.url} - Status: ${res.statusCode} - Data:`, data);
        return oldJson.apply(res, arguments);
    };
    next();
});

// setup viewEngine
configViewEngine(app);
// init Web Routes
routes.initWebRouter(app);

// Initialize game periods on server start
cronJobContronler.initializeGamePeriods().then(() => {
    console.log('Games initialized successfully!');
    // Cron game 1 Phut 
    cronJobContronler.cronJobGame1p(io);
}).catch(err => {
    console.error('Failed to initialize games:', err);
    // Start cron jobs anyway with safety checks
    cronJobContronler.cronJobGame1p(io);
});

// Check xem ai connect vào sever 
socketIoController.sendMessageAdmin(io);

// Initialize Aviator real-time Socket.IO game engine
aviatorController.initAviatorEngine(io);

// Initialize Chicken Road real-time Socket.IO game engine
chickenController.initChickenEngine(io);

// app.all('*', (req, res) => {
//     return res.render("404.ejs"); 
// });


server.listen(port, host, () => {
    console.log(`🚀 Server running on ${host}:${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${process.env.DB_NAME}`);
});

process.on('uncaughtException', function (err) {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', function (reason, promise) {
    console.error('Unhandled Rejection:', reason);
});

