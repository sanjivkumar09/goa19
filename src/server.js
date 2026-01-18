const express = require('express');
const configViewEngine = require('./config/configEngine.js');
const routes = require('./routes/web.js');
const cronJobContronler = require('./controllers/cronJobContronler.js');
const socketIoController = require('./controllers/socketIoController.js');
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

