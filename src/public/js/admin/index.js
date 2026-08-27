
var socket = io();
let typeid = $('html').attr('data-change');
let game = '';
if (typeid == '1') game = 'wingo';
if (typeid == '2') game = 'wingo3';
if (typeid == '3') game = 'wingo5';
if (typeid == '4') game = 'wingo10';
$(`.container-fluid:eq(1) .row:eq(0) .info-box-content:eq(${Number(typeid) - 1}) .info-box-text`).css('color', '#e67e22');

function formatMoney(money, type) {
    return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${type}`);
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
const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
}

function formatPeriodDate(period) {
    if (!period) return '';
    return String(period);
}

function getWinGoGrossStake(data) {
    if (!data) return 0;
    return Number(data.money || 0) + Number(data.fee || 0);
}

function showJoinMember(data) {
    let phone = data.phone || 'Player';
    let bet = data.bet;
    let grossMoney = getWinGoGrossStake(data);
    let money = formatMoney(grossMoney, ',');
    let time = timerJoin(data.time);
    let idProduct = data.id_product ? `[#${data.id_product}] ` : '';
    let stage = data.stage ? `(Period ${data.stage}) ` : '';
    let result = '';
    result += `
      <div class="direct-chat-infos clearfix mt-2">
        <span class="direct-chat-name float-left">${phone} ${idProduct}</span>
        <span class="direct-chat-timestamp float-right text-primary">${time}</span>
      </div>
      <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
      <div class="direct-chat-text" style="background-color: ${(isNumber(bet)) ? '#007acc' : (bet == 'x') ? '#1eb93d' : (bet == 'd') ? '#f52828' : (bet == 't') ? '#ea3af0' : (bet == 'l') ? '#ffc511' : '#5cba47'}">
        ${stage}Join ${((isNumber(bet)) ? bet : (bet == 'd') ? 'Red' : (bet == 'x') ? 'Green' : (bet == 't') ? 'Violet' : (bet == 'l') ? 'Big' : 'Small')} ₹${money}
      </div>`;
    $('.direct-chat-msg').append(result);
}

function showJoinMember2(data) {
    if (data.change == 1) return;
    let bet = data.join;
    let money = formatMoney(data.money, ',');
    let time = timerJoin(data.time);
    let result = '';
    result += `
      <div class="direct-chat-infos clearfix mt-2">
        <span class="direct-chat-name float-left">Live Bet</span>
        <span class="direct-chat-timestamp float-right text-primary">${time}</span>
      </div>
      <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
      <div class="direct-chat-text" style="background-color: ${(isNumber(bet)) ? '#007acc' : (bet == 'x') ? '#1eb93d' : (bet == 'd') ? '#f52828' : (bet == 't') ? '#ea3af0' : (bet == 'l') ? '#ffc511' : '#5cba47'}">
        Join ${((isNumber(bet)) ? bet : (bet == 'd') ? 'Red' : (bet == 'x') ? 'Green' : (bet == 't') ? 'Violet' : (bet == 'l') ? 'Big' : 'Small')} ₹${money}
      </div>`;
    $('.direct-chat-msg').append(result);
}


socket.on("data-server_2", function (msg) {
    showJoinMember2(msg);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
    if (msg.level == 1) return;
    var red = Number($('.orderRed').attr('totalmoney') || 0);
    var violet = Number($('.orderViolet').attr('totalmoney') || 0);
    var green = Number($('.orderGreen').attr('totalmoney') || 0);
    var n0 = Number($('.orderNumber:eq(0)').attr('totalmoney') || 0);
    var n1 = Number($('.orderNumber:eq(1)').attr('totalmoney') || 0);
    var n2 = Number($('.orderNumber:eq(2)').attr('totalmoney') || 0);
    var n3 = Number($('.orderNumber:eq(3)').attr('totalmoney') || 0);
    var n4 = Number($('.orderNumber:eq(4)').attr('totalmoney') || 0);
    var n5 = Number($('.orderNumber:eq(5)').attr('totalmoney') || 0);
    var n6 = Number($('.orderNumber:eq(6)').attr('totalmoney') || 0);
    var n7 = Number($('.orderNumber:eq(7)').attr('totalmoney') || 0);
    var n8 = Number($('.orderNumber:eq(8)').attr('totalmoney') || 0);
    var n9 = Number($('.orderNumber:eq(9)').attr('totalmoney') || 0);
    var l = Number($('.orderNumber:eq(10)').attr('totalmoney') || 0); // Big
    var n = Number($('.orderNumber:eq(11)').attr('totalmoney') || 0); // Small

    var betStake = Number(msg.money || 0);

    if (msg.join == '0') n0 += betStake;
    if (msg.join == '1') n1 += betStake;
    if (msg.join == '2') n2 += betStake;
    if (msg.join == '3') n3 += betStake;
    if (msg.join == '4') n4 += betStake;
    if (msg.join == '5') n5 += betStake;
    if (msg.join == '6') n6 += betStake;
    if (msg.join == '7') n7 += betStake;
    if (msg.join == '8') n8 += betStake;
    if (msg.join == '9') n9 += betStake;
    if (msg.join == 'x') green += betStake;
    if (msg.join == 't') violet += betStake;
    if (msg.join == 'd') red += betStake;
    if (msg.join == 'l') l += betStake;
    if (msg.join == 'n') n += betStake;

    var totalVolume = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9 + red + green + violet + l + n;

    $('.orderRed').text(formatMoney(red, ',')).attr('totalmoney', red);
    $('.orderViolet').text(formatMoney(violet, ',')).attr('totalmoney', violet);
    $('.orderGreen').text(formatMoney(green, ',')).attr('totalmoney', green);
    $('.orderNumber:eq(0)').text(formatMoney(n0, ',')).attr('totalmoney', n0);
    $('.orderNumber:eq(1)').text(formatMoney(n1, ',')).attr('totalmoney', n1);
    $('.orderNumber:eq(2)').text(formatMoney(n2, ',')).attr('totalmoney', n2);
    $('.orderNumber:eq(3)').text(formatMoney(n3, ',')).attr('totalmoney', n3);
    $('.orderNumber:eq(4)').text(formatMoney(n4, ',')).attr('totalmoney', n4);
    $('.orderNumber:eq(5)').text(formatMoney(n5, ',')).attr('totalmoney', n5);
    $('.orderNumber:eq(6)').text(formatMoney(n6, ',')).attr('totalmoney', n6);
    $('.orderNumber:eq(7)').text(formatMoney(n7, ',')).attr('totalmoney', n7);
    $('.orderNumber:eq(8)').text(formatMoney(n8, ',')).attr('totalmoney', n8);
    $('.orderNumber:eq(9)').text(formatMoney(n9, ',')).attr('totalmoney', n9);
    $('.orderNumber:eq(10)').text(formatMoney(l, ',')).attr('totalmoney', l); // Big
    $('.orderNumber:eq(11)').text(formatMoney(n, ',')).attr('totalmoney', n); // Small
    $('.orderNumbers').text(formatMoney(totalVolume, ',')).attr('totalmoney', totalVolume);
});

function calculateAndRenderWinGoStats(response) {
    var red = 0;
    var green = 0;
    var violet = 0;
    var n0 = 0;
    var n1 = 0;
    var n2 = 0;
    var n3 = 0;
    var n4 = 0;
    var n5 = 0;
    var n6 = 0;
    var n7 = 0;
    var n8 = 0;
    var n9 = 0;
    var l = 0; // Big
    var n = 0; // Small
    var totalVolume = 0;

    var datas = (response && Array.isArray(response.datas)) ? response.datas : [];
    for (let i = 0; i < datas.length; i++) {
        let stake = getWinGoGrossStake(datas[i]);
        let bet = String(datas[i].bet || '').trim();

        if (bet === '0') n0 += stake;
        else if (bet === '1') n1 += stake;
        else if (bet === '2') n2 += stake;
        else if (bet === '3') n3 += stake;
        else if (bet === '4') n4 += stake;
        else if (bet === '5') n5 += stake;
        else if (bet === '6') n6 += stake;
        else if (bet === '7') n7 += stake;
        else if (bet === '8') n8 += stake;
        else if (bet === '9') n9 += stake;
        else if (bet === 'x') green += stake;
        else if (bet === 't') violet += stake;
        else if (bet === 'd') red += stake;
        else if (bet === 'l') l += stake;
        else if (bet === 'n') n += stake;

        totalVolume += stake;
    }

    $('.orderRed').text(formatMoney(red, ',')).attr('totalmoney', red);
    $('.orderViolet').text(formatMoney(violet, ',')).attr('totalmoney', violet);
    $('.orderGreen').text(formatMoney(green, ',')).attr('totalmoney', green);
    $('.orderNumber:eq(0)').text(formatMoney(n0, ',')).attr('totalmoney', n0);
    $('.orderNumber:eq(1)').text(formatMoney(n1, ',')).attr('totalmoney', n1);
    $('.orderNumber:eq(2)').text(formatMoney(n2, ',')).attr('totalmoney', n2);
    $('.orderNumber:eq(3)').text(formatMoney(n3, ',')).attr('totalmoney', n3);
    $('.orderNumber:eq(4)').text(formatMoney(n4, ',')).attr('totalmoney', n4);
    $('.orderNumber:eq(5)').text(formatMoney(n5, ',')).attr('totalmoney', n5);
    $('.orderNumber:eq(6)').text(formatMoney(n6, ',')).attr('totalmoney', n6);
    $('.orderNumber:eq(7)').text(formatMoney(n7, ',')).attr('totalmoney', n7);
    $('.orderNumber:eq(8)').text(formatMoney(n8, ',')).attr('totalmoney', n8);
    $('.orderNumber:eq(9)').text(formatMoney(n9, ',')).attr('totalmoney', n9);
    $('.orderNumber:eq(10)').text(formatMoney(l, ',')).attr('totalmoney', l); // Big
    $('.orderNumber:eq(11)').text(formatMoney(n, ',')).attr('totalmoney', n); // Small
    $('.orderNumbers').text(formatMoney(totalVolume, ',')).attr('totalmoney', totalVolume);
}

socket.on("data-server", function (msg) {
    if (!msg || !msg.data || !msg.data[0] || msg.data[0].game != game) return;
    $(".direct-chat-msg").html('');
    $('.info-box-number').text('0');
    let data1 = msg.data[0];
    $(".reservation-chunk-sub-num").text(data1.period);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/totalJoin",
        data: {
            typeid: typeid,
        },
        dataType: "json",
        success: function (response) {
            calculateAndRenderWinGoStats(response);

            if (response.datas && response.datas.length > 0) {
                response.datas.map((data) => {
                    showJoinMember(data);
                });
            }
            if (response.list_orders) {
                showListOrder3(response.list_orders);
            }
            $(".direct-chat-warning .direct-chat-messages").animate({
                scrollTop: $(".direct-chat-msg").prop("scrollHeight")
            }, 750);
            if (response.lotterys && response.lotterys[0]) {
                $('.reservation-chunk-sub-num').text(response.lotterys[0].period);
            }
            if (response.setting && response.setting[0]) {
                if (typeid == '1') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo1 == '-1') ? 'Random' : response.setting[0].wingo1}`);
                if (typeid == '2') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo3 == '-1') ? 'Random' : response.setting[0].wingo3}`);
                if (typeid == '3') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo5 == '-1') ? 'Random' : response.setting[0].wingo5}`);
                if (typeid == '4') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo10 == '-1') ? 'Random' : response.setting[0].wingo10}`);
                
                let winRateText = response.setting[0].win_rate !== undefined ? response.setting[0].win_rate + '%' : '80%';
                $('#winrate').text(`Win Rate: ${winRateText}`);
            }
        }
    });
});

function showListOrder3(list_orders, x) {
    if (!list_orders || !Array.isArray(list_orders)) return;
    let htmls = "";
    list_orders.forEach((item) => {
        htmls += `
            <div data-v-a9660e98="" class="c-tc item van-row">
                <div data-v-a9660e98="" class="van-col van-col--12">
                    <div data-v-a9660e98="" class="c-tc goItem" style="font-size: 13px;">${formatPeriodDate(item.period)}</div>
                </div>
                <div data-v-a9660e98="" class="van-col van-col--4">
                    <div data-v-a9660e98="" class="c-tc goItem">
                        <span data-v-a9660e98="" class="${item.amount % 2 == 0 ? "red" : "green"}"> ${item.amount} </span>
                    </div>
                </div>
                <div data-v-a9660e98="" class="van-col van-col--4">
                    <div data-v-a9660e98="" class="c-tc goItem">
                        <span data-v-a9660e98=""> ${item.amount < 5 ? "Small" : "Big"} </span>
                    </div>
                </div>
                <div data-v-a9660e98="" class="van-col van-col--4">
                    <div data-v-a9660e98="" class="goItem c-row c-tc c-row-center">
                        <div data-v-a9660e98="" class="c-tc c-row box c-row-center">
                            <span data-v-a9660e98="" class="li ${item.amount % 2 == 0 ? "red" : "green"}"></span>
                            ${item.amount == 0 || item.amount == 5 ? '<span data-v-a9660e98="" class="li violet"></span>' : ""}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    $(`#list-orders`).html(htmls);
}

function refreshAdminData() {
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/totalJoin",
        data: {
            typeid: typeid,
        },
        dataType: "json",
        success: function (response) {
            calculateAndRenderWinGoStats(response);

            $('.direct-chat-msg').html('');
            if (response.datas && response.datas.length > 0) {
                response.datas.map((data) => {
                    showJoinMember(data);
                });
            } else {
                $('.direct-chat-msg').html(`
                    <div class="text-center py-5" style="color: #8c93a0;">
                        <i class="fas fa-coins fa-2x mb-3 text-warning d-block"></i>
                        <h6 class="font-weight-bold mb-1">Waiting for bets</h6>
                        <p class="small text-muted mb-0">No active bets placed yet for active round #${response.lotterys && response.lotterys[0]?.period || ''}</p>
                    </div>
                `);
            }
            if (response.list_orders) {
                showListOrder3(response.list_orders);
            }
            $(".direct-chat-warning .direct-chat-messages, .direct-chat-success .direct-chat-messages").animate({
                scrollTop: $(".direct-chat-msg").prop("scrollHeight")
            }, 750);
            if (response.lotterys && response.lotterys[0]) {
                $('.reservation-chunk-sub-num').text(response.lotterys[0].period);
            }
            if (response.setting && response.setting[0]) {
                if (typeid == '1') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo1 == '-1') ? 'Random' : response.setting[0].wingo1}`);
                if (typeid == '2') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo3 == '-1') ? 'Random' : response.setting[0].wingo3}`);
                if (typeid == '3') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo5 == '-1') ? 'Random' : response.setting[0].wingo5}`);
                if (typeid == '4') $('#ketQua').text(`Next Result: ${(response.setting[0].wingo10 == '-1') ? 'Random' : response.setting[0].wingo10}`);

                let winRateText2 = response.setting[0].win_rate !== undefined ? response.setting[0].win_rate + '%' : '80%';
                $('#winrate').text(`Win Rate: ${winRateText2}`);
            }
        }
    });
}

refreshAdminData();
setInterval(refreshAdminData, 1000);

$(document).on('click', '.btn-preset-number', function() {
    const num = $(this).data('num');
    $('#editResult').val(num);
});

$('.start-order').click(function (e) {
    e.preventDefault();
    let value = $('#editResult').val().trim(); 
    if (!value) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty result',
            text: 'Please choose or enter a result number (0-9 or Random)!',
        });
        return false;
    }
    if (value !== '-1' && value.toLowerCase() !== 'random') {
        let arr = value.split('|');
        for (let i = 0; i < arr.length; i++) {
            let check = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(String(arr[i]));
            if (arr[i] == "" || arr[i].length > 1 || !check) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Format',
                    text: 'Please enter single digit (0-9) or pipe-separated (e.g., 1|4|5) or select Random!',
                });
                return false;
            }
        }
    } else {
        value = '-1';
    }
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/change",
        data: {
            type: 'change-wingo1',
            value: value,
            typeid: typeid,
        },
        dataType: "json",
        success: function (response) {
            Swal.fire(
                'Success!',
                `${response.message || 'Next result updated successfully!'}`,
                'success'
            );
            $('#ketQua').text(`Next Result: ${value == '-1' ? 'Random' : value}`);
            $('#editResult').val('');
        }
    });
});

// $('.editWinRate').click(function (e) {
//     e.preventDefault();
//     let value = $('#editWinRate').val();
//     let arr = value.split('|');
//     for (let i = 0; i < arr.length; i++) {
//         if (arr[i] == "" || arr[i].length > 1 || arr[i] != 0 && arr[i] != '1') {
//             alert("Vui lòng nhập đúng định dạng (VD: 1|0|0|1|1)");
//             return false;
//         }
//     }
//     if (value != '') {
//         $.ajax({
//             type: "POST",
//             url: "/api/webapi/admin/change",
//             data: {
//                 type: 'change-win_rate',
//                 value: value,
//                 typeid: typeid,
//             },
//             dataType: "json",
//             success: function (response) {
//                 Swal.fire(
//                     'Good job!',
//                     `${response.message}`,
//                     'success'
//                 );
//                 $('#ketQua').text(`Next Result: ${value}`);
//             }
//         });
//     } else {
//         Swal.fire({
//             icon: 'error',
//             title: 'Oops...',
//             text: 'Something went wrong!',
//         })
//     }
// });