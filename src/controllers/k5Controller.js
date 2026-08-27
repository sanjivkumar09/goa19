const e = require("express");
const connection = require("../config/connectDB.js");
const dotenv = require('dotenv');
dotenv.config();


const K5DPage = async (req, res) => {
    return res.render("bet/5d/5d.ejs"); 
}

const K5DPage3 = async (req, res) => {
    return res.render("bet/wingo/win3.ejs");
}

const K5DPage5 = async (req, res) => {
    return res.render("bet/wingo/win5.ejs");
}

const K5DPage10 = async (req, res) => {
    return res.render("bet/wingo/win10.ejs");
}


const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
}

function formateT(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
    }
    
function timerJoin(params = '', addHours = 0) {
        let date = '';
        if (params) {
            date = new Date(Number(params));
        } else {
            date = new Date();
        }
    
        date.setHours(date.getHours() + addHours);
    
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
    
        let hours = date.getHours() % 12;
        hours = hours === 0 ? 12 : hours;
        let ampm = date.getHours() < 12 ? "AM" : "PM";
    
        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());
    
        return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

const rosesPlus = async (auth, money) => {
    const [level] = await connection.query('SELECT * FROM level ');
    let level0 = level[0];

    const [user] = await connection.query('SELECT `phone`, `code`, `invite` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
    let userInfo = user[0];
    const [f1] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [userInfo.invite]);
    if (money >= 10000) {
        if (f1.length > 0) {
            let infoF1 = f1[0];
            let rosesF1 = (money / 100) * level0.f1;
            await connection.query('UPDATE users SET money = money + ?, roses_f1 = roses_f1 + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF1, rosesF1, rosesF1, rosesF1, infoF1.phone]);
            const [f2] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [infoF1.invite]);
            if (f2.length > 0) {
                let infoF2 = f2[0];
                let rosesF2 = (money / 100) * level0.f2;
                await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF2, rosesF2, rosesF2, infoF2.phone]);
                const [f3] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [infoF2.invite]);
                if (f3.length > 0) {
                    let infoF3 = f3[0];
                    let rosesF3 = (money / 100) * level0.f3;
                    await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF3, rosesF3, rosesF3, infoF3.phone]);
                    const [f4] = await connection.query('SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1  LIMIT 1 ', [infoF3.invite]);
                    if (f4.length > 0) {
                        let infoF4 = f4[0];
                        let rosesF4 = (money / 100) * level0.f4;
                        await connection.query('UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ', [rosesF4, rosesF4, rosesF4, infoF4.phone]);
                    }
                }
            }

        }
    }
}

const validateBet = async (join, list_join, x, money, game) => {
    let checkJoin = isNumber(list_join);
    let checkX = isNumber(x);
    const checks = ['a', 'b', 'c', 'd', 'e', 'total'].includes(join);
    const checkGame = ['1', '3', '5', '10'].includes(String(game));
    const checkMoney = ['1', '10', '100', '1000'].includes(money);

    if (!checks || list_join.length > 10 || !checkX || !checkMoney || !checkGame) {
        return false;
    }

    if (checkJoin) {
        let arr = list_join.split('');
        let length = arr.length;
        for (let i = 0; i < length; i++) {
            const joinNum = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(arr[i]);
            if (!joinNum) {
                return false;
            }
        }
    } else {
        let arr = list_join.split('');
        let length = arr.length;
        for (let i = 0; i < length; i++) {
            const joinStr = ["c", "l", "b", "s"].includes(arr[i]);
            if (!joinStr) {
                return false;
            }
        }

    }

    return true;
}

const betK5D = async (req, res) => {
    try {
        let { join, list_join, x, money, game } = req.body;
        let auth = req.cookies.auth;

        let validate = await validateBet(join, list_join, x, money, game);

        if (!validate) {
            return res.status(200).json({
                message: 'Invalid bet',
                status: false
            });
        }

        const [k5DNow] = await connection.query(`SELECT period FROM 5d WHERE status = 0 AND game = ${game} ORDER BY id DESC LIMIT 1 `);
        const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `level`, IFNULL(`money_user`, `money`) AS `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
        if (k5DNow.length < 1 || user.length < 1) {
            return res.status(200).json({
                message: 'Error!',
                status: false
            });
        }
        let userInfo = user[0];
        let period = k5DNow[0];

        let date = new Date();
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
        let id_product = years + months + days + Math.floor(Math.random() * 1000000000000000);

        let total = money * x * (String(list_join).split('').length);
        let fee = total * 0.02;
        let price = total - fee;

        let check = userInfo.money - total;
        if (check >= 0) {
            let timeNow = Date.now();
            const sql = `INSERT INTO result_5d SET id_product = ?,phone = ?,code = ?,invite = ?,stage = ?,level = ?,money = ?,price = ?,amount = ?,fee = ?,game = ?,join_bet = ?,bet = ?,status = ?,time = ?`;
            await connection.execute(sql, [id_product, userInfo.phone, userInfo.code, userInfo.invite, period.period, userInfo.level, total, price, x, fee, game, join, list_join, 0, timeNow]);
            await connection.execute(
                'UPDATE `users` SET `money` = IFNULL(`money_user`, `money`) - ?, `money_user` = IFNULL(`money_user`, `money`) - ? WHERE `token` = ? ',
                [total, total, auth]
            );
            const [users] = await connection.query('SELECT IFNULL(`money_user`, `money`) AS `money`, `level` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
            await rosesPlus(auth, money * x);
            const [level] = await connection.query('SELECT * FROM level ');
            let level0 = level[0];
            const sql2 = `INSERT INTO roses SET phone = ?,code = ?,invite = ?,f1 = ?,f2 = ?,f3 = ?,f4 = ?,time = ?`;
            let total_m = total;
            let f1 = (total_m / 100) * level0.f1;
            let f2 = (total_m / 100) * level0.f2;
            let f3 = (total_m / 100) * level0.f3;
            let f4 = (total_m / 100) * level0.f4;
            await connection.execute(sql2, [userInfo.phone, userInfo.code, userInfo.invite, f1, f2, f3, f4, timeNow]);
            return res.status(200).json({
                message: 'Successful bet',
                status: true,
                stage: period.period,
                id_product: id_product,
                // data: result,
                change: users[0].level,
                money: users[0].money,
            });
        } else {
            return res.status(200).json({
                message: 'The amount is not enough',
                status: false
            });
        }
    } catch (error) {
        if (error) console.log(error);
    }
}

const listOrderOld = async (req, res) => {
    let { gameJoin, pageno, pageto } = req.body;
    let auth = req.cookies.auth;

    let checkGame = ['1', '3', '5', '10'].includes(String(gameJoin));
    if (!checkGame) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    pageno = parseInt(pageno, 10);
    pageto = parseInt(pageto, 10);
    if (isNaN(pageno) || pageno < 0) pageno = 0;
    if (isNaN(pageto) || pageto <= 0) pageto = 10;

    const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `level`, IFNULL(`money_user`, `money`) AS `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);

    let game = Number(gameJoin);

    const [k5d] = await connection.query(`SELECT * FROM 5d WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT ${pageno}, ${pageto} `);
    const [k5dAll] = await connection.query(`SELECT * FROM 5d WHERE status != 0 AND game = '${game}' `);
    const [period] = await connection.query(`SELECT period FROM 5d WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `);
    if (!k5d || k5d.length == 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            page: 1,
            status: false
        });
    }
    let currentPeriod = (period && period[0]) ? period[0].period : '';
    let page = Math.ceil(k5dAll.length / 10);
    return res.status(200).json({
        code: 0,
        msg: "Get success",
        data: {
            gameslist: k5d,
        },
        period: currentPeriod,
        page: page,
        status: true
    });
}

const GetMyEmerdList = async (req, res) => {
    let { gameJoin, pageno, pageto } = req.body;
    let auth = req.cookies.auth;

    pageno = parseInt(pageno, 10);
    if (isNaN(pageno) || pageno < 0) pageno = 0;
    pageto = parseInt(pageto, 10);
    if (isNaN(pageto) || pageto <= 0) pageto = 10;

    let game = Number(gameJoin || 1);

    const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `level`, IFNULL(`money_user`, `money`) AS `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ', [auth]);
    if (!user || !user[0]) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: { gameslist: [] },
            page: 1,
            status: false
        });
    }

    const [result_5d] = await connection.query(`SELECT * FROM result_5d WHERE phone = ? AND game = '${game}' ORDER BY id DESC LIMIT ${pageno}, ${pageto}`, [user[0].phone]);
    const [result_5dAll] = await connection.query(`SELECT * FROM result_5d WHERE phone = ? AND game = '${game}' ORDER BY id DESC `, [user[0].phone]);

    if (!result_5d || result_5d.length === 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            page: 1,
            status: true
        });
    }

    let page = Math.ceil(result_5dAll.length / 10);

    let datas = result_5d.map((data) => {
        let { id, phone, code, invite, level, game, ...others } = data;
        return others;
    });

    return res.status(200).json({
        code: 0,
        msg: "Get Success",
        data: {
            gameslist: datas,
        },
        page: page,
        status: true
    });
}

function makeid(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const add5D = async(game) => {
    try {
        let join = '';
        if (game == 1) join = 'k5d'; 
        if (game == 3) join = 'k5d3';
        if (game == 5) join = 'k5d5';
        if (game == 10) join = 'k5d10';

        let result2 = makeid(5);
        let timeNow = Date.now();
        let [k5D] = await connection.query(`SELECT period FROM 5d WHERE status = 0 AND game = ${game} ORDER BY id DESC LIMIT 1 `);
        
        // Check if there's an active period
        if (!k5D || k5D.length === 0) {
            console.log(`[5D_ENGINE] No active 5D period found for game: ${game}`);
            return;
        }
        
        const [setting] = await connection.query('SELECT * FROM `admin` ');
        let period = k5D[0].period;

        let nextResult = '';
        if (game == 1) nextResult = (setting[0] && setting[0].k5d) ? setting[0].k5d : '-1';
        if (game == 3) nextResult = (setting[0] && setting[0].k5d3) ? setting[0].k5d3 : '-1';
        if (game == 5) nextResult = (setting[0] && setting[0].k5d5) ? setting[0].k5d5 : '-1';
        if (game == 10) nextResult = (setting[0] && setting[0].k5d10) ? setting[0].k5d10 : '-1';

        let newArr = '';
        let finalResult = '';
        if (nextResult == '-1') {
            finalResult = result2;
            await connection.execute(`UPDATE 5d SET result = ?, status = 1 WHERE period = ? AND game = ?`, [finalResult, period, game]);
            newArr = '-1';
        } else {
            let arr = nextResult.split('|');
            let check = arr.length;
            if (check == 1) {
                newArr = '-1';
            } else {
                for (let i = 1; i < arr.length; i++) {
                    newArr += arr[i] + '|';
                }
                newArr = newArr.slice(0, -1);
            }
            finalResult = arr[0];
            await connection.execute(`UPDATE 5d SET result = ?, status = 1 WHERE period = ? AND game = ?`, [finalResult, period, game]);
        }
        
        // Generate period based on India date (Asia/Kolkata) (Format: YYYYMMDD + 4 digits: 0001, 0002, 0003...)
        const kolkataParts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date());
        const kYear = kolkataParts.find(p => p.type === 'year').value;
        const kMonth = kolkataParts.find(p => p.type === 'month').value;
        const kDay = kolkataParts.find(p => p.type === 'day').value;
        let todayPrefix = `${kYear}${kMonth}${kDay}`;

        let nextPeriod;
        if (period && String(period).startsWith(todayPrefix)) {
            let seqStr = String(period).slice(todayPrefix.length);
            let nextSeq = (parseInt(seqStr, 10) || 0) + 1;
            nextPeriod = `${todayPrefix}${String(nextSeq).padStart(4, '0')}`;
        } else {
            nextPeriod = `${todayPrefix}0001`;
        }
        
        const sql = `INSERT INTO 5d (period, result, game, status, time) VALUES (?, ?, ?, ?, ?)`;
        await connection.execute(sql, [nextPeriod, '00000', game, 0, timeNow]);

        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        console.log(`[5D_ENGINE] serverTime=${new Date().toISOString()} timezone=${tz} currentPeriod=${nextPeriod} previousPeriod=${period} resultPeriod=${period} result=${finalResult}`);

        if (game == 1) join = 'k5d';
        if (game == 3) join = 'k5d3';
        if (game == 5) join = 'k5d5';
        if (game == 10) join = 'k5d10'; 

        await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);
    } catch (error) {
        if (error) {
            console.log(error);
        }
    }
}

async function funHanding(game, period) {
    const [k5d] = await connection.query(`SELECT * FROM 5d WHERE period = ? AND game = ? LIMIT 1`, [period, game]);
    if (!k5d || k5d.length === 0) return;
    let k5dInfo = k5d[0];
 
    // update ket qua strictly for this period
    await connection.execute(`UPDATE result_5d SET result = ? WHERE status = 0 AND game = ? AND stage = ?`, [k5dInfo.result, game, period]);
    let result = String(k5dInfo.result).split('');
    let a = result[0];
    let b = result[1];
    let c = result[2];
    let d = result[3];
    let e = result[4];
    let total = 0;
    for (let i = 0; i < result.length; i++) {
        total += Number(result[i]);
    }

    // xử lý game a
    const [joinA] = await connection.execute(`SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND stage = ? AND join_bet = 'a' `, [game, period]);
    let lengthA = joinA.length;
    for (let i = 0; i < lengthA; i++) {
        let info = joinA[i];
        let sult = info.bet.split('');
        let check = isNumber(info.bet);
        if (check) {
            const joinNum = sult.includes(a);
            if (!joinNum) {
                await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
            }
        }
    }
    if (lengthA > 0) {
        if(a == '0' || a == '1' || a == '2' || a == '3' || a == '4') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'a' AND bet = 'b' `, [game, period]);
        }
        if(a == '5' || a == '6' || a == '7' || a == '8' || a == '9') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'a' AND bet = 's' `, [game, period]);
        }
        if(Number(a) % 2 == 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'a' AND bet = 'l' `, [game, period]);
        }
        if(Number(a) % 2 != 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'a' AND bet = 'c' `, [game, period]);
        }
    }

    // xử lý game b
    const [joinB] = await connection.execute(`SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND stage = ? AND join_bet = 'b' `, [game, period]);
    let lengthB = joinB.length;
    for (let i = 0; i < lengthB; i++) {
        let info = joinB[i];
        let sult = info.bet.split('');
        let check = isNumber(info.bet);
        if (check) {
            const joinNum = sult.includes(b);
            if (!joinNum) {
                await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
            }
        }
    }
    if (lengthB > 0) {
        if(b == '0' || b == '1' || b == '2' || b == '3' || b == '4') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'b' AND bet = 'b' `, [game, period]);
        }
        if(b == '5' || b == '6' || b == '7' || b == '8' || b == '9') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'b' AND bet = 's' `, [game, period]);
        }
        if(Number(b) % 2 == 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'b' AND bet = 'l' `, [game, period]);
        }
        if(Number(b) % 2 != 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'b' AND bet = 'c' `, [game, period]);
        }
    }

    // xử lý game c
    const [joinC] = await connection.execute(`SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND stage = ? AND join_bet = 'c' `, [game, period]);
    let lengthC = joinC.length;
    for (let i = 0; i < lengthC; i++) {
        let info = joinC[i];
        let sult = info.bet.split('');
        let check = isNumber(info.bet);
        if (check) {
            const joinNum = sult.includes(c);
            if (!joinNum) {
                await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
            }
        }
    }
    if (lengthC > 0) {
        if(c == '0' || c == '1' || c == '2' || c == '3' || c == '4') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'c' AND bet = 'b' `, [game, period]);
        }
        if(c == '5' || c == '6' || c == '7' || c == '8' || c == '9') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'c' AND bet = 's' `, [game, period]);
        }
        if(Number(c) % 2 == 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'c' AND bet = 'l' `, [game, period]);
        }
        if(Number(c) % 2 != 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'c' AND bet = 'c' `, [game, period]);
        }
    }
    
    // xử lý game d
    const [joinD] = await connection.execute(`SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND stage = ? AND join_bet = 'd' `, [game, period]);
    let lengthD = joinD.length;
    for (let i = 0; i < lengthD; i++) {
        let info = joinD[i];
        let sult = info.bet.split('');
        let check = isNumber(info.bet);
        if (check) {
            const joinNum = sult.includes(d);
            if (!joinNum) {
                await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
            }
        }
    }
    if (lengthD > 0) {
        if(d == '0' || d == '1' || d == '2' || d == '3' || d == '4') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'd' AND bet = 'b' `, [game, period]);
        }
        if(d == '5' || d == '6' || d == '7' || d == '8' || d == '9') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'd' AND bet = 's' `, [game, period]);
        }
        if(Number(d) % 2 == 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'd' AND bet = 'l' `, [game, period]);
        }
        if(Number(d) % 2 != 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'd' AND bet = 'c' `, [game, period]);
        }
    }

    // xử lý game e
    const [joinE] = await connection.execute(`SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND stage = ? AND join_bet = 'e' `, [game, period]);
    let lengthE = joinE.length;
    for (let i = 0; i < lengthE; i++) {
        let info = joinE[i];
        let sult = info.bet.split('');
        let check = isNumber(info.bet);
        if (check) {
            const joinNum = sult.includes(e);
            if (!joinNum) {
                await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
            }
        }
    }
    if (lengthE > 0) {
        if(e == '0' || e == '1' || e == '2' || e == '3' || e == '4') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'e' AND bet = 'b' `, [game, period]);
        }
        if(e == '5' || e == '6' || e == '7' || e == '8' || e == '9') {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'e' AND bet = 's' `, [game, period]);
        }
        if(Number(e) % 2 == 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'e' AND bet = 'l' `, [game, period]);
        }
        if(Number(e) % 2 != 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'e' AND bet = 'c' `, [game, period]);
        }
    }

    // xử lý game total
    const [joinTotal] = await connection.execute(`SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND stage = ? AND join_bet = 'total' `, [game, period]);
    if (joinTotal.length > 0) {
        if(total <= 22) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'total' AND bet = 'b' `, [game, period]);
        }
        if(total > 22) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'total' AND bet = 's' `, [game, period]);
        }
        if(total % 2 == 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'total' AND bet = 'l' `, [game, period]);
        }
        if(total % 2 != 0) {
            await connection.execute(`UPDATE result_5d SET status = 2 WHERE game = ? AND stage = ? AND join_bet = 'total' AND bet = 'c' `, [game, period]);
        }
    }
}

const handling5D = async(typeid) => {
    let game = Number(typeid);

    const [k5d] = await connection.query(`SELECT * FROM 5d WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 1 `, [game]);
    if (!k5d || k5d.length === 0) return;
    let period = k5d[0].period;

    await funHanding(game, period);

    const [order] = await connection.execute(`SELECT id, phone, bet, price, money, fee, amount FROM result_5d WHERE status = 0 AND game = ? AND stage = ? `, [game, period]);
    for (let i = 0; i < order.length; i++) {
        let orders = order[i];
        let id = orders.id;
        let phone = orders.phone;
        let nhan_duoc = 0;
        let check = isNumber(orders.bet); 
        if (check) {
            let arr = orders.bet.split('');
            let total = (orders.money / arr.length / orders.amount);
            let fee = total * 0.02;
            let price = total - fee;
            nhan_duoc += price * 9;
        } else {
            nhan_duoc += orders.price * 2;
        }

        await connection.execute('UPDATE `result_5d` SET `get` = ?, `status` = 1 WHERE `id` = ? ', [nhan_duoc, id]);
        const sql = 'UPDATE `users` SET `money` = IFNULL(`money`, `money_user`) + ?, `money_user` = IFNULL(`money_user`, `money`) + ? WHERE `phone` = ? ';
        await connection.execute(sql, [nhan_duoc, nhan_duoc, phone]);
    }
}


module.exports = {
    K5DPage,
    K5DPage3,
    K5DPage5,
    K5DPage10,
    betK5D,
    listOrderOld,
    GetMyEmerdList,
    add5D,
    handling5D
};