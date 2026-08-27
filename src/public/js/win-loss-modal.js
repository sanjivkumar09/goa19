/**
 * DiuWin - Win & Loss Animation & Money Count Modal System
 * Provides animated celebratory / loss popups with exact money calculation,
 * confetti effects, audio chimes, and detailed game result breakdown.
 */

(function () {
  'use strict';

  // Processed periods tracking to prevent duplicate popups
  var processedPeriods = new Set();
  var activeTimer = null;
  var confettiAnimationId = null;

  // Initialize Modal HTML when DOM is ready
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

    // Event listeners for closing
    document.getElementById('game-result-close-x').addEventListener('click', closeGameResultModal);
    document.getElementById('modal-action-btn').addEventListener('click', closeGameResultModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeGameResultModal();
      }
    });
  }

  // Web Audio API Synthesis for Sound Effects
  function playSound(type) {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      var ctx = new AudioContext();

      if (type === 'win') {
        // Joyful fanfare arpeggio (C5, E5, G5, C6)
        var notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach(function (freq, index) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

          gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
          gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + index * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + index * 0.1);
          osc.stop(ctx.currentTime + index * 0.1 + 0.45);
        });
      } else {
        // Mellow soft loss tone
        var notesLoss = [392.00, 329.63, 261.63];
        notesLoss.forEach(function (freq, index) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);

          gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
          gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + index * 0.15 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + index * 0.15);
          osc.stop(ctx.currentTime + index * 0.15 + 0.4);
        });
      }
    } catch (e) {
      // Audio autoplay policy fallback
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
    var numberOfPieces = 75;
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
    duration = duration || 1200;
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
    var digits = String(resultStr).split('');
    var balls = digits.map(function (d) {
      return `<span class="res-ball bg-d5">${d}</span>`;
    }).join('');

    var sum = digits.reduce(function (acc, val) { return acc + (parseInt(val) || 0); }, 0);
    return `${balls} <span class="res-tag tag-bet">Sum ${sum}</span>`;
  }

  // Format K3 result dice HTML
  function formatK3ResultHtml(resultStr) {
    var digits = String(resultStr).split('');
    var sum = digits.reduce(function (acc, val) { return acc + (parseInt(val) || 0); }, 0);
    var isBig = sum >= 11;
    var diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    var diceHtml = digits.map(function (d) {
      var idx = (parseInt(d) || 1) - 1;
      return `<span style="font-size: 20px; margin: 0 1px;">${diceIcons[idx] || d}</span>`;
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
      return `<span class="res-tag tag-bet">${label} (₹${b.money || b.price})</span>`;
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

    card.className = 'game-result-modal is-win';
    sunburst.style.display = 'block';

    headerIcon.innerHTML = `<div class="win-icon-wrap"><span class="win-crown">👑</span></div>`;
    headerTitle.className = 'win-title';
    headerTitle.textContent = 'Congratulations';
    headerSub.className = 'win-subtitle';
    headerSub.textContent = '🎉 WINNING BONUS 🎉';

    moneyLabel.textContent = 'Bonus Amount';
    animateMoney(moneyVal, options.amount || 0, true, 1200);

    infoGame.textContent = options.game || 'Win Go';
    infoPeriod.textContent = options.period || '-';
    infoResult.innerHTML = options.resultHtml || '-';
    infoBet.innerHTML = formatBetsHtml(options.bets);

    actionBtn.textContent = 'Confirm & Collect';

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

    card.className = 'game-result-modal is-loss';
    sunburst.style.display = 'none';

    headerIcon.innerHTML = `<div class="loss-icon-wrap"><span>💔</span></div>`;
    headerTitle.className = 'loss-title';
    headerTitle.textContent = 'Better Luck Next Time';
    headerSub.className = 'loss-subtitle';
    headerSub.textContent = 'Game Draw Completed';

    moneyLabel.textContent = 'Loss Amount';
    animateMoney(moneyVal, options.amount || 0, false, 1000);

    infoGame.textContent = options.game || 'Win Go';
    infoPeriod.textContent = options.period || '-';
    infoResult.innerHTML = options.resultHtml || '-';
    infoBet.innerHTML = formatBetsHtml(options.bets);

    actionBtn.textContent = 'Continue Playing';

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
   * @param {string} gameType - 'wingo1', 'wingo3', 'wingo5', 'wingo10', '5d', 'k3'
   * @param {string|number} endedPeriod - The period number that just drew
   * @param {string|number} drawResult - The result number/string (e.g. 5, "12345", "123")
   * @param {Array} gamesList - The user's bet history list from GetMyEmerdList
   */
  function checkAndShowGameResult(gameType, endedPeriod, drawResult, gamesList) {
    if (!endedPeriod || !gamesList || !Array.isArray(gamesList) || gamesList.length === 0) return;

    var periodKey = String(gameType) + '_' + String(endedPeriod);
    if (processedPeriods.has(periodKey)) return;

    // Filter bets placed for this specific round
    var roundBets = gamesList.filter(function (item) {
      var itemPeriod = item.stage || item.period || item.id_product;
      return String(itemPeriod) === String(endedPeriod);
    });

    if (roundBets.length === 0) return; // User did not participate in this round

    processedPeriods.add(periodKey);

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
        // If get is recorded, use get; otherwise calculate payout
        if (getMoney > 0) {
          totalWinGet += getMoney;
        } else {
          totalWinGet += betMoney * 2; // fallback
        }
      } else if (status === 2) {
        totalLossMoney += betMoney;
      }
    });

    // Format Game Title & Result HTML
    var gameTitle = 'Win Go';
    var resultHtml = '';

    if (String(gameType).indexOf('wingo') !== -1) {
      var minStr = '1Min';
      if (gameType === 'wingo3' || gameType === '3') minStr = '3Min';
      if (gameType === 'wingo5' || gameType === '5') minStr = '5Min';
      if (gameType === 'wingo10' || gameType === '10') minStr = '10Min';
      gameTitle = 'Win Go ' + minStr;
      resultHtml = formatWinGoResultHtml(drawResult);
    } else if (String(gameType).indexOf('5d') !== -1) {
      var d5Time = '1Min';
      if (gameType === '5d3' || gameType === '3') d5Time = '3Min';
      if (gameType === '5d5' || gameType === '5') d5Time = '5Min';
      if (gameType === '5d10' || gameType === '10') d5Time = '10Min';
      gameTitle = '5D Lotre ' + d5Time;
      resultHtml = format5DResultHtml(drawResult);
    } else if (String(gameType).indexOf('k3') !== -1) {
      var k3Time = '1Min';
      if (gameType === 'k33' || gameType === '3') k3Time = '3Min';
      if (gameType === 'k35' || gameType === '5') k3Time = '5Min';
      if (gameType === 'k310' || gameType === '10') k3Time = '10Min';
      gameTitle = 'K3 Lotre ' + k3Time;
      resultHtml = formatK3ResultHtml(drawResult);
    }

    // Delay 600ms so user sees draw animation finish
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
    }, 600);
  }

  // Export functions to global scope
  window.initModalDom = initModalDom;
  window.showGameWinModal = showGameWinModal;
  window.showGameLossModal = showGameLossModal;
  window.closeGameResultModal = closeGameResultModal;
  window.checkAndShowGameResult = checkAndShowGameResult;

  // Initialize on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalDom);
  } else {
    initModalDom();
  }
})();
