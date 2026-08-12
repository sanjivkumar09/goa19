const connection = require('../config/connectDB');

const middlewareController = async(req, res, next) => {
    // xác nhận token
    const auth = req.cookies.auth;
    if (!auth) return res.redirect("/login");
    try {
        const [rows] = await connection.execute('SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1', [auth]);
        if (!rows || rows.length === 0) {
            res.clearCookie("auth");
            return res.redirect("/login");
        };
        if (auth == rows[0].token && rows[0].status == '1') {
            next();
        } else {
            res.clearCookie("auth");
            return res.redirect("/login");
        }
    } catch (error) {
        console.error('Middleware Error:', error);
        res.clearCookie("auth");
        return res.redirect("/login");
    }
}

module.exports = middlewareController;