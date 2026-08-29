/**
 * DiuWin / Raja Club Official Receipt Win & Loss Modal
 * Complete Production-Grade Centralized State Machine Controller
 */

(function () {
  'use strict';

  // Debug flag (always available via window.RESULT_MODAL_DEBUG = true)
  window.RESULT_MODAL_DEBUG = true;

  // Tracked State
  // Map: id_product -> { id, stage, game, typeid, stake, currentStatus, registeredAt, getMoney }
  var trackedBets = new Map();
  var resolvedStageKeys = new Set(); // game_typeid:stage
  var resolvedBetIds = new Set();
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

  function ensureModalDOM() {
    var overlay = document.getElementById('diuwin-receipt-overlay');
    if (!overlay) {
      log('OVERLAY_CREATED', 'Injecting modal DOM markup dynamically into body');
      var modalHTML = '<div id="diuwin-receipt-overlay" class="diuwin-result-overlay">' +
        '<div id="diuwin-receipt-card" class="diuwin-modal-card loss-card">' +
        '<div class="diuwin-top-emblem">' +
        '<svg class="emblem-svg" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M20 55 C35 30, 60 40, 80 50 C100 40, 125 30, 140 55 C125 65, 100 55, 80 60 C60 55, 35 65, 20 55 Z" fill="#93c5fd" opacity="0.9"/>' +
        '<path d="M10 65 C30 45, 55 52, 80 58 C105 52, 130 45, 150 65 C130 75, 105 65, 80 68 C55 65, 30 75, 10 65 Z" fill="#60a5fa" opacity="0.7"/>' +
        '<circle cx="80" cy="46" r="32" fill="url(#emblemGrad)" stroke="#ffffff" stroke-width="3.5"/>' +
        '<path d="M36 76 Q80 88 124 76 Q80 94 36 76 Z" fill="#3b82f6"/>' +
        '<g id="emblem-icon-group" transform="translate(62, 28) scale(0.9)">' +
        '<path d="M20 2 C20 2, 28 10, 28 22 C28 26, 26 30, 24 32 L16 32 C14 30, 12 26, 12 22 C12 10, 20 2, 20 2 Z" fill="#ffffff"/>' +
        '<circle cx="20" cy="16" r="3.5" fill="#3b82f6"/>' +
        '<path d="M12 24 L6 30 L12 30 Z" fill="#ffffff" opacity="0.85"/>' +
        '<path d="M28 24 L34 30 L28 30 Z" fill="#ffffff" opacity="0.85"/>' +
        '<path d="M16 33 L20 38 L24 33 Z" fill="#f59e0b"/>' +
        '</g>' +
        '<defs>' +
        '<linearGradient id="emblemGrad" x1="48" y1="14" x2="112" y2="78" gradientUnits="userSpaceOnUse">' +
        '<stop stop-color="#93c5fd"/>' +
        '<stop offset="1" stop-color="#3b82f6"/>' +
        '</linearGradient>' +
        '</defs>' +
        '</svg>' +
        '</div>' +
        '<div id="diuwin-modal-title" class="diuwin-modal-title">Sorry</div>' +
        '<div class="diuwin-lottery-results-row">' +
        '<span>Lottery results</span>' +
        '<span id="badge-color" class="lottery-badge badge-red">Red</span>' +
        '<span id="badge-num" class="lottery-badge badge-num">-</span>' +
        '<span id="badge-size" class="lottery-badge badge-size">Small</span>' +
        '</div>' +
        '<div class="receipt-slit-box">' +
        '<div class="receipt-slit"></div>' +
        '<div class="receipt-paper">' +
        '<div id="receipt-result-text" class="receipt-result-text">Lose</div>' +
        '<div id="receipt-amount-text" class="receipt-amount-text" style="display: none;">+ ₹ 0.00</div>' +
        '<div id="receipt-period-text" class="receipt-period-text">Period: -</div>' +
        '</div>' +
        '</div>' +
        '<div class="auto-close-row">' +
        '<span class="auto-close-circle"></span>' +
        '<span id="auto-close-text">3 seconds auto close</span>' +
        '</div>' +
        '</div>' +
        '<div id="diuwin-modal-close-btn" class="diuwin-modal-close-btn">&times;</div>' +
        '</div>';

      var container = document.createElement('div');
      container.innerHTML = modalHTML;
      document.body.appendChild(container.firstElementChild);
      initDOMBindings();
    }
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
      overlay.onclick = function (e) {
        if (e.target === overlay) closeReceiptModal();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ensureModalDOM();
      initDOMBindings();
    });
  } else {
    ensureModalDOM();
    initDOMBindings();
  }

  function formatDrawBadges(game, rawNum) {
    if (rawNum === null || rawNum === undefined || rawNum === '') {
      return { numText: '-', colorText: '', colorClass: '', sizeText: '' };
    }
    var numStr = String(rawNum).trim();
    var gameName = String(game || '').toUpperCase();

    if (gameName.indexOf('5D') !== -1) {
      // 5D draw: e.g. "89635"
      var digits = numStr.split('');
      var sum = digits.reduce(function (acc, d) { return acc + (parseInt(d, 10) || 0); }, 0);
      var isBig = (sum > 22);
      return {
        numText: digits.join(' '),
        colorText: 'Total: ' + sum,
        colorClass: 'badge-num',
        sizeText: isBig ? 'Big' : 'Small'
      };
    } else if (gameName.indexOf('K3') !== -1) {
      // K3 draw: e.g. "123"
      var kDigits = numStr.split('');
      var kSum = kDigits.reduce(function (acc, d) { return acc + (parseInt(d, 10) || 0); }, 0);
      var kIsBig = (kSum >= 11);
      var kIsOdd = (kSum % 2 !== 0);
      return {
        numText: kDigits.join(' ') + ' = ' + kSum,
        colorText: kIsOdd ? 'Odd' : 'Even',
        colorClass: kIsOdd ? 'badge-green' : 'badge-red',
        sizeText: kIsBig ? 'Big' : 'Small'
      };
    } else {
      // WinGo: single digit 0-9
      var n = parseInt(numStr, 10);
      if (isNaN(n)) return { numText: numStr, colorText: '', colorClass: '', sizeText: '' };
      var isOdd = (n % 2 !== 0);
      var isViolet = (n === 0 || n === 5);
      var colorText = isViolet ? 'Violet' : (isOdd ? 'Green' : 'Red');
      var colorClass = isViolet ? 'badge-violet' : (isOdd ? 'badge-green' : 'badge-red');
      var sizeText = (n >= 5) ? 'Big' : 'Small';
      return {
        numText: String(n),
        colorText: colorText,
        colorClass: colorClass,
        sizeText: sizeText
      };
    }
  }

  function showOfficialReceipt(type, options) {
    options = options || {};
    var isWin = (type === 'win');

    ensureModalDOM();

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
      log('MODAL_DOM_MISSING', 'Unable to find or inject overlay');
      return;
    }

    log('OVERLAY_VISIBLE', { type: type, period: options.period, amount: options.amount });

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

    // Set badges
    var badgeInfo = formatDrawBadges(options.game, options.resultNum);
    if (badgeNum) badgeNum.innerText = badgeInfo.numText;
    if (badgeColor) {
      badgeColor.innerText = badgeInfo.colorText;
      badgeColor.className = 'lottery-badge ' + (badgeInfo.colorClass || 'badge-red');
      badgeColor.style.display = badgeInfo.colorText ? 'inline-block' : 'none';
    }
    if (badgeSize) {
      badgeSize.innerText = badgeInfo.sizeText;
      badgeSize.style.display = badgeInfo.sizeText ? 'inline-block' : 'none';
    }

    if (periodText) periodText.innerText = 'Period: ' + (options.period || '-');

    // Force CSS reflow and trigger animation
    overlay.classList.remove('active');
    void overlay.offsetWidth;
    overlay.classList.add('active');

    log('ANIMATION_STARTED', { type: type, period: options.period });

    // Auto-close countdown (3, 2, 1...)
    var secondsLeft = 3;
    if (autoCloseText) autoCloseText.innerText = secondsLeft + ' seconds auto close';

    if (autoCloseInterval) clearInterval(autoCloseInterval);
    autoCloseInterval = setInterval(function () {
      secondsLeft--;
      if (secondsLeft > 0 && autoCloseText) {
        autoCloseText.innerText = secondsLeft + ' seconds auto close';
      }
    }, 1000);

    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(closeReceiptModal, 3600);
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
      currentStatus: 0, // PENDING (0)
      registeredAt: Date.now(),
      getMoney: 0
    });

    log('BET_REGISTERED', {
      id: id || betKey,
      stage: stage,
      game: game,
      typeid: typeid,
      stake: stake
    });

    scheduleSettlementChecks();
  }

  function scheduleSettlementChecks() {
    [100, 400, 800, 1500, 2500, 4000].forEach(function (delay) {
      setTimeout(function () {
        if (trackedBets.size > 0) {
          checkActiveBetSettlement();
        }
      }, delay);
    });
  }

  // Draw Result Cache
  var drawResultCache = new Map();

  // Fetch actual draw result without blocking the modal
  function fetchActualDrawResult(stage, game, typeid, callback) {
    var cacheKey = game + '_' + typeid + ':' + stage;
    if (drawResultCache.has(cacheKey)) {
      var cached = drawResultCache.get(cacheKey);
      log('DRAW_RESULT_RECEIVED', { stage: stage, drawNum: cached, fromCache: true });
      callback(cached);
      return;
    }

    var ep = getCurrentGameEndpoint();

    $.ajax({
      type: "POST",
      url: ep.historyUrl,
      data: ep.historyData,
      dataType: "json",
      timeout: 2500,
      success: function (resp) {
        var drawNum = null;
        if (resp && resp.data && Array.isArray(resp.data.gameslist)) {
          var found = resp.data.gameslist.find(function (item) {
            return String(item.period || item.stage || '').trim() === String(stage).trim();
          });
          if (found) {
            drawNum = (found.amount !== undefined) ? found.amount : found.result;
          }
        }

        if (drawNum !== null && drawNum !== undefined) {
          drawResultCache.set(cacheKey, drawNum);
          log('DRAW_RESULT_RECEIVED', { stage: stage, drawNum: drawNum });
          callback(drawNum);
        } else {
          log('DRAW_RESULT_RECEIVED', { stage: stage, drawNum: null, note: 'Draw result not in history yet' });
          callback(null);
        }
      },
      error: function () {
        log('DRAW_RESULT_RECEIVED', { stage: stage, drawNum: null, error: true });
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
      success: function (resp) {
        callback(resp && resp.data && Array.isArray(resp.data.gameslist) ? resp.data.gameslist : []);
      },
      error: function () {
        callback([]);
      }
    });
  }

  // Dynamic Multi-Page Retrieval Loop
  function checkActiveBetSettlement() {
    if (isPollingActive) return;
    isPollingActive = true;

    var pageSize = 30;
    var maxPages = 4; // up to 120 records

    function scanPage(pageIndex) {
      fetchUserBetPage(pageIndex, pageSize, function (list) {
        if (!list || list.length === 0) {
          isPollingActive = false;
          return;
        }

        processSettlementData(list, function (hasUnsettled) {
          if (hasUnsettled && (pageIndex + 1) < maxPages) {
            scanPage(pageIndex + 1);
          } else {
            isPollingActive = false;
          }
        });
      });
    }

    scanPage(0);
  }

  function processSettlementData(list, onComplete) {
    var ep = getCurrentGameEndpoint();

    // On first page load: Seed historical settled bets so past bets never pop up
    if (isInitialFetch) {
      isInitialFetch = false;
      list.forEach(function (b) {
        var id = String(b.id_product || b.id || '').trim();
        var st = parseInt(b.status, 10);
        var stage = String(b.stage || b.period || '').trim();

        if (st === 0 && stage) {
          // Recover pending bet placed before refresh
          var betKey = id || (ep.game + '_' + ep.typeid + '_' + stage);
          if (!trackedBets.has(betKey)) {
            trackedBets.set(betKey, {
              id: id || betKey,
              stage: stage,
              game: ep.game,
              typeid: ep.typeid,
              stake: parseFloat(b.money || b.price || 0),
              currentStatus: 0,
              registeredAt: Date.now(),
              getMoney: parseFloat(b.get || 0)
            });
            log('PENDING_DETECTED', { id: id, stage: stage, recovered: true });
          }
        } else if (id) {
          // Add to historical so it never triggers a modal
          if (!trackedBets.has(id)) {
            knownHistoricalBetIds.add(id);
          }
        }
      });
      onComplete(false);
      return;
    }

    // Process bets returned by API during active session
    list.forEach(function (b) {
      var id = String(b.id_product || b.id || '').trim();
      var st = parseInt(b.status, 10);
      var stage = String(b.stage || b.period || '').trim();
      var getMoney = parseFloat(b.get || 0);
      var stake = parseFloat(b.money || b.price || 0);

      if (!id || knownHistoricalBetIds.has(id) || resolvedBetIds.has(id)) {
        return;
      }

      // If a synthetic bet with the same stage exists in trackedBets, clean it up
      trackedBets.forEach(function (val, key) {
        if (val.stage === stage && key !== id && String(key).indexOf('_') !== -1) {
          trackedBets.delete(key);
        }
      });

      if (st === 0 && stage) {
        // Pending bet observed in this session
        if (!trackedBets.has(id)) {
          trackedBets.set(id, {
            id: id,
            stage: stage,
            game: ep.game,
            typeid: ep.typeid,
            stake: stake,
            currentStatus: 0,
            registeredAt: Date.now(),
            getMoney: 0
          });
          log('PENDING_DETECTED', { id: id, stage: stage });
        }
      } else if (st === 1 || st === 2) {
        // Settled bet observed in this session
        if (trackedBets.has(id)) {
          var tracked = trackedBets.get(id);
          tracked.currentStatus = st;
          tracked.getMoney = getMoney;
          if (stake && !tracked.stake) tracked.stake = stake;
          log('SETTLEMENT_DETECTED', { id: id, stage: stage, status: st, getMoney: getMoney });
        } else {
          // Bet was placed in this session and settled before intermediate status=0 poll
          trackedBets.set(id, {
            id: id,
            stage: stage,
            game: ep.game,
            typeid: ep.typeid,
            stake: stake,
            currentStatus: st,
            registeredAt: Date.now(),
            getMoney: getMoney
          });
          log('SETTLEMENT_DETECTED', { id: id, stage: stage, status: st, getMoney: getMoney, fastSettled: true });
        }
      }
    });

    // Group tracked bets by game + typeid + stage
    var groups = {};
    trackedBets.forEach(function (tracked) {
      var groupKey = tracked.game + '_' + tracked.typeid + ':' + tracked.stage;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(tracked);
    });

    var groupKeys = Object.keys(groups);
    var processedCount = 0;

    var hasPending = Array.from(trackedBets.values()).some(function (b) {
      return b.currentStatus === 0;
    });

    if (groupKeys.length === 0) {
      onComplete(hasPending);
      return;
    }

    groupKeys.forEach(function (groupKey) {
      var groupBets = groups[groupKey];
      var firstBet = groupBets[0];
      var stage = firstBet.stage;

      log('GROUP_CREATED', { groupKey: groupKey, count: groupBets.length });

      if (resolvedStageKeys.has(groupKey)) {
        groupBets.forEach(function (b) {
          resolvedBetIds.add(b.id);
          trackedBets.delete(b.id);
        });
        processedCount++;
        if (processedCount === groupKeys.length) onComplete(hasPending);
        return;
      }

      // Check if at least one bet in this group has settled
      var settledBets = groupBets.filter(function (b) {
        return b.currentStatus === 1 || b.currentStatus === 2;
      });

      if (settledBets.length === 0) {
        // No settled bets yet; still pending
        processedCount++;
        if (processedCount === groupKeys.length) onComplete(hasPending);
        return;
      }

      // Check if any bet for this stage is still reported as status 0 in the current list
      var stillPendingInList = list.some(function (b) {
        var bStage = String(b.stage || b.period || '').trim();
        var bStatus = parseInt(b.status, 10);
        return bStage === stage && bStatus === 0;
      });

      if (stillPendingInList && settledBets.length < groupBets.length) {
        // Wait for remaining bets for this stage to settle
        processedCount++;
        if (processedCount === groupKeys.length) onComplete(hasPending);
        return;
      }

      // All bets for this stage are settled!
      log('ALL_SETTLED', { groupKey: groupKey, count: groupBets.length });

      // Mark group as resolved so it cannot trigger a duplicate modal
      resolvedStageKeys.add(groupKey);
      if (resolvedStageKeys.size > 200) resolvedStageKeys.clear();

      // Aggregate Win / Loss totals
      var totalStake = 0;
      var totalPayout = 0;

      groupBets.forEach(function (b) {
        totalStake += (b.stake || 0);
        if (b.currentStatus === 1) {
          totalPayout += (b.getMoney || 0);
        }
        resolvedBetIds.add(b.id);
        trackedBets.delete(b.id);
      });

      var isWin = (totalPayout > 0);
      var displayAmount = isWin ? totalPayout : totalStake;

      if (isWin) {
        log('WIN_MODAL', { amount: displayAmount, period: stage, game: firstBet.game });
      } else {
        log('LOSS_MODAL', { amount: displayAmount, period: stage, game: firstBet.game });
      }

      // Fetch authentic lottery draw result number without blocking
      fetchActualDrawResult(stage, firstBet.game, firstBet.typeid, function (realDrawNum) {
        showOfficialReceipt(isWin ? 'win' : 'loss', {
          amount: displayAmount,
          period: stage,
          resultNum: realDrawNum,
          game: firstBet.game + ' ' + firstBet.typeid + 'Min'
        });

        processedCount++;
        if (processedCount === groupKeys.length) onComplete(hasPending);
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
      resolvedStageKeys: Array.from(resolvedStageKeys),
      resolvedBetIds: Array.from(resolvedBetIds),
      knownHistoricalBetIds: Array.from(knownHistoricalBetIds),
      isInitialFetch: isInitialFetch,
      isPollingActive: isPollingActive
    };
  };
})();
