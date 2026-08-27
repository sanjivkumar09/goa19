/**
 * DiuWin / Raja Club Official Receipt Win & Loss Modal (Pixel-Perfect Match)
 */

(function () {
  'use strict';

  var seenSettledBets = new Set();
  var isInitialFetch = true;
  var autoCloseTimer = null;
  var autoCloseInterval = null;
  var isPollingActive = false;

  function formatMoney(num) {
    return Number(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function closeReceiptModal() {
    var overlay = document.getElementById('diuwin-receipt-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    if (autoCloseInterval) {
      clearInterval(autoCloseInterval);
      autoCloseInterval = null;
    }
  }

  // Bind close buttons
  document.addEventListener('DOMContentLoaded', function() {
    var closeBtn = document.getElementById('diuwin-modal-close-btn');
    if (closeBtn) closeBtn.onclick = closeReceiptModal;

    var overlay = document.getElementById('diuwin-receipt-overlay');
    if (overlay) {
      overlay.onclick = function(e) {
        if (e.target === overlay) closeReceiptModal();
      };
    }
  });

  function showOfficialReceipt(type, options) {
    options = options || {};
    var isWin = (type === 'win');

    var overlay = document.getElementById('diuwin-receipt-overlay');
    var card = document.getElementById('diuwin-receipt-card');
    var title = document.getElementById('diuwin-modal-title');
    var badgeColor = document.getElementById('badge-color');
    var badgeNum = document.getElementById('badge-num');
    var badgeSize = document.getElementById('badge-size');
    var resultText = document.getElementById('receipt-result-text');
    var amountText = document.getElementById('receipt-amount-text');
    var periodText = document.getElementById('receipt-period-text');
    var autoCloseText = document.getElementById('auto-close-text');

    if (!overlay || !card) return;

    if (isWin) {
      card.className = 'diuwin-modal-card win-card';
      title.innerText = 'Congratulations';
      resultText.innerText = 'Bonus';
      amountText.innerText = '+ ₹ ' + formatMoney(options.amount);
      amountText.style.display = 'block';
    } else {
      card.className = 'diuwin-modal-card loss-card';
      title.innerText = 'Sorry';
      resultText.innerText = 'Lose';
      amountText.style.display = 'none';
    }

    // Set badges if available
    var num = options.resultNum !== undefined ? options.resultNum : (isWin ? '6' : '2');
    badgeNum.innerText = num;
    var isNumOdd = (parseInt(num, 10) % 2 !== 0);
    badgeColor.innerText = (num == '0' || num == '5') ? 'Violet' : (isNumOdd ? 'Green' : 'Red');
    badgeColor.className = 'lottery-badge ' + ((num == '0' || num == '5') ? 'badge-violet' : (isNumOdd ? 'badge-green' : 'badge-red'));
    badgeSize.innerText = (parseInt(num, 10) >= 5) ? 'Big' : 'Small';

    periodText.innerText = 'Period: ' + (options.period || '202608270045');

    // Auto-close countdown (3, 2, 1...)
    var secondsLeft = 3;
    autoCloseText.innerText = secondsLeft + ' seconds auto close';

    if (autoCloseInterval) clearInterval(autoCloseInterval);
    autoCloseInterval = setInterval(function() {
      secondsLeft--;
      if (secondsLeft > 0) {
        autoCloseText.innerText = secondsLeft + ' seconds auto close';
      }
    }, 1000);

    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(closeReceiptModal, 3600);

    overlay.classList.add('active');
  }

  function getCurrentGameEndpoint() {
    var path = window.location.pathname;
    if (path.indexOf('/5d') !== -1) {
      var dpr5d = $('html').attr('data-dpr') || '1';
      return {
        url: '/api/webapi/5d/GetMyEmerdList',
        data: { gameJoin: dpr5d, pageno: '0', pageto: '10' },
        game: '5D ' + dpr5d + 'Min'
      };
    }
    if (path.indexOf('/k3') !== -1) {
      var dprK3 = $('html').attr('data-dpr') || '1';
      return {
        url: '/api/webapi/k3/GetMyEmerdList',
        data: { gameJoin: dprK3, pageno: '0', pageto: '10' },
        game: 'K3 ' + dprK3 + 'Min'
      };
    }

    // Win Go
    var typeid = '1';
    var gameName = 'Win Go 1Min';
    if ($('.betting-box .nav .item:eq(1)').hasClass('action')) {
      typeid = '3';
      gameName = 'Win Go 3Min';
    } else if ($('.betting-box .nav .item:eq(2)').hasClass('action')) {
      typeid = '5';
      gameName = 'Win Go 5Min';
    } else if ($('.betting-box .nav .item:eq(3)').hasClass('action')) {
      typeid = '10';
      gameName = 'Win Go 10Min';
    }

    return {
      url: '/api/webapi/GetMyEmerdList',
      data: { typeid: typeid, pageno: '0', pageto: '10', language: 'vi' },
      game: gameName
    };
  }

  function checkActiveBetSettlement() {
    if (isPollingActive) return;
    isPollingActive = true;
    var ep = getCurrentGameEndpoint();

    $.ajax({
      type: "POST",
      url: ep.url,
      data: ep.data,
      dataType: "json",
      success: function(resp) {
        isPollingActive = false;
        if (!resp || !resp.data || !Array.isArray(resp.data.gameslist)) return;
        var list = resp.data.gameslist;
        if (list.length === 0) return;

        // On first page load: Seed existing history silently
        if (isInitialFetch) {
          isInitialFetch = false;
          list.forEach(function(b) {
            var st = parseInt(b.status, 10);
            var id = String(b.id_product || b.id || b.stage || '');
            if (st !== 0 && id) {
              seenSettledBets.add(id);
            }
          });
          return;
        }

        // Check for new settled bets
        var newlySettled = {};
        list.forEach(function(b) {
          var st = parseInt(b.status, 10);
          var id = String(b.id_product || b.id || b.stage || '');
          var stage = String(b.stage || b.period || '').trim();

          if (st !== 0 && id && !seenSettledBets.has(id)) {
            seenSettledBets.add(id);
            if (!newlySettled[stage]) {
              newlySettled[stage] = [];
            }
            newlySettled[stage].push(b);
          }
        });

        // Trigger official receipt for newly resolved rounds
        Object.keys(newlySettled).forEach(function(stage) {
          var bets = newlySettled[stage];
          var totalWin = 0;
          var totalLoss = 0;
          var isWin = false;

          bets.forEach(function(b) {
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

          if (isWin && totalWin > 0) {
            showOfficialReceipt('win', { amount: totalWin, period: stage, game: ep.game });
          } else if (totalLoss > 0) {
            showOfficialReceipt('loss', { amount: totalLoss, period: stage, game: ep.game });
          }
        });
      },
      error: function() {
        isPollingActive = false;
      }
    });
  }

  // Active check every 1.5 seconds
  setInterval(checkActiveBetSettlement, 1500);
  setTimeout(checkActiveBetSettlement, 500);

  // Testing helpers
  function testWinModal(amount) {
    showOfficialReceipt('win', {
      amount: amount || 196.00,
      period: '202608270045',
      resultNum: '6'
    });
  }

  function testLossModal(amount) {
    showOfficialReceipt('loss', {
      amount: amount || 100.00,
      period: '202608270045',
      resultNum: '2'
    });
  }

  window.showOfficialReceipt = showOfficialReceipt;
  window.showFloatingToast = showOfficialReceipt;
  window.testWinModal = testWinModal;
  window.testLossModal = testLossModal;
  window.testWinModel = testWinModal;
  window.testLossModel = testLossModal;
  window.triggerBetCheck = checkActiveBetSettlement;
  window.closeReceiptModal = closeReceiptModal;
})();
