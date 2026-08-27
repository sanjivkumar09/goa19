socket.on("data-server-k3", function (msg) {
    if (msg) {
        let checkData = $('html').attr('data-dpr');
        if (checkData == msg.game) {
            pageno = 0;
            limit = 10;
            page = 1;
            let notResult = msg.data[0];
            let Result = msg.data[1];
            let check = $('#number_result').attr('data-select');
            if (check == 'all') {
                reload_money();
                callListOrder();
                RenderResult(Result.result);
            } else {
                reload_money();
                callAjaxMeJoin();
                RenderResult(Result.result);
            }
            $('#period').text(notResult.period);
            $("#previous").addClass("block-click");
            $("#previous").removeClass("action");
            $("#previous .van-icon-arrow").css("color", "#7f7f7f");
            $("#next").removeClass("block-click");
            $("#next").addClass("action");
            $("#next .van-icon-arrow").css("color", "#fff");

            $.ajax({
                type: "POST",
                url: "/api/webapi/k3/GetMyEmerdList",
                data: {
                    gameJoin: $('html').attr('data-dpr'),
                    pageno: "0",
                    pageto: "10",
                },
                dataType: "json",
                success: function (response) {
                    let data = response.data.gameslist;
                    if (window.checkAndShowGameResult && Result) {
                        window.checkAndShowGameResult('k3' + msg.game, Result.period, Result.result, data);
                    }
                }
            });
        }
    }
});

function ShowListOrder(list_orders) {
    if (list_orders.length == 0) {
        return $(`#list_order`).html(
            `
            <div data-v-a9660e98="" class="van-empty">
                <div class="van-empty__image">
                    <img src="/images/empty-image-default.png" />
                </div>
                <p class="van-empty__description">No data</p>
            </div>
            `
        );
    }
    let htmls = "";
    let result = list_orders.map((list_orders) => {
        let total = String(list_orders.result).split('');
        let total2 = 0;
        for (let i = 0; i < total.length; i++) {
            total2 += Number(total[i]);
        }

        let html2 = '';
        for (let i = 0; i < total.length; i++) {
            html2 += `
                <div data-v-03b808c2="" class="li img${total[i]}"></div>
            `;
        }

        return (htmls += `
            <div data-v-03b808c2="" class="c-tc item van-row">
                <div data-v-03b808c2="" class="van-col van-col--6">
                    <div data-v-03b808c2="" class="c-tc goItem lh">${list_orders.period}</div>
                </div>
                <div data-v-03b808c2="" class="van-col van-col--4">
                    <div data-v-03b808c2="" class="c-tc goItem lh"> ${total2} </div>
                </div>
                <div data-v-03b808c2="" class="van-col van-col--5">
                    <div data-v-03b808c2="" class="c-tc goItem lh">
                        <div data-v-03b808c2="">${(total2 >= 3 && total2 <= 10) ? "Small" : "Big"}</div>
                    </div>
                </div>
                <div data-v-03b808c2="" class="van-col van-col--4">
                    <div data-v-03b808c2="" class="c-tc goItem lh">
                        <div data-v-03b808c2="">${(total2 % 2 == 0) ? "Even" : "Odd"}</div>
                    </div>
                </div>
                <div data-v-03b808c2="" class="van-col van-col--5">
                    <div data-v-03b808c2="" class="goItem c-row c-tc c-row-between c-row-middle">
                        ${html2}
                    </div>
                </div>
            </div>
        `);
    });
    $(`#list_order`).html(htmls);
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

var lastSeenK3Stage = null;
var isFirstLoadK3 = true;

function displayGameResultNotice(list_orders) {
    if (!list_orders || list_orders.length === 0) return;
    var topBet = list_orders[0];
    var stage = String(topBet.stage || topBet.period || '');
    var status = parseInt(topBet.status, 10);

    if (status === 0) return;

    if (isFirstLoadK3) {
        isFirstLoadK3 = false;
        lastSeenK3Stage = stage;
        return;
    }

    if (lastSeenK3Stage === stage) return;
    lastSeenK3Stage = stage;

    var stageBets = list_orders.filter(function(b) {
        return String(b.stage || b.period || '') === stage;
    });

    var totalWin = 0;
    var totalLoss = 0;
    var isWin = false;

    stageBets.forEach(function(b) {
        var st = parseInt(b.status, 10);
        var money = parseFloat(b.money || b.price || 0);
        var get = parseFloat(b.get || 0);
        if (st === 1) {
            isWin = true;
            totalWin += (get > 0 ? get : money * 2);
        } else if (st === 2) {
            totalLoss += money;
        }
    });

    $(".game-win-loss-banner").remove();

    if (isWin && totalWin > 0) {
        $("body").append(`
            <div class="game-win-loss-banner" style="position: fixed; top: 35%; left: 50%; transform: translate(-50%, -50%); z-index: 2147483647; width: 88%; max-width: 320px; text-align: center; pointer-events: none;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); border: 2.5px solid #fde047; box-shadow: 0 15px 40px rgba(0,0,0,0.7), 0 0 25px rgba(250,204,21,0.5); border-radius: 20px; padding: 20px 16px; color: #fff;">
                    <div style="font-size: 36px; line-height: 1;">👑 🎉 🏆</div>
                    <div style="font-size: 24px; font-weight: 900; color: #fff; margin-top: 6px; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">YOU WON!</div>
                    <div style="font-size: 32px; font-weight: 900; color: #fef08a; margin: 8px 0; text-shadow: 0 0 12px rgba(254,240,138,0.8);">+ ₹ ${Number(totalWin).toFixed(2)}</div>
                    <div style="font-size: 13px; color: #f1f5f9; font-weight: 600;">K3 Lotre | Period #${stage}</div>
                </div>
            </div>
        `);
    } else if (totalLoss > 0) {
        $("body").append(`
            <div class="game-win-loss-banner" style="position: fixed; top: 35%; left: 50%; transform: translate(-50%, -50%); z-index: 2147483647; width: 88%; max-width: 320px; text-align: center; pointer-events: none;">
                <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #ef4444; box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(239,68,68,0.3); border-radius: 20px; padding: 20px 16px; color: #fff;">
                    <div style="font-size: 32px; line-height: 1;">💔</div>
                    <div style="font-size: 22px; font-weight: 900; color: #f87171; margin-top: 6px;">YOU LOST</div>
                    <div style="font-size: 28px; font-weight: 900; color: #fca5a5; margin: 8px 0;">- ₹ ${Number(totalLoss).toFixed(2)}</div>
                    <div style="font-size: 13px; color: #94a3b8; font-weight: 600;">K3 Lotre | Period #${stage}</div>
                </div>
            </div>
        `);
    }

    setTimeout(function() {
        $(".game-win-loss-banner").fadeOut(500, function() {
            $(this).remove();
        });
    }, 5000);
}

window.testWinModal = function(amount) {
  $(".game-win-loss-banner").remove();
  $("body").append(`
    <div class="game-win-loss-banner" style="position: fixed; top: 35%; left: 50%; transform: translate(-50%, -50%); z-index: 2147483647; width: 88%; max-width: 320px; text-align: center; pointer-events: none;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); border: 2.5px solid #fde047; box-shadow: 0 15px 40px rgba(0,0,0,0.7), 0 0 25px rgba(250,204,21,0.5); border-radius: 20px; padding: 20px 16px; color: #fff;">
        <div style="font-size: 36px; line-height: 1;">👑 🎉 🏆</div>
        <div style="font-size: 24px; font-weight: 900; color: #fff; margin-top: 6px; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">YOU WON!</div>
        <div style="font-size: 32px; font-weight: 900; color: #fef08a; margin: 8px 0; text-shadow: 0 0 12px rgba(254,240,138,0.8);">+ ₹ ${(amount || 196).toFixed(2)}</div>
        <div style="font-size: 13px; color: #f1f5f9; font-weight: 600;">K3 Lotre | Period #202608270045</div>
      </div>
    </div>
  `);
  setTimeout(function() {
    $(".game-win-loss-banner").fadeOut(500, function() { $(this).remove(); });
  }, 5000);
};

window.testLossModal = function(amount) {
  $(".game-win-loss-banner").remove();
  $("body").append(`
    <div class="game-win-loss-banner" style="position: fixed; top: 35%; left: 50%; transform: translate(-50%, -50%); z-index: 2147483647; width: 88%; max-width: 320px; text-align: center; pointer-events: none;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #ef4444; box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(239,68,68,0.3); border-radius: 20px; padding: 20px 16px; color: #fff;">
        <div style="font-size: 32px; line-height: 1;">💔</div>
        <div style="font-size: 22px; font-weight: 900; color: #f87171; margin-top: 6px;">YOU LOST</div>
        <div style="font-size: 28px; font-weight: 900; color: #fca5a5; margin: 8px 0;">- ₹ ${(amount || 100).toFixed(2)}</div>
        <div style="font-size: 13px; color: #94a3b8; font-weight: 600;">Period #202608270045</div>
      </div>
    </div>
  `);
  setTimeout(function() {
    $(".game-win-loss-banner").fadeOut(500, function() { $(this).remove(); });
  }, 5000);
};
window.testWinModel = window.testWinModal;
window.testLossModel = window.testLossModal;

function GetMyEmerdList(list_orders) {
    if (list_orders && list_orders.length > 0) {
        displayGameResultNotice(list_orders);
    }
    if (list_orders.length == 0) {
        return $(`#list_order`).html(
            `
            <div data-v-a9660e98="" class="van-empty">
                <div class="van-empty__image">
                    <img src="/images/empty-image-default.png" />
                </div>
                <p class="van-empty__description">No Data</p>
            </div>
            `
        );
    }
    let htmls = "";
    let result = list_orders.map((list_order) => {
        return (htmls += `
            <div data-v-03b808c2="">
                <div data-v-03b808c2="" class="item c-row">
                    <div data-v-03b808c2="" class="c-row c-row-between c-row-middle info">
                        <div data-v-03b808c2="">
                            <div data-v-03b808c2="" class="issueName">
                                ${list_order.stage}
                                <!---->
                                <span data-v-03b808c2="" class="state ${(list_order.status == 1) ? 'green' : 'red'} ${(list_order.status == 0) ? 'd-none' : ''}">${(list_order.status == 1) ? 'Success' : 'Failed'}</span>
                            </div>
                            <div data-v-03b808c2="" class="tiem">${timerJoin(list_order.time)}</div>
                        </div>
                        <div data-v-03b808c2="" class="money ${(list_order.status == 0) ? 'd-none' : ''}">
                            <!---->
                            <span data-v-03b808c2="" class="${(list_order.status == 1) ? 'Success' : 'Failed'}"> ${(list_order.status == 1) ? '+' : '-'}${(list_order.status == 1) ? list_order.get : list_order.price}.00 </span>
                        </div>
                    </div>
                </div>
                <!---->
            </div>    
        `);
    });
    $(`#list_order`).html(htmls);
}

function callListOrder() {
    $.ajax({
        type: "POST",
        url: "/api/webapi/k3/GetNoaverageEmerdList",
        data: {
            gameJoin: $('html').attr('data-dpr'),
            pageno: "0",
            pageto: "10",
        },
        dataType: "json",
        success: function (response) {
            let list_orders = response.data.gameslist;
            $("#period").text(response.period);
            $("#number_result").text("1/" + response.page);
            ShowListOrder(list_orders);
            $('.Loading').fadeOut(0);
            let result = String(list_orders[0].result).split('');
            $('.slot-transform:eq(0) .slot-num').attr('class', `slot-num bg${result[0]}`);
            $('.slot-transform:eq(1) .slot-num').attr('class', `slot-num bg${result[1]}`);
            $('.slot-transform:eq(2) .slot-num').attr('class', `slot-num bg${result[2]}`);
        },
    });
}

callListOrder();

function callAjaxMeJoin() {
    $.ajax({
        type: "POST",
        url: "/api/webapi/k3/GetMyEmerdList",
        data: {
            gameJoin: $('html').attr('data-dpr'),
            pageno: "0",
            pageto: "10",
        },
        dataType: "json",
        success: function (response) {
            let data = response.data.gameslist;
            $("#number_result").text("1/" + response.page);
            GetMyEmerdList(data);
            $('.Loading').fadeOut(0);
            if (window.checkAndShowGameResult && data && data.length > 0 && data[0].status != 0) {
                window.checkAndShowGameResult('k3' + $('html').attr('data-dpr'), data[0].stage, data[0].result, data);
            }
        },
    });
}


$('#history').click(function (e) { 
    e.preventDefault();
    callListOrder();
    $('.header-history').removeClass('d-none');
    $(this).addClass('block-click action');
    $('#myBet').removeClass('block-click action');
    $('#number_result').attr('data-select', 'all');
    pageno = 0;
    limit = 10;
    page = 1;
    $("#next").removeClass("block-click");
    $("#next").addClass("action");
    $("#next .van-icon-arrow").css("color", "#fff");
    $("#previous").addClass("block-click");
    $("#previous").removeClass("action");
    $("#previous .van-icon-arrow-left").css("color", "#7f7f7f");
});

$('#myBet').click(function (e) { 
    e.preventDefault();
    callAjaxMeJoin();
    $('.header-history').addClass('d-none');
    $(this).addClass('block-click action');
    $('#history').removeClass('block-click action');
    $('#number_result').attr('data-select', 'mybet');
    pageno = 0;
    limit = 10;
    page = 1;
    $("#next").removeClass("block-click");
    $("#next").addClass("action");
    $("#next .van-icon-arrow").css("color", "#fff");
    $("#previous").addClass("block-click");
    $("#previous").removeClass("action");
    $("#previous .van-icon-arrow-left").css("color", "#7f7f7f");
});


var pageno = 0;
var limit = 10;
var page = 1;
$("#next").click(function (e) {
    e.preventDefault();
    let check = $('#number_result').attr('data-select');
    $('.Loading').fadeIn(0);
    $("#previous").removeClass("block-click");
    $("#previous").addClass("action");
    $("#previous .van-icon-arrow-left").css("color", "#fff");
    pageno += 10;
    let pageto = limit;
    let url = '';
    if (check == 'all') {
        url = "/api/webapi/k3/GetNoaverageEmerdList";
    } else {
        url = "/api/webapi/k3/GetMyEmerdList";
    }
    $.ajax({
        type: "POST",
        url: url,
        data: {
            gameJoin: $('html').attr('data-dpr'),
            pageno: pageno,
            pageto: pageto,
        },
        dataType: "json",
        success: async function (response) {
            $('.Loading').fadeOut(0);
            if (response.status === false) {
                pageno -= 10;
                $("#next").addClass("block-click");
                $("#next").removeClass("action");
                $("#next .van-icon-arrow").css("color", "#7f7f7f");
                alertMess(response.msg);
                return false;
            }
            let list_orders = response.data.gameslist;
            $("#period").text(response.period);
            $("#number_result").text(++page + "/" + response.page);
            if (check == 'all') {
                ShowListOrder(list_orders);
            } else {
                GetMyEmerdList(list_orders);
            }
        },
    });
});
$("#previous").click(function (e) {
    e.preventDefault();
    let check = $('#number_result').attr('data-select');
    $('.Loading').fadeIn(0);
    $("#next").removeClass("block-click");
    $("#next").addClass("action");
    $("#next .van-icon-arrow").css("color", "#fff");
    pageno -= 10;
    let pageto = limit;
    let url = '';
    if (check == 'all') {
        url = "/api/webapi/k3/GetNoaverageEmerdList";
    } else {
        url = "/api/webapi/k3/GetMyEmerdList";
    }
    $.ajax({
        type: "POST",
        url: url,
        data: {
            gameJoin: $('html').attr('data-dpr'),
            pageno: pageno,
            pageto: pageto,
        },
        dataType: "json",
        success: async function (response) {
            $('.Loading').fadeOut(0);
            if (page - 1 < 2) {
                $("#previous").addClass("block-click");
                $("#previous").removeClass("action");
                $("#previous .van-icon-arrow-left").css("color", "#7f7f7f");
            }
            if (response.status === false) {
                pageno = 0;
                $("#previous .arr:eq(0)").addClass("block-click");
                $("#previous .arr:eq(0)").removeClass("action");
                $("#previous .van-icon-arrow-left").css("color", "#7f7f7f");
                alertMess(response.msg);
                return false;
            }
            let list_orders = response.data.gameslist;
            $("#period").text(response.period);
            $("#number_result").text(--page + "/" + response.page);
            if (check == 'all') {
                ShowListOrder(list_orders);
            } else {
                GetMyEmerdList(list_orders);
            }
        },
    });
});
