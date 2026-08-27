/**
 * DiuWin / Raja Club Official Receipt Win & Loss Modal
 * Complete End-to-End Centralized State Machine Controller
 */

(function () {
  'use strict';

  // Debug flag (can be enabled via console: window.RESULT_MODAL_DEBUG = true)
  var DEBUG = true;

  // Tracked state
  var trackedBets = new Map(); // id -> { id, stage, game, typeid, stake, time }
  var activeStages = new Set(); // Set<stageString>
  var resolvedKeys = new Set(); // Set<game:stage>
  var knownHistoricalBetIds = new Set(); // Historical settled bet IDs on initial load
  var isInitialFetch = true;
  var isPollingActive = false;

  var autoCloseTimer = null;
  var autoCloseInterval = null;

  function log() {
    if (DEBUG || window.RESULT_MODAL_DEBUG) {
      console.log.apply(console, ['[RESULT_MODAL]'].concat(Array.prototype.slice.call(arguments)));
    }
  }

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

  // Bind close buttons on DOM load
  function initDOMBindings() {
    var closeBtn = document.getElementById('diuwin-modal-close-btn');
    if (closeBtn) closeBtn.onclick = closeReceiptModal;

    var overlay = document.getElementById('diuwin-receipt-overlay');
    if (overlay) {
      overlay.onclick = function(e) {
        if (e.target === overlay) closeReceiptModal();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOMBindings);
  } else {
    initDOMBindings();
  }

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

    if (!overlay || !card) {
      console.warn('[RESULT_MODAL] Overlay element #diuwin-receipt-overlay not found in DOM');
      return;
    }

    log('Showing modal:', type, options);

    if (isWin) {
      card.className = 'diuwin-modal-card win-card';
      if (title) title.innerText = 'Congratulations';
      if (resultText) resultText.innerText = 'Bonus';
      if (amountText) {
        amountText.innerText = '+ ₹ ' + formatMoney(options.amount);
        amountText.style.display = 'block';
      }
    } else {
      card.className = 'diuwin-modal-card loss-card';
      if (title) title.innerText = 'Sorry';
      if (resultText) resultText.innerText = 'Lose';
      if (amountText) amountText.style.display = 'none';
    }

    // Set badges from actual result number
    var num = (options.resultNum !== undefined && options.resultNum !== null) ? String(options.resultNum) : (isWin ? '6' : '2');
    if (badgeNum) badgeNum.innerText = num;
    var isNumOdd = (parseInt(num, 10) % 2 !== 0);
    if (badgeColor) {
      badgeColor.innerText = (num == '0' || num == '5') ? 'Violet' : (isNumOdd ? 'Green' : 'Red');
      badgeColor.className = 'lottery-badge ' + ((num == '0' || num == '5') ? 'badge-violet' : (isNumOdd ? 'badge-green' : 'badge-red'));
    }
    if (badgeSize) {
      badgeSize.innerText = (parseInt(num, 10) >= 5) ? 'Big' : 'Small';
    }

    if (periodText) periodText.innerText = 'Period: ' + (options.period || '-');

    // Auto-close countdown (3, 2, 1...)
    var secondsLeft = 3;
    if (autoCloseText) autoCloseText.innerText = secondsLeft + ' seconds auto close';

    if (autoCloseInterval) clearInterval(autoCloseInterval);
    autoCloseInterval = setInterval(function() {
      secondsLeft--;
      if (secondsLeft > 0 && autoCloseText) {
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
        myUrl: '/api/webapi/5d/GetMyEmerdList',
        historyUrl: '/api/webapi/5d/GetNoaverageEmerdList',
        myData: { gameJoin: dpr5d, pageno: '0', pageto: '20' },
        historyData: { gameJoin: dpr5d, pageno: '0', pageto: '10' },
        game: '5D',
        typeid: dpr5d
      };
    }
    if (path.indexOf('/k3') !== -1) {
      var dprK3 = $('html').attr('data-dpr') || '1';
      return {
        myUrl: '/api/webapi/k3/GetMyEmerdList',
        historyUrl: '/api/webapi/k3/GetNoaverageEmerdList',
        myData: { gameJoin: dprK3, pageno: '0', pageto: '20' },
        historyData: { gameJoin: dprK3, pageno: '0', pageto: '10' },
        game: 'K3',
        typeid: dprK3
      };
    }

    // Win Go
    var typeid = '1';
    var gameName = 'Win Go';
    if (path.indexOf('/win/3') !== -1 || $('.betting-box .nav .item:eq(1)').hasClass('action')) {
      typeid = '3';
    } else if (path.indexOf('/win/5') !== -1 || $('.betting-box .nav .item:eq(2)').hasClass('action')) {
      typeid = '5';
    } else if (path.indexOf('/win/10') !== -1 || $('.betting-box .nav .item:eq(3)').hasClass('action')) {
      typeid = '10';
    }

    return {
      myUrl: '/api/webapi/GetMyEmerdList',
      historyUrl: '/api/webapi/GetNoaverageEmerdList',
      myData: { typeid: typeid, pageno: '0', pageto: '20', language: 'vi' },
      historyData: { typeid: typeid, pageno: '0', pageto: '10', language: 'vi' },
      game: gameName,
      typeid: typeid
    };
  }

  // Register when user places a bet
  function registerUserBet(arg1, arg2) {
    var stage = '';
    var id = '';
    var game = '';
    var typeid = '';
    var stake = 0;

    if (typeof arg1 === 'object' && arg1 !== null) {
      stage = String(arg1.stage || arg1.period || '').trim();
      id = String(arg1.id || arg1.id_product || '').trim();
      game = String(arg1.game || '').trim();
      typeid = String(arg1.typeid || '').trim();
      stake = parseFloat(arg1.money || arg1.stake || 0);
    } else {
      stage = String(arg1 || '').trim();
      id = String(arg2 || '').trim();
    }

    var ep = getCurrentGameEndpoint();
    if (!game) game = ep.game;
    if (!typeid) typeid = ep.typeid;

    if (stage) activeStages.add(stage);
    if (id) {
      trackedBets.set(id, { id: id, stage: stage, game: game, typeid: typeid, stake: stake, time: Date.now() });
    }

    log('Bet registered:', { id: id, stage: stage, game: game, typeid: typeid, stake: stake });
    scheduleSettlementChecks();
  }

  function scheduleSettlementChecks() {
    [200, 600, 1200, 2200, 3500, 5000].forEach(function(delay) {
      setTimeout(function() {
        if (activeStages.size > 0 || trackedBets.size > 0) {
          checkActiveBetSettlement();
        }
      }, delay);
    });
  }

  function fetchActualDrawResult(stage, callback) {
    var ep = getCurrentGameEndpoint();
    $.ajax({
      type: "POST",
      url: ep.historyUrl,
      data: ep.historyData,
      dataType: "json",
      success: function(resp) {
        var drawNum = null;
        if (resp && resp.data && Array.isArray(resp.data.gameslist)) {
          var found = resp.data.gameslist.find(function(item) {
            return String(item.period || item.stage || '').trim() === String(stage).trim();
          });
          if (found) {
            drawNum = (found.amount !== undefined) ? found.amount : found.result;
          } else if (resp.data.gameslist.length > 0) {
            drawNum = resp.data.gameslist[0].amount || resp.data.gameslist[0].result;
          }
        }
        callback(drawNum);
      },
      error: function() {
        callback(null);
      }
    });
  }

  function checkActiveBetSettlement() {
    if (isPollingActive) return;
    isPollingActive = true;
    var ep = getCurrentGameEndpoint();

    $.ajax({
      type: "POST",
      url: ep.myUrl,
      data: ep.myData,
      dataType: "json",
      success: function(resp) {
        if (!resp || !resp.data || !Array.isArray(resp.data.gameslist)) return;
        var list = resp.data.gameslist;
        if (list.length === 0) return;

        // On first page load: Seed historical settled bets so they never trigger popups
        if (isInitialFetch) {
          isInitialFetch = false;
          list.forEach(function(b) {
            var id = String(b.id_product || b.id || '');
            var st = parseInt(b.status, 10);
            var stage = String(b.stage || b.period || '').trim();

            if (st === 0 && stage) {
              // User refreshed while a bet is active/pending: Track it!
              activeStages.add(stage);
              if (id) trackedBets.set(id, { id: id, stage: stage, game: ep.game, typeid: ep.typeid, time: Date.now() });
              log('Recovered pending bet after page refresh:', { id: id, stage: stage });
            } else if (id) {
              knownHistoricalBetIds.add(id);
            }
          });
          return;
        }

        // Auto-discover newly placed pending bets if registerUserBet wasn't called
        list.forEach(function(b) {
          var id = String(b.id_product || b.id || '');
          var st = parseInt(b.status, 10);
          var stage = String(b.stage || b.period || '').trim();

          if (st === 0 && stage && !knownHistoricalBetIds.has(id)) {
            activeStages.add(stage);
            if (id && !trackedBets.has(id)) {
              trackedBets.set(id, { id: id, stage: stage, game: ep.game, typeid: ep.typeid, time: Date.now() });
            }
          }
        });

        // Evaluate all active stages for settlement
        activeStages.forEach(function(stage) {
          var stageKey = ep.game + '_' + ep.typeid + ':' + stage;
          if (resolvedKeys.has(stageKey)) {
            activeStages.delete(stage);
            return;
          }

          var stageBets = list.filter(function(b) {
            return String(b.stage || b.period || '').trim() === stage;
          });

          if (stageBets.length === 0) {
            // Bet not in first 20 records yet; keep waiting
            return;
          }

          // Check if any bet for this stage is still pending
          var hasPending = stageBets.some(function(b) {
            return parseInt(b.status, 10) === 0;
          });

          if (hasPending) {
            log('Stage ' + stage + ' has bets pending in MySQL; waiting...');
            return;
          }

          // All bets for this stage have settled!
          resolvedKeys.add(stageKey);
          activeStages.delete(stage);
          if (resolvedKeys.size > 200) resolvedKeys.clear();

          // Compute total win and loss
          var totalWin = 0;
          var totalLoss = 0;
          var isWin = false;
          var drawNumber = null;

          stageBets.forEach(function(b) {
            var st = parseInt(b.status, 10);
            var money = parseFloat(b.money || b.price || 0);
            var get = parseFloat(b.get || 0);
            var id = String(b.id_product || b.id || '');

            if (b.amount !== undefined && drawNumber === null) {
              drawNumber = b.amount;
            }

            if (st === 1) {
              isWin = true;
              totalWin += (get > 0 ? get : money * 2);
              log('Status transition 0 -> 1 (WIN):', { id: id, stage: stage, get: get });
            } else if (st === 2) {
              totalLoss += money;
              log('Status transition 0 -> 2 (LOSS):', { id: id, stage: stage, money: money });
            }

            if (id) trackedBets.delete(id);
          });

          log('Stage settled:', { stage: stage, isWin: isWin, totalWin: totalWin, totalLoss: totalLoss });

          // Fetch actual drawn number for accurate badges
          fetchActualDrawResult(stage, function(realDrawNum) {
            var finalNum = (drawNumber !== null) ? drawNumber : (realDrawNum !== null ? realDrawNum : (isWin ? '6' : '2'));
            showOfficialReceipt(isWin ? 'win' : 'loss', {
              amount: isWin ? totalWin : totalLoss,
              period: stage,
              resultNum: finalNum,
              game: ep.game + ' ' + ep.typeid + 'Min'
            });
          });
        });
      },
      complete: function() {
        isPollingActive = false;
      }
    });
  }

  // Active polling interval every 1.5 seconds
  setInterval(checkActiveBetSettlement, 1500);
  setTimeout(checkActiveBetSettlement, 400);

  // Testing helpers for dev/debug
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

  // Global Exports
  window.showOfficialReceipt = showOfficialReceipt;
  window.showFloatingToast = showOfficialReceipt;
  window.registerUserBet = registerUserBet;
  window.testWinModal = testWinModal;
  window.testLossModal = testLossModal;
  window.testWinModel = testWinModal;
  window.testLossModel = testLossModal;
  window.triggerBetCheck = checkActiveBetSettlement;
  window.closeReceiptModal = closeReceiptModal;
})();
