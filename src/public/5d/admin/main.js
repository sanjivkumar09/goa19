const socket = io();

$(window).on('load', function () {
    setTimeout(() => {
        $('#preloader').fadeOut(0);
    }, 100);
});

$(document).ready(function () {
    $(`a[href="${window.location.pathname}"]`).addClass('active');
    $(`a[href="${window.location.pathname}"]`).css('pointerEvents', 'none');
});
 
$('.back-to-tops').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 800);
    return false;
});

const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
};

function formatMoney(money, type) {
    type = type || '.';
    return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${type}`);
}

function formatPeriodToDate(period) {
    let periodStr = String(period);
    if (periodStr.length >= 10) {
        let year = periodStr.substr(0, 4);
        let month = periodStr.substr(4, 2);
        let day = periodStr.substr(6, 2);
        let hour = periodStr.substr(8, 2);
        let minute = periodStr.length >= 12 ? periodStr.substr(10, 2) : '00';
        return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    return period;
}

function cownDownTimer() {
    var countDownDate = new Date("2030-07-16T23:59:59.9999999+01:00").getTime();
    setInterval(function () {
        let checkID = $('html').attr('data-change');
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var minute = Math.ceil(minutes % Number(checkID));
        var seconds1 = Math.floor((distance % (1000 * 60)) / 10000);
        var seconds2 = Math.floor(((distance % (1000 * 60)) / 1000) % 10);
        if (checkID != 1) {
            $(".time .time-sub:eq(1)").text(minute);
        }

        $(".time .time-sub:eq(2)").text(seconds1);
        $(".time .time-sub:eq(3)").text(seconds2);
    }, 100);
}

cownDownTimer();

function showListOrder(datas) {
    if (!datas || datas.length === 0) return;
    let html = '';

    datas.map((data) => {
        let list_kq = '';
        let total = 0;
        String(data.result || '').split('').forEach((e) => {
            total += Number(e);
            list_kq += `<span data-v-a9660e98="" class="red box-xs"> ${e} </span>`;
        });
        html += 
        `
        <div data-v-a9660e98="" class="c-tc item van-row">
            <div data-v-a9660e98="" class="van-col van-col--11">
                <div data-v-a9660e98="" class="c-tc goItem" style="font-size: 13px;">${formatPeriodToDate(data.period)}</div>
            </div>
            <div data-v-a9660e98="" class="van-col van-col--5" >
                <div data-v-a9660e98="" class="c-tc goItem" style="display: flex;justify-content: center;">
                   &emsp; ${list_kq}
                    <span data-v-a9660e98="" class="red box-xs" > = </span>
                    <span data-v-a9660e98="" class="red box-xs" style="font-size: 14px"> ${total} </span>
                </div>
            </div>
            <div data-v-a9660e98="" class="van-col van-col--4">
                <div data-v-a9660e98="" class="c-tc goItem">
                    <span data-v-a9660e98=""> ${(total < 23) ? "&emsp;Small" : "&emsp;Big"} </span>
                </div>
            </div>
            <div data-v-a9660e98="" class="van-col van-col--4">
                <div data-v-a9660e98="" class="c-tc goItem">
                    <span data-v-a9660e98=""> ${(total % 2 == 0) ? "Even" : "Odd"} </span>
                </div>
            </div>
        </div>
        `;
    });
    $('#list-orders').html(html);
}

function messNewJoin2(datas) {
    if (!datas || datas.length === 0) {
        $('.direct-chat-msg').html('<div class="text-center text-muted p-3">No active bets in this round yet</div>');
        return;
    }
    let result = '';
    datas.map((data) => {
        let list_join2 = String(data.bet || '');
        let grossMoney = Number(data.money || 0);
        let money = formatMoney(grossMoney, ',');
        let betLabel = (isNumber(list_join2)) ? `Number ( ${list_join2} )` : (list_join2 == 'b') ? 'Big' : (list_join2 == 's') ? 'Small' : (list_join2 == 'c') ? 'Even' : (list_join2 == 'l') ? 'Odd' : list_join2;
        let pos = data.join_bet ? `[Position ${data.join_bet.toUpperCase()}] ` : '';
        let idProduct = data.id_product ? `[#${data.id_product}] ` : '';
        let mult = (data.amount && Number(data.amount) > 1) ? ` (x${data.amount})` : '';

        result += `
        <div class="direct-chat-infos clearfix mt-2">
            <span class="direct-chat-name float-left">${data.phone || 'Player'} ${idProduct}</span>
        </div>
        <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
        <div class="direct-chat-text" style="background-color: #1eb93d"> ${pos}Join ${betLabel}${mult} ₹${money} </div>
        `; 
    });
    $('.direct-chat-msg').html(result);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

function messNewJoin3(datas) {
    let arr = ['b', 's', 'c', 'l', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let totals = {};
    arr.forEach(k => { totals[k] = 0; });
    let totalAll = 0;

    if (datas && Array.isArray(datas)) {
        datas.forEach((data) => {
            let betStr = String(data.bet || '').trim();
            let betMoney = Number(data.money || 0);
            totalAll += betMoney;

            if (arr.includes(betStr)) {
                totals[betStr] = (totals[betStr] || 0) + betMoney;
            } else {
                let digits = betStr.split('');
                let perDigit = digits.length > 0 ? (betMoney / digits.length) : 0;
                digits.forEach(d => {
                    if (totals[d] !== undefined) {
                        totals[d] += perDigit;
                    }
                });
            }
        });
    }

    arr.forEach(k => {
        let val = totals[k] || 0;
        $(`#${k}`).attr('totalMoney', val);
        $(`#${k}`).text('₹ ' + formatMoney(val.toFixed(2), ','));
    });
    $('#total_all').text('₹ ' + formatMoney(totalAll.toFixed(2), ',')).attr('totalMoney', totalAll);
}

function callListOrder() {
    let game = $('html').attr('data-change') || "1";
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/5d/listOrders",
        data: {
            gameJoin: game,
        },
        dataType: "json",
        success: function (response) {
            if (response && response.status) {
                showListOrder(response.data.gameslist);
                messNewJoin2(response.bet);
                messNewJoin3(response.bet);
                let settings = (response.settings && response.settings[0]) || {};
                let nextRes = 'Random';
                if (game == 1 && settings.k5d && settings.k5d != '-1') nextRes = settings.k5d;
                if (game == 3 && settings.k5d3 && settings.k5d3 != '-1') nextRes = settings.k5d3;
                if (game == 5 && settings.k5d5 && settings.k5d5 != '-1') nextRes = settings.k5d5;
                if (game == 10 && settings.k5d10 && settings.k5d10 != '-1') nextRes = settings.k5d10;
                
                $('#ketQua').text('next result: ' + nextRes);
                $(".reservation-chunk-sub-num").text(response.period || '-');
            }
            $('#preloader').fadeOut(0);
        }
    });
}

callListOrder();

// Real-time polling fallback every 2 seconds
setInterval(callListOrder, 2000);

socket.on("data-server-5d", function (msg) {
    if (msg) {
        callListOrder();
    }
});

socket.on("data-server-5", function (msg) {
    let game = $('html').attr('data-change');
    if (msg && msg.game == game) {
        callListOrder();
    }
});

$('#manage .col-12').click(async function (e) { 
    e.preventDefault();
    $('#preloader').fadeIn(0);
    let game = $(this).attr('data');
    $('html').attr('data-change', game);
    await callListOrder();
    $('#manage .col-12').removeClass('block-click');
    $(this).addClass('block-click');
    $('#manage .col-12').find('.info-box-content').removeClass('active-game');
    $(this).find('.info-box-content').addClass('active-game');
});