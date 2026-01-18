const connection = require('../config/connectDB.js');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const request = require('request');
const dotenv = require('dotenv');
dotenv.config();

/* ================= HELPERS ================= */

const timeNow = Date.now();

const randomString = (length) => {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const isNumber = (params) => /^[0-9]*\d$/.test(params);

function ipAddress(req) {
    if (req.headers['x-forwarded-for']) {
        return req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    } else {
        return req.ip;
    }
}

const timeCreate = () => Date.now();

/* ================= PAGES ================= */

const loginPage = async (req, res) => res.render("account/login.ejs");
const registerPage = async (req, res) => res.render("account/register.ejs");
const forgotPage = async (req, res) => res.render("account/forgot.ejs");

/* ================= LOGIN ================= */

const login = async (req, res) => {
    const { username, pwd } = req.body;

    if (!username || !pwd)
        return res.status(200).json({ message: 'ERROR!!!' });

    if (username.length < 9 || username.length > 10 || !isNumber(username))
        return res.status(200).json({ message: 'phone error', status: false });

    try {
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE phone = ? AND password = ?',
            [username, md5(pwd)]
        );

        if (rows.length === 1) {
            if (rows[0].status !== 1)
                return res.status(200).json({ message: 'Account has been locked', status: false });

            const { password, money, ip, veri, ip_address, status, time, ...others } = rows[0];

            const accessToken = jwt.sign(
                { user: others, timeNow },
                process.env.JWT_ACCESS_TOKEN,
                { expiresIn: "1d" }
            );

            await connection.execute(
                'UPDATE users SET token = ? WHERE phone = ?',
                [md5(accessToken), username]
            );

            return res.status(200).json({
                message: 'Login Success',
                status: true,
                token: accessToken,
                value: md5(accessToken),
                level: rows[0].level
            });

        } else {
            return res.status(200).json({ message: 'Incorrect Username or Password', status: false });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/* ================= REGISTER ================= */

const register = async (req, res) => {
    const { username, pwd, invitecode } = req.body;

    const id_user = randomNumber(10000, 99999);
    const otp2 = randomNumber(100000, 999999);
    const name_user = "Member" + randomNumber(10000, 99999);
    const code = randomString(5) + randomNumber(10000, 99999);
    const ip = ipAddress(req);
    const time = timeCreate();

    if (!username || !pwd)
        return res.status(200).json({ message: 'ERROR!!!', status: false });

    if (username.length < 9 || username.length > 10 || !isNumber(username))
        return res.status(200).json({ message: 'phone error', status: false });

    try {
        const [check_u] = await connection.query('SELECT * FROM users WHERE phone = ?', [username]);
        const [check_ip] = await connection.query('SELECT * FROM users WHERE ip_address = ?', [ip]);

        let check_i = [];
        if (invitecode) {
            [check_i] = await connection.query('SELECT * FROM users WHERE code = ?', [invitecode]);
        }

        if (check_u.length === 1 && check_u[0].veri === 1)
            return res.status(200).json({ message: 'Registered phone number', status: false });

        if (invitecode && check_i.length !== 1)
            return res.status(200).json({ message: 'Referrer code does not exist', status: false });

        if (check_ip.length > 3)
            return res.status(200).json({ message: 'Registered IP address', status: false });

        let ctv = '';
        if (check_i.length === 1)
            ctv = check_i[0].level === 2 ? check_i[0].phone : check_i[0].ctv;

        const sql = `INSERT INTO users 
        (id_user,phone,name_user,password,money,code,invite,ctv,veri,otp,ip_address,status,time)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        await connection.execute(sql, [
            id_user, username, name_user, md5(pwd),
            0, code, invitecode || '', ctv, 1, otp2, ip, 1, time
        ]);

        await connection.execute('INSERT INTO point_list SET phone = ?', [username]);

        return res.status(200).json({ message: "Registered successfully", status: true });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/* ================= OTP PASSWORD RESET ================= */

const forGotPassword = async (req, res) => {

    const { username, otp, pwd } = req.body;
    const now = Date.now();
    const timeEnd = now + 1000 * 60 * 2;
    const otp2 = randomNumber(100000, 999999);

    if (username.length < 9 || username.length > 10 || !isNumber(username))
        return res.status(200).json({ message: 'phone error', status: false });

    const [rows] = await connection.query(
        'SELECT * FROM users WHERE phone = ? AND veri = 1',
        [username]
    );

    if (rows.length === 0)
        return res.status(200).json({ message: 'Account does not exist', status: false });

    const user = rows[0];

    if (user.time_otp - now <= 0)
        return res.status(200).json({ message: 'OTP code has expired', status: false });

    if (user.otp != otp)
        return res.status(200).json({ message: 'OTP code is incorrect', status: false });

    await connection.execute(
        "UPDATE users SET password = ?, otp = ?, time_otp = ? WHERE phone = ?",
        [md5(pwd), otp2, timeEnd, username]
    );

    return res.status(200).json({ message: 'Change password successfully', status: true });
};

/* ================= EXPORT ================= */

module.exports = {
    login,
    register,
    loginPage,
    registerPage,
    forgotPage,
    forGotPassword
};
