/**
 * DiuWin - Simple & Reliable Floating Toast Win/Loss System (Option 1)
 * Ultra-lightweight, 0 external dependencies, works on all devices and browsers.
 */

(function () {
  'use strict';

  var seenSettledBets = new Set();
  var isInitialFetch = true;
  var activeToastTimer = null;
  var isPollingActive = false;

  // Format currency with commas
  function formatMoney(num) {
    return Number(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Ensure toast container exists
  function getOrCreateContainer() {
    var container = document.getElementById('game-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'game-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  // Show floating toast banner
  function showFloatingToast(type, options) {
    options = options || {};
    var container = getOrCreateContainer();

    // Remove any existing toast
    container.innerHTML = '';
    if (activeToastTimer) {
      clearTimeout(activeToastTimer);
      activeToastTimer = null;
    }

    var isWin = (type === 'win');
    var icon = isWin ? '🏆' : '💔';
    var title = isWin 
      ? '🎉 Won <span class="toast-amount">+₹' + formatMoney(options.amount) + '</span>'
      : '💔 Result: <span class="toast-amount">-₹' + formatMoney(options.amount) + '</span>';
    
    var subtitle = (options.game ? options.game + ' | ' : '') + 'Period #' + (options.period || '-');

    var toast = document.createElement('div');
    toast.className = 'game-toast ' + (isWin ? 'toast-win' : 'toast-loss');
    toast.innerHTML = `
      <div class="toast-icon-box">${icon}</div>
      <div class="toast-content-box">
        <div class="toast-title">${title}</div>
        <div class="toast-subtitle">${subtitle}</div>
      </div>
      <div class="toast-close-btn">&times;</div>
    `;

    container.appendChild(toast);

    // Trigger slide-down animation
    requestAnimationFrame(function () {
      toast.classList.add('toast-show');
    });

    function dismissToast() {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 450);
    }

    toast.onclick = dismissToast;

    // Auto-dismiss after 5.5 seconds for win, 4 seconds for loss
    activeToastTimer = setTimeout(dismissToast, isWin ? 5500 : 4000);
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

        // Trigger toast for newly resolved rounds
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
            showFloatingToast('win', { amount: totalWin, period: stage, game: ep.game });
          } else if (totalLoss > 0) {
            showFloatingToast('loss', { amount: totalLoss, period: stage, game: ep.game });
          }
        });
      },
      error: function() {
        isPollingActive = false;
      }
    });
  }

  // Active interval check every 2 seconds (independent of WebSocket)
  setInterval(checkActiveBetSettlement, 2000);
  setTimeout(checkActiveBetSettlement, 600);

  // Testing helpers
  function testWinModal(amount) {
    showFloatingToast('win', {
      amount: amount || 196.00,
      period: '202608270498',
      game: 'Win Go 1Min'
    });
  }

  function testLossModal(amount) {
    showFloatingToast('loss', {
      amount: amount || 100.00,
      period: '202608270498',
      game: 'Win Go 1Min'
    });
  }

  // Global exports with spelling aliases
  window.checkAndShowGameResult = checkActiveBetSettlement;
  window.showFloatingToast = showFloatingToast;
  window.testWinModal = testWinModal;
  window.testLossModal = testLossModal;
  window.testWinModel = testWinModal;
  window.testLossModel = testLossModal;
  window.triggerBetCheck = checkActiveBetSettlement;
})();
