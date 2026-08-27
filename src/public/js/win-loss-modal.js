/**
 * DiuWin - Win & Loss Animation & Money Count Modal System
 * Provides animated celebratory / loss popups with exact money calculation,
 * confetti effects, audio chimes, and detailed game result breakdown.
 */

(function () {
  'use strict';

  var processedPeriods = new Set();
  var activeTimer = null;
  var confettiAnimationId = null;
  var audioCtx = null;
  var retryMap = new Map();

  // Unlock AudioContext on first user touch/click
  function unlockAudioContext() {
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
  }

  window.addEventListener('click', unlockAudioContext, { once: true });
  window.addEventListener('touchstart', unlockAudioContext, { once: true });

  // Initialize Modal HTML DOM
  function initModalDom() {
    if (document.getElementById('game-result-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'game-result-overlay';
    overlay.innerHTML = `
      <canvas id="game-result-confetti"></canvas>
      <div class="game-result-modal" id="game-result-card">
        <div class="modal-close-x" id="game-result-close-x">&times;</div>
        
        <div class="modal-header" id="modal-header-bg">
          <div class="modal-rays" id="modal-sunburst"></div>
          <div id="modal-header-icon"></div>
          <h2 id="modal-header-title"></h2>
          <div id="modal-header-sub"></div>
        </div>

        <div class="modal-body">
          <div class="money-highlight-box">
            <div class="money-label" id="modal-money-label"></div>
            <div class="money-val" id="modal-money-val">₹ 0.00</div>
          </div>

          <div class="result-info-card">
            <div class="info-row">
              <span class="info-label">Game</span>
              <span class="info-value" id="modal-info-game"></span>
            </div>
            <div class="info-row">
              <span class="info-label">Period</span>
              <span class="info-value" id="modal-info-period"></span>
            </div>
            <div class="info-row">
              <span class="info-label">Result</span>
              <span class="info-value" id="modal-info-result"></span>
            </div>
            <div class="info-row">
              <span class="info-label">Your Bet</span>
              <span class="info-value" id="modal-info-bet"></span>
            </div>
          </div>

          <button class="modal-btn" id="modal-action-btn"></button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    var closeBtn = document.getElementById('game-result-close-x');
    var actionBtn = document.getElementById('modal-action-btn');

    if (closeBtn) closeBtn.onclick = closeGameResultModal;
    if (actionBtn) actionBtn.onclick = closeGameResultModal;
    overlay.onclick = function (e) {
      if (e.target === overlay) {
        closeGameResultModal();
      }
    };
  }

  // Synthesized Web Audio Fanfare / Loss Tone
  function playSound(type) {
    try {
      unlockAudioContext();
      if (!audioCtx) return;

      var ctx = audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'win') {
        // Joyful victory fanfare arpeggio (C5, E5, G5, C6)
        var notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach(function (freq, index) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

          gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
          gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + index * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.42);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + index * 0.1);
          osc.stop(ctx.currentTime + index * 0.1 + 0.45);
        });
      } else {
        // Mellow loss tone
        var notesLoss = [392.00, 329.63, 261.63];
        notesLoss.forEach(function (freq, index) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);

          gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
          gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.15 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + index * 0.15);
          osc.stop(ctx.currentTime + index * 0.15 + 0.4);
        });
      }
    } catch (e) {
      // Audio playback fails gracefully without impacting UI
    }
  }

  // Smooth Confetti Engine
  function startConfetti() {
    var canvas = document.getElementById('game-result-confetti');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var pieces = [];
    var numberOfPieces = 70;
    var colors = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#fbbf24', '#ffffff'];

    for (var i = 0; i < numberOfPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 3 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var stillActive = false;

      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height) {
          stillActive = true;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (stillActive) {
        confettiAnimationId = requestAnimationFrame(draw);
      }
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    draw();
  }

  function stopConfetti() {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    var canvas = document.getElementById('game-result-confetti');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Smooth Money Counter Animation
  function animateMoney(elem, targetVal, isWin, duration) {
    duration = duration || 1000;
    var startVal = 0;
    var startTime = null;
    var prefix = isWin ? '+ ₹ ' : '- ₹ ';

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      var progress = Math.min((currentTime - startTime) / duration, 1);
      var easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
      var currentVal = easeProgress * (targetVal - startVal) + startVal;

      elem.textContent = prefix + Number(currentVal).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // Format WinGo result ball HTML
  function formatWinGoResultHtml(resultNum) {
    if (resultNum === undefined || resultNum === null || resultNum === '') return '-';
    resultNum = Number(resultNum);
    var colorClass = 'bg-green';
    var isBig = resultNum >= 5;

    if (resultNum === 0) {
      colorClass = 'bg-red-violet';
    } else if (resultNum === 5) {
      colorClass = 'bg-green-violet';
    } else if (resultNum % 2 === 0) {
      colorClass = 'bg-red';
    } else {
      colorClass = 'bg-green';
    }

    var sizeTag = isBig 
      ? '<span class="res-tag tag-big">Big</span>' 
      : '<span class="res-tag tag-small">Small</span>';

    return `
      <span class="res-ball ${colorClass}">${resultNum}</span>
      ${sizeTag}
    `;
  }

  // Format 5D result balls HTML
  function format5DResultHtml(resultStr) {
    if (!resultStr) return '-';
    var digits = String(resultStr).split('');
    var balls = digits.map(function (d) {
      return `<span class="res-ball bg-d5">${d}</span>`;
    }).join('');

    var sum = digits.reduce(function (acc, val) { return acc + (parseInt(val, 10) || 0); }, 0);
    return `${balls} <span class="res-tag tag-bet">Sum ${sum}</span>`;
  }

  // Format K3 result dice HTML
  function formatK3ResultHtml(resultStr) {
    if (!resultStr) return '-';
    var digits = String(resultStr).split('');
    var sum = digits.reduce(function (acc, val) { return acc + (parseInt(val, 10) || 0); }, 0);
    var isBig = sum >= 11;
    var diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    var diceHtml = digits.map(function (d) {
      var idx = (parseInt(d, 10) || 1) - 1;
      return `<span style="font-size: 18px; margin: 0 1px;">${diceIcons[idx] || d}</span>`;
    }).join('');

    return `
      ${diceHtml}
      <span class="res-tag ${isBig ? 'tag-big' : 'tag-small'}">${sum} (${isBig ? 'Big' : 'Small'})</span>
    `;
  }

  // Format user bets badge list
  function formatBetsHtml(bets) {
    if (!bets || bets.length === 0) return '<span class="res-tag tag-bet">-</span>';
    return bets.map(function (b) {
      var label = b.bet;
      if (label === 'l') label = 'Big';
      else if (label === 'n') label = 'Small';
      else if (label === 'd') label = 'Red';
      else if (label === 'x') label = 'Green';
      else if (label === 't') label = 'Violet';
      var amt = b.money || b.price || 0;
      return `<span class="res-tag tag-bet">${label} (₹${amt})</span>`;
    }).join(' ');
  }

  // Show Win Modal
  function showGameWinModal(options) {
    initModalDom();
    if (activeTimer) clearTimeout(activeTimer);

    var overlay = document.getElementById('game-result-overlay');
    var card = document.getElementById('game-result-card');
    var headerIcon = document.getElementById('modal-header-icon');
    var headerTitle = document.getElementById('modal-header-title');
    var headerSub = document.getElementById('modal-header-sub');
    var sunburst = document.getElementById('modal-sunburst');
    var moneyLabel = document.getElementById('modal-money-label');
    var moneyVal = document.getElementById('modal-money-val');
    var infoGame = document.getElementById('modal-info-game');
    var infoPeriod = document.getElementById('modal-info-period');
    var infoResult = document.getElementById('modal-info-result');
    var infoBet = document.getElementById('modal-info-bet');
    var actionBtn = document.getElementById('modal-action-btn');

    if (!overlay || !card) return;

    card.className = 'game-result-modal is-win';
    if (sunburst) sunburst.style.display = 'block';

    if (headerIcon) headerIcon.innerHTML = `<div class="win-icon-wrap"><span class="win-crown">👑</span></div>`;
    if (headerTitle) {
      headerTitle.className = 'win-title';
      headerTitle.textContent = 'Congratulations';
    }
    if (headerSub) {
      headerSub.className = 'win-subtitle';
      headerSub.textContent = '🎉 WINNING BONUS 🎉';
    }

    if (moneyLabel) moneyLabel.textContent = 'Bonus Amount';
    if (moneyVal) animateMoney(moneyVal, options.amount || 0, true, 1200);

    if (infoGame) infoGame.textContent = options.game || 'Win Go';
    if (infoPeriod) infoPeriod.textContent = options.period || '-';
    if (infoResult) infoResult.innerHTML = options.resultHtml || '-';
    if (infoBet) infoBet.innerHTML = formatBetsHtml(options.bets);

    if (actionBtn) actionBtn.textContent = 'Confirm & Collect';

    overlay.classList.add('active');
    startConfetti();
    playSound('win');

    activeTimer = setTimeout(function () {
      closeGameResultModal();
    }, 7000);
  }

  // Show Loss Modal
  function showGameLossModal(options) {
    initModalDom();
    if (activeTimer) clearTimeout(activeTimer);

    var overlay = document.getElementById('game-result-overlay');
    var card = document.getElementById('game-result-card');
    var headerIcon = document.getElementById('modal-header-icon');
    var headerTitle = document.getElementById('modal-header-title');
    var headerSub = document.getElementById('modal-header-sub');
    var sunburst = document.getElementById('modal-sunburst');
    var moneyLabel = document.getElementById('modal-money-label');
    var moneyVal = document.getElementById('modal-money-val');
    var infoGame = document.getElementById('modal-info-game');
    var infoPeriod = document.getElementById('modal-info-period');
    var infoResult = document.getElementById('modal-info-result');
    var infoBet = document.getElementById('modal-info-bet');
    var actionBtn = document.getElementById('modal-action-btn');

    if (!overlay || !card) return;

    card.className = 'game-result-modal is-loss';
    if (sunburst) sunburst.style.display = 'none';

    if (headerIcon) headerIcon.innerHTML = `<div class="loss-icon-wrap"><span>💔</span></div>`;
    if (headerTitle) {
      headerTitle.className = 'loss-title';
      headerTitle.textContent = 'Better Luck Next Time';
    }
    if (headerSub) {
      headerSub.className = 'loss-subtitle';
      headerSub.textContent = 'Game Draw Completed';
    }

    if (moneyLabel) moneyLabel.textContent = 'Loss Amount';
    if (moneyVal) animateMoney(moneyVal, options.amount || 0, false, 1000);

    if (infoGame) infoGame.textContent = options.game || 'Win Go';
    if (infoPeriod) infoPeriod.textContent = options.period || '-';
    if (infoResult) infoResult.innerHTML = options.resultHtml || '-';
    if (infoBet) infoBet.innerHTML = formatBetsHtml(options.bets);

    if (actionBtn) actionBtn.textContent = 'Continue Playing';

    overlay.classList.add('active');
    stopConfetti();
    playSound('loss');

    activeTimer = setTimeout(function () {
      closeGameResultModal();
    }, 6000);
  }

  // Close Modal
  function closeGameResultModal() {
    if (activeTimer) {
      clearTimeout(activeTimer);
      activeTimer = null;
    }
    var overlay = document.getElementById('game-result-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    stopConfetti();
  }

  /**
   * Main Dispatcher: Inspects the finished period and user bets,
   * then triggers the appropriate Win or Loss popup animation.
   *
   * @param {string} gameType - 'wingo1', 'wingo3', 'wingo5', 'wingo10', '5d1', '5d3', '5d5', '5d10', 'k31', 'k33', 'k35', 'k310'
   * @param {string|number} endedPeriod - The period number that just drew
   * @param {string|number} drawResult - The result number/string (e.g. 5, "12345", "123")
   * @param {Array} gamesList - The user's bet history list from GetMyEmerdList
   */
  function checkAndShowGameResult(gameType, endedPeriod, drawResult, gamesList) {
    if (!endedPeriod || !gamesList || !Array.isArray(gamesList) || gamesList.length === 0) return;

    var periodKey = String(gameType) + '_' + String(endedPeriod).trim();
    if (processedPeriods.has(periodKey)) return;

    // Filter bets placed for this specific round (matching period/stage)
    var roundBets = gamesList.filter(function (item) {
      var itemPeriod = String(item.stage || item.period || item.id_product || '').trim();
      return itemPeriod === String(endedPeriod).trim();
    });

    if (roundBets.length === 0) return; // User did not participate in this round

    // Check if any bet in this round is still pending (status == 0)
    var hasPending = roundBets.some(function (b) {
      return parseInt(b.status, 10) === 0;
    });

    if (hasPending) {
      var retries = retryMap.get(periodKey) || 0;
      if (retries < 4) {
        retryMap.set(periodKey, retries + 1);
        setTimeout(function () {
          // Re-fetch latest bet list
          var endpoint = "/api/webapi/GetMyEmerdList";
          var postData = { typeid: "1", pageno: "0", pageto: "10", language: "vi" };
          
          if (String(gameType).indexOf('wingo') !== -1) {
            var tid = "1";
            if (gameType === 'wingo3') tid = "3";
            if (gameType === 'wingo5') tid = "5";
            if (gameType === 'wingo10') tid = "10";
            postData = { typeid: tid, pageno: "0", pageto: "10", language: "vi" };
          } else if (String(gameType).indexOf('5d') !== -1) {
            endpoint = "/api/webapi/5d/GetMyEmerdList";
            postData = { gameJoin: (window.jQuery && $('html').attr('data-dpr')) || "1", pageno: "0", pageto: "10" };
          } else if (String(gameType).indexOf('k3') !== -1) {
            endpoint = "/api/webapi/k3/GetMyEmerdList";
            postData = { gameJoin: (window.jQuery && $('html').attr('data-dpr')) || "1", pageno: "0", pageto: "10" };
          }

          if (window.jQuery) {
            window.jQuery.ajax({
              type: "POST",
              url: endpoint,
              data: postData,
              dataType: "json",
              success: function (res) {
                if (res && res.data && res.data.gameslist) {
                  checkAndShowGameResult(gameType, endedPeriod, drawResult, res.data.gameslist);
                }
              }
            });
          }
        }, 800);
        return;
      }
    }

    // Mark as processed now that we have settled result
    processedPeriods.add(periodKey);
    retryMap.delete(periodKey);

    // Keep processed cache manageable
    if (processedPeriods.size > 200) {
      processedPeriods.clear();
    }

    var totalWinGet = 0;
    var totalLossMoney = 0;
    var isWin = false;

    roundBets.forEach(function (b) {
      var status = parseInt(b.status, 10);
      var betMoney = parseFloat(b.money || b.price || 0);
      var getMoney = parseFloat(b.get || 0);

      if (status === 1) {
        isWin = true;
        if (getMoney > 0) {
          totalWinGet += getMoney;
        } else {
          totalWinGet += betMoney * 2;
        }
      } else if (status === 2) {
        totalLossMoney += betMoney;
      }
    });

    // Extract effective draw result if not provided
    var effectiveResult = (drawResult !== undefined && drawResult !== null && drawResult !== '') 
      ? drawResult 
      : ((roundBets[0] && roundBets[0].result !== undefined) ? roundBets[0].result : '');

    // Format Game Title & Result HTML
    var gameTitle = 'Win Go';
    var resultHtml = '';
    var animDelay = 1000;

    if (String(gameType).indexOf('wingo') !== -1) {
      var minStr = '1Min';
      if (gameType === 'wingo3' || gameType === '3') minStr = '3Min';
      if (gameType === 'wingo5' || gameType === '5') minStr = '5Min';
      if (gameType === 'wingo10' || gameType === '10') minStr = '10Min';
      gameTitle = 'Win Go ' + minStr;
      resultHtml = formatWinGoResultHtml(effectiveResult);
      animDelay = 1000;
    } else if (String(gameType).indexOf('5d') !== -1) {
      var d5Time = '1Min';
      if (gameType === '5d3' || gameType === '3') d5Time = '3Min';
      if (gameType === '5d5' || gameType === '5') d5Time = '5Min';
      if (gameType === '5d10' || gameType === '10') d5Time = '10Min';
      gameTitle = '5D Lotre ' + d5Time;
      resultHtml = format5DResultHtml(effectiveResult);
      animDelay = 2700; // Let 5D reel animation finish
    } else if (String(gameType).indexOf('k3') !== -1) {
      var k3Time = '1Min';
      if (gameType === 'k33' || gameType === '3') k3Time = '3Min';
      if (gameType === 'k35' || gameType === '5') k3Time = '5Min';
      if (gameType === 'k310' || gameType === '10') k3Time = '10Min';
      gameTitle = 'K3 Lotre ' + k3Time;
      resultHtml = formatK3ResultHtml(effectiveResult);
      animDelay = 1600; // Let dice roll animation finish
    }

    setTimeout(function () {
      if (isWin && totalWinGet > 0) {
        showGameWinModal({
          game: gameTitle,
          period: endedPeriod,
          resultHtml: resultHtml,
          amount: totalWinGet,
          bets: roundBets
        });
      } else if (totalLossMoney > 0) {
        showGameLossModal({
          game: gameTitle,
          period: endedPeriod,
          resultHtml: resultHtml,
          amount: totalLossMoney,
          bets: roundBets
        });
      }
    }, animDelay);
  }

  // Testing helpers for in-browser testing
  function testWinModal(amount) {
    showGameWinModal({
      game: 'Win Go 1Min',
      period: '202608270001',
      resultHtml: formatWinGoResultHtml(5),
      amount: amount || 196.00,
      bets: [{ bet: 'x', money: 100 }, { bet: '5', money: 20 }]
    });
  }

  function testLossModal(amount) {
    showGameLossModal({
      game: 'Win Go 1Min',
      period: '202608270001',
      resultHtml: formatWinGoResultHtml(2),
      amount: amount || 100.00,
      bets: [{ bet: 'x', money: 100 }]
    });
  }

  // Export functions to global scope
  window.initModalDom = initModalDom;
  window.showGameWinModal = showGameWinModal;
  window.showGameLossModal = showGameLossModal;
  window.closeGameResultModal = closeGameResultModal;
  window.checkAndShowGameResult = checkAndShowGameResult;
  window.testWinModal = testWinModal;
  window.testLossModal = testLossModal;

  // Initialize on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalDom);
  } else {
    initModalDom();
  }
})();
