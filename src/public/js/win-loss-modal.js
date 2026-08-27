/**
 * DiuWin / Raja Club Official Receipt Win & Loss Modal
 * Complete End-to-End Centralized State Machine Controller
 */

(function () {
  'use strict';

  // Debug flag (always available via window.RESULT_MODAL_DEBUG = true)
  window.RESULT_MODAL_DEBUG = true;

  // Tracked State
  // id_product -> { id, stage, game, typeid, stake, previousStatus, currentStatus, registeredAt, getMoney }
  var trackedBets = new Map();
  var resolvedKeys = new Set(); // game_typeid:stage
  var knownHistoricalBetIds = new Set();
  var isInitialFetch = true;
  var isPollingActive = false;

  var autoCloseTimer = null;
  var autoCloseInterval = null;

  function log(action, details) {
    if (window.RESULT_MODAL_DEBUG) {
      console.log('[RESULT_MODAL] ' + action, details || '');
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

  // Bind close buttons
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

    if (isWin) {
      log('SHOW_WIN', options);
      card.className = 'diuwin-modal-card win-card';
      if (title) title.innerText = 'Congratulations';
      if (resultText) resultText.innerText = 'Bonus';
      if (amountText) {
        amountText.innerText = '+ ₹ ' + formatMoney(options.amount);
        amountText.style.display = 'block';
      }
    } else {
      log('SHOW_LOSS', options);
      card.className = 'diuwin-modal-card loss-card';
      if (title) title.innerText = 'Sorry';
      if (resultText) resultText.innerText = 'Lose';
      if (amountText) amountText.style.display = 'none';
    }

    // Set badges from actual draw number
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
        myData: { gameJoin: dpr5d, pageno: '0', pageto: '30' },
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
        myData: { gameJoin: dprK3, pageno: '0', pageto: '30' },
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
      myData: { typeid: typeid, pageno: '0', pageto: '30', language: 'vi' },
      historyData: { typeid: typeid, pageno: '0', pageto: '10', language: 'vi' },
      game: gameName,
      typeid: typeid
    };
  }

  // Register when user places a bet (Structured API)
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
      stake = parseFloat(arg1.stake || arg1.money || 0);
    } else {
      stage = String(arg1 || '').trim();
      id = String(arg2 || '').trim();
    }

    var ep = getCurrentGameEndpoint();
    if (!game) game = ep.game;
    if (!typeid) typeid = ep.typeid;

    if (!id && !stage) return;
    var betKey = id || (game + '_' + typeid + '_' + stage + '_' + Date.now());

    trackedBets.set(betKey, {
      id: id || betKey,
      stage: stage,
      game: game,
      typeid: typeid,
      stake: stake,
      previousStatus: null,
      currentStatus: 0, // PENDING
      registeredAt: Date.now(),
      getMoney: 0
    });

    log('BET_REGISTERED', {
      id: id,
      stage: stage,
      game: game,
      typeid: typeid,
      stake: stake
    });

    scheduleSettlementChecks();
  }

  function scheduleSettlementChecks() {
    [200, 600, 1200, 2200, 3500, 5000].forEach(function(delay) {
      setTimeout(function() {
        if (trackedBets.size > 0) {
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
        log('DRAW_RESULT', { stage: stage, drawNum: drawNum });
        callback(drawNum);
      },
      error: function() {
        callback(null);
      }
    });
  }

  function fetchUserBetPage(pageno, pageto, callback) {
    var ep = getCurrentGameEndpoint();
    var data = $.extend({}, ep.myData, { pageno: String(pageno), pageto: String(pageto) });

    $.ajax({
      type: "POST",
      url: ep.myUrl,
      data: data,
      dataType: "json",
      success: function(resp) {
        callback(resp && resp.data && Array.isArray(resp.data.gameslist) ? resp.data.gameslist : []);
      },
      error: function() {
        callback([]);
      }
    });
  }

  function checkActiveBetSettlement() {
    if (isPollingActive) return;
    isPollingActive = true;
    var ep = getCurrentGameEndpoint();

    fetchUserBetPage(0, 30, function(list) {
      processSettlementData(list, function() {
        // If there are still pending/unfound tracked bets, check page 1 (records 30-60)
        var hasUnsettled = Array.from(trackedBets.values()).some(function(b) {
          return b.currentStatus === 0;
        });

        if (hasUnsettled) {
          fetchUserBetPage(30, 30, function(page1List) {
            if (page1List.length > 0) {
              processSettlementData(page1List, function() {
                isPollingActive = false;
              });
            } else {
              isPollingActive = false;
            }
          });
        } else {
          isPollingActive = false;
        }
      });
    });
  }

  function processSettlementData(list, onComplete) {
    var ep = getCurrentGameEndpoint();

    // On first page load: Seed historical settled bets so past bets never pop up
    if (isInitialFetch) {
      isInitialFetch = false;
      list.forEach(function(b) {
        var id = String(b.id_product || b.id || '');
        var st = parseInt(b.status, 10);
        var stage = String(b.stage || b.period || '').trim();

        if (st === 0 && stage) {
          // Recover pending bet placed before refresh
          var betKey = id || (ep.game + '_' + ep.typeid + '_' + stage);
          trackedBets.set(betKey, {
            id: id || betKey,
            stage: stage,
            game: ep.game,
            typeid: ep.typeid,
            stake: parseFloat(b.money || b.price || 0),
            previousStatus: null,
            currentStatus: 0,
            registeredAt: Date.now(),
            getMoney: parseFloat(b.get || 0)
          });
          log('RECOVERED_PENDING_ON_LOAD', { id: id, stage: stage });
        } else if (id) {
          knownHistoricalBetIds.add(id);
        }
      });
      onComplete();
      return;
    }

    // Auto-discover newly placed pending bets if registerUserBet wasn't called
    list.forEach(function(b) {
      var id = String(b.id_product || b.id || '');
      var st = parseInt(b.status, 10);
      var stage = String(b.stage || b.period || '').trim();

      if (st === 0 && stage && !knownHistoricalBetIds.has(id)) {
        var betKey = id || (ep.game + '_' + ep.typeid + '_' + stage);
        if (!trackedBets.has(betKey)) {
          trackedBets.set(betKey, {
            id: id || betKey,
            stage: stage,
            game: ep.game,
            typeid: ep.typeid,
            stake: parseFloat(b.money || b.price || 0),
            previousStatus: null,
            currentStatus: 0,
            registeredAt: Date.now(),
            getMoney: parseFloat(b.get || 0)
          });
          log('AUTO_DISCOVERED_PENDING', { id: id, stage: stage });
        }
      }
    });

    // Update tracked bets status transitions
    list.forEach(function(b) {
      var id = String(b.id_product || b.id || '').trim();
      var stage = String(b.stage || b.period || '').trim();
      var newStatus = parseInt(b.status, 10);
      var getMoney = parseFloat(b.get || 0);
      var money = parseFloat(b.money || b.price || 0);

      trackedBets.forEach(function(tracked, key) {
        var isMatch = (id && tracked.id === id) || (!tracked.id.includes('-') && tracked.stage === stage);
        if (isMatch) {
          var oldStatus = tracked.currentStatus;
          tracked.previousStatus = oldStatus;
          tracked.currentStatus = newStatus;
          tracked.getMoney = getMoney;
          if (money && !tracked.stake) tracked.stake = money;

          if (oldStatus === 0 && newStatus === 1) {
            log('TRANSITION 0 -> 1', {
              game: tracked.game,
              typeid: tracked.typeid,
              stage: tracked.stage,
              id_product: tracked.id,
              oldStatus: oldStatus,
              newStatus: newStatus,
              getMoney: getMoney
            });
          } else if (oldStatus === 0 && newStatus === 2) {
            log('TRANSITION 0 -> 2', {
              game: tracked.game,
              typeid: tracked.typeid,
              stage: tracked.stage,
              id_product: tracked.id,
              oldStatus: oldStatus,
              newStatus: newStatus,
              stake: tracked.stake
            });
          }
        }
      });
    });

    // Group tracked bets by game + typeid + stage
    var groups = {};
    trackedBets.forEach(function(tracked, key) {
      var groupKey = tracked.game + '_' + tracked.typeid + ':' + tracked.stage;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(tracked);
    });

    // Evaluate each group for settlement
    var groupKeys = Object.keys(groups);
    var processedCount = 0;

    if (groupKeys.length === 0) {
      onComplete();
      return;
    }

    groupKeys.forEach(function(groupKey) {
      var groupBets = groups[groupKey];
      var firstBet = groupBets[0];
      var stage = firstBet.stage;

      if (resolvedKeys.has(groupKey)) {
        groupBets.forEach(function(b) { trackedBets.delete(b.id); });
        processedCount++;
        if (processedCount === groupKeys.length) onComplete();
        return;
      }

      // Check if EVERY tracked bet in this group has settled (status 1 or 2)
      var allSettled = groupBets.every(function(b) {
        return b.currentStatus === 1 || b.currentStatus === 2;
      });

      if (!allSettled) {
        log('GROUP_WAITING', {
          game: firstBet.game,
          typeid: firstBet.typeid,
          stage: stage,
          totalBets: groupBets.length,
          pending: groupBets.filter(function(b) { return b.currentStatus === 0; }).length
        });
        processedCount++;
        if (processedCount === groupKeys.length) onComplete();
        return;
      }

      // All tracked bets in group are settled!
      log('GROUP_SETTLED', { groupKey: groupKey, count: groupBets.length });
      resolvedKeys.add(groupKey);
      if (resolvedKeys.size > 200) resolvedKeys.clear();

      // Aggregate Win / Loss totals
      var totalStake = 0;
      var totalPayout = 0;
      var hasWin = false;

      groupBets.forEach(function(b) {
        totalStake += (b.stake || 0);
        if (b.currentStatus === 1) {
          hasWin = true;
          totalPayout += (b.getMoney > 0 ? b.getMoney : (b.stake * 2));
        }
        trackedBets.delete(b.id);
      });

      var isWin = (totalPayout > 0);
      var displayAmount = isWin ? totalPayout : totalStake;

      // Fetch actual lottery draw result number
      fetchActualDrawResult(stage, function(realDrawNum) {
        var drawNum = (realDrawNum !== null) ? realDrawNum : (isWin ? '6' : '2');
        showOfficialReceipt(isWin ? 'win' : 'loss', {
          amount: displayAmount,
          period: stage,
          resultNum: drawNum,
          game: firstBet.game + ' ' + firstBet.typeid + 'Min'
        });

        processedCount++;
        if (processedCount === groupKeys.length) onComplete();
      });
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
  window.getResultModalState = function () {
    return {
      trackedBets: Array.from(trackedBets.values()),
      resolvedKeys: Array.from(resolvedKeys),
      knownHistoricalBetIds: Array.from(knownHistoricalBetIds),
      isInitialFetch: isInitialFetch,
      isPollingActive: isPollingActive
    };
  };
})();
