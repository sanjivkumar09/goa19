/**
 * DiuWin - Simple & Reliable Floating Toast Win/Loss System (Option 1)
 * Ultra-lightweight, 0 external dependencies, works on all devices and browsers.
 */

(function () {
  'use strict';

  var processedPeriods = new Set();
  var activeToastTimer = null;

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
      }, 400);
    }

    toast.onclick = dismissToast;

    // Auto-dismiss after 4.5 seconds for win, 3.5 seconds for loss
    activeToastTimer = setTimeout(dismissToast, isWin ? 4500 : 3500);
  }

  // Check bets and dispatch toast
  function checkAndShowGameResult(gameType, endedPeriod, drawResult, gamesList) {
    if (!endedPeriod || !gamesList || !Array.isArray(gamesList) || gamesList.length === 0) return;

    var periodKey = String(gameType) + '_' + String(endedPeriod).trim();
    if (processedPeriods.has(periodKey)) return;

    // Filter bets placed for this round
    var roundBets = gamesList.filter(function (item) {
      var itemPeriod = String(item.stage || item.period || item.id_product || '').trim();
      return itemPeriod === String(endedPeriod).trim();
    });

    if (roundBets.length === 0) return; // User did not bet in this round

    // If any bet is still pending (status == 0), retry shortly
    var hasPending = roundBets.some(function (b) {
      return parseInt(b.status, 10) === 0;
    });
    if (hasPending) return;

    // Mark as processed
    processedPeriods.add(periodKey);
    if (processedPeriods.size > 200) processedPeriods.clear();

    var totalWinGet = 0;
    var totalLossMoney = 0;
    var isWin = false;

    roundBets.forEach(function (b) {
      var status = parseInt(b.status, 10);
      var betMoney = parseFloat(b.money || b.price || 0);
      var getMoney = parseFloat(b.get || 0);

      if (status === 1) {
        isWin = true;
        totalWinGet += (getMoney > 0 ? getMoney : betMoney * 2);
      } else if (status === 2) {
        totalLossMoney += betMoney;
      }
    });

    var gameTitle = 'Win Go';
    if (String(gameType).indexOf('5d') !== -1) gameTitle = '5D Lotre';
    if (String(gameType).indexOf('k3') !== -1) gameTitle = 'K3 Lotre';

    if (isWin && totalWinGet > 0) {
      showFloatingToast('win', {
        amount: totalWinGet,
        period: endedPeriod,
        game: gameTitle
      });
    } else if (totalLossMoney > 0) {
      showFloatingToast('loss', {
        amount: totalLossMoney,
        period: endedPeriod,
        game: gameTitle
      });
    }
  }

  // Testing helpers
  function testWinModal(amount) {
    showFloatingToast('win', {
      amount: amount || 196.00,
      period: '202608270045',
      game: 'Win Go 1Min'
    });
  }

  function testLossModal(amount) {
    showFloatingToast('loss', {
      amount: amount || 100.00,
      period: '202608270045',
      game: 'Win Go 1Min'
    });
  }

  // Global exports with spelling aliases
  window.checkAndShowGameResult = checkAndShowGameResult;
  window.showFloatingToast = showFloatingToast;
  window.testWinModal = testWinModal;
  window.testLossModal = testLossModal;
  window.testWinModel = testWinModal;
  window.testLossModel = testLossModal;
})();
