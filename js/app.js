(function () {
  "use strict";

  var progress = {}; // { [id]: { completed: bool, completedAt, redeemed: bool, redeemedAt } }
  var pendingAction = null; // { type: 'complete' | 'redeem', id }
  var db = null;
  var usingLocalFallback = false;
  var LOCAL_KEY = "retosSayagoProgress";

  var elChallengeList = document.getElementById("challengeList");
  var elVoucherList = document.getElementById("voucherList");
  var elEmptyVales = document.getElementById("emptyVales");
  var elProgressFill = document.getElementById("progressFill");
  var elProgressLabel = document.getElementById("progressLabel");
  var elValesCount = document.getElementById("valesCount");
  var elConnStatus = document.getElementById("connStatus");
  var elConfirmModal = document.getElementById("confirmModal");
  var elConfirmText = document.getElementById("confirmText");
  var elUnlockModal = document.getElementById("unlockModal");
  var elUnlockPrize = document.getElementById("unlockPrize");
  var elConfettiLayer = document.getElementById("confettiLayer");

  var elWheelEmoji = document.getElementById("wheelEmoji");
  var elWheelNum = document.getElementById("wheelNum");
  var elWheelText = document.getElementById("wheelText");
  var elWheelPrize = document.getElementById("wheelPrize");
  var elWheelActions = document.getElementById("wheelActions");

  var wheelSpinning = false;
  var wheelTarget = null;
  var WHEEL_SPIN_DELAYS = [45, 45, 50, 55, 65, 75, 90, 110, 135, 165, 200, 240, 290, 350, 420, 500];

  function initFirebase() {
    try {
      if (!firebaseConfig || firebaseConfig.apiKey === "TU_API_KEY") {
        throw new Error("Firebase no configurado todavia");
      }
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      elConnStatus.textContent = "🔄 Conectando con el grupo...";
      db.ref("retos").on(
        "value",
        function (snapshot) {
          progress = snapshot.val() || {};
          elConnStatus.textContent = "✅ Progreso sincronizado con todo el grupo";
          renderAll();
        },
        function (err) {
          console.error(err);
          elConnStatus.textContent = "⚠️ Sin conexion al grupo. Usando modo local.";
          fallbackToLocal();
        }
      );
    } catch (e) {
      console.warn(e.message);
      elConnStatus.textContent = "⚠️ Firebase no configurado. Progreso solo en este movil.";
      fallbackToLocal();
    }
  }

  function fallbackToLocal() {
    usingLocalFallback = true;
    try {
      progress = JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
    } catch (e) {
      progress = {};
    }
    renderAll();
  }

  function setChallengeDone(id) {
    var entry = { completed: true, completedAt: Date.now() };
    if (usingLocalFallback || !db) {
      progress[id] = entry;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
      renderAll();
    } else {
      db.ref("retos/" + id).set(entry);
    }
  }

  function redeemVoucher(id) {
    var current = progress[id] || {};
    var entry = {
      completed: true,
      completedAt: current.completedAt || Date.now(),
      redeemed: true,
      redeemedAt: Date.now(),
    };
    if (usingLocalFallback || !db) {
      progress[id] = entry;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
      renderAll();
    } else {
      db.ref("retos/" + id).update({ redeemed: true, redeemedAt: Date.now() });
    }
  }

  function resetAllProgress() {
    progress = {};
    if (usingLocalFallback || !db) {
      localStorage.removeItem(LOCAL_KEY);
    } else {
      db.ref("retos").remove();
    }
    renderAll();
  }

  function renderAll() {
    renderChallenges();
    renderVouchers();
    renderProgress();
    renderWheel();
  }

  function renderChallenges() {
    elChallengeList.innerHTML = "";
    CHALLENGES.forEach(function (c) {
      var done = !!(progress[c.id] && progress[c.id].completed);
      var card = document.createElement("div");
      card.className = "challenge-card" + (done ? " done" : "") + (c.star ? " star" : "");

      var num = document.createElement("div");
      num.className = "challenge-num";
      num.textContent = "#" + c.id;
      card.appendChild(num);

      var text = document.createElement("p");
      text.className = "challenge-text";
      text.textContent = c.text;
      card.appendChild(text);

      var prize = document.createElement("span");
      prize.className = "challenge-prize";
      prize.textContent = "🎟️ " + c.prize;
      card.appendChild(prize);

      var actions = document.createElement("div");
      actions.className = "challenge-actions";

      var btn = document.createElement("button");
      if (done) {
        btn.className = "btn btn-done";
        btn.textContent = "✅ COMPLETADO";
        btn.disabled = true;
      } else {
        btn.className = "btn btn-do";
        btn.textContent = "MARCAR HECHO 🔥";
        btn.addEventListener("click", function () {
          openConfirm(
            '¿Seguro que se ha completado el reto "' + c.text + '"?',
            { type: "complete", id: c.id }
          );
        });
      }
      actions.appendChild(btn);
      card.appendChild(actions);

      elChallengeList.appendChild(card);
    });
  }

  function renderVouchers() {
    var unlocked = CHALLENGES.filter(function (c) {
      return progress[c.id] && progress[c.id].completed;
    });

    elValesCount.textContent = unlocked.length;
    elEmptyVales.style.display = unlocked.length ? "none" : "block";
    elVoucherList.innerHTML = "";

    unlocked
      .slice()
      .sort(function (a, b) {
        var ta = (progress[a.id] && progress[a.id].completedAt) || 0;
        var tb = (progress[b.id] && progress[b.id].completedAt) || 0;
        return tb - ta;
      })
      .forEach(function (c) {
        var redeemed = !!(progress[c.id] && progress[c.id].redeemed);

        var card = document.createElement("div");
        card.className = "voucher-card" + (redeemed ? " redeemed" : "");

        var icon = document.createElement("div");
        icon.className = "voucher-icon";
        icon.textContent = redeemed ? "✅" : "🎟️";
        card.appendChild(icon);

        var info = document.createElement("div");
        info.className = "voucher-info";

        var prize = document.createElement("p");
        prize.className = "voucher-prize";
        prize.textContent = c.prize;
        info.appendChild(prize);

        var reto = document.createElement("p");
        reto.className = "voucher-reto";
        reto.textContent = "Reto #" + c.id + ": " + c.text;
        info.appendChild(reto);

        card.appendChild(info);

        var btn = document.createElement("button");
        if (redeemed) {
          btn.className = "btn btn-redeemed";
          btn.textContent = "CANJEADO";
          btn.disabled = true;
        } else {
          btn.className = "btn btn-redeem";
          btn.textContent = "CANJEAR 🎁";
          btn.addEventListener("click", function () {
            openConfirm(
              '¿Canjear el vale de "' + c.prize + '"? Una vez canjeado no se puede deshacer.',
              { type: "redeem", id: c.id }
            );
          });
        }
        card.appendChild(btn);

        elVoucherList.appendChild(card);
      });
  }

  function renderProgress() {
    var total = CHALLENGES.length;
    var done = CHALLENGES.filter(function (c) {
      return progress[c.id] && progress[c.id].completed;
    }).length;
    var pct = Math.round((done / total) * 100);
    elProgressFill.style.width = pct + "%";
    elProgressLabel.textContent = done + " / " + total + " retos";
  }

  function openConfirm(message, action) {
    pendingAction = action;
    elConfirmText.textContent = message;
    elConfirmModal.classList.remove("hidden");
  }

  function closeConfirm() {
    pendingAction = null;
    elConfirmModal.classList.add("hidden");
  }

  function openUnlock(prizeText) {
    elUnlockPrize.textContent = prizeText;
    elUnlockModal.classList.remove("hidden");
    launchConfetti();
  }

  function closeUnlock() {
    elUnlockModal.classList.add("hidden");
  }

  function launchConfetti() {
    var colors = ["#ff2e88", "#ffd23f", "#22e6d4", "#7b2ff7"];
    for (var i = 0; i < 60; i++) {
      var piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
      piece.style.animationDelay = Math.random() * 0.3 + "s";
      elConfettiLayer.appendChild(piece);
      (function (el) {
        el.addEventListener("animationend", function () {
          el.remove();
        });
      })(piece);
    }
  }

  function getAvailableChallenges() {
    return CHALLENGES.filter(function (c) {
      return !(progress[c.id] && progress[c.id].completed);
    });
  }

  function renderWheel() {
    if (wheelSpinning) return;
    if (wheelTarget && !(progress[wheelTarget.id] && progress[wheelTarget.id].completed)) {
      renderWheelResult(wheelTarget);
    } else {
      wheelTarget = null;
      renderWheelIdle();
    }
  }

  function renderWheelIdle() {
    elWheelEmoji.textContent = "🎲";
    elWheelEmoji.classList.remove("spinning");
    elWheelNum.textContent = "";
    elWheelPrize.style.display = "none";

    var available = getAvailableChallenges();
    if (available.length === 0) {
      elWheelText.textContent = "¡No quedan retos! Os habéis fundido los 36. Leyendas. 🏆";
      elWheelActions.innerHTML = "";
      return;
    }

    elWheelText.textContent = "Pulsa el botón para que la ruleta elija vuestro próximo reto";
    elWheelActions.innerHTML = "";
    var spinBtn = document.createElement("button");
    spinBtn.id = "wheelSpinBtn";
    spinBtn.className = "btn btn-yes wheel-spin-btn";
    spinBtn.textContent = "GIRAR RULETA 🎲";
    spinBtn.addEventListener("click", spinWheel);
    elWheelActions.appendChild(spinBtn);
  }

  function renderWheelResult(challenge) {
    elWheelEmoji.textContent = "🎯";
    elWheelEmoji.classList.remove("spinning");
    elWheelNum.textContent = "RETO #" + challenge.id;
    elWheelText.textContent = challenge.text;
    elWheelPrize.textContent = "🎟️ " + challenge.prize;
    elWheelPrize.style.display = "inline-block";

    elWheelActions.innerHTML = "";

    var doBtn = document.createElement("button");
    doBtn.className = "btn btn-do wheel-spin-btn";
    doBtn.textContent = "MARCAR HECHO 🔥";
    doBtn.addEventListener("click", function () {
      openConfirm(
        '¿Seguro que se ha completado el reto "' + challenge.text + '"?',
        { type: "complete", id: challenge.id }
      );
    });
    elWheelActions.appendChild(doBtn);

    var againBtn = document.createElement("button");
    againBtn.className = "btn wheel-secondary-btn";
    againBtn.textContent = "GIRAR OTRA VEZ 🎲";
    againBtn.addEventListener("click", spinWheel);
    elWheelActions.appendChild(againBtn);
  }

  function showWheelFace(challenge) {
    elWheelNum.textContent = "RETO #" + challenge.id;
    elWheelText.textContent = challenge.text;
    elWheelPrize.textContent = "🎟️ " + challenge.prize;
    elWheelPrize.style.display = "inline-block";
  }

  function spinWheel() {
    if (wheelSpinning) return;
    var available = getAvailableChallenges();
    if (available.length === 0) {
      renderWheelIdle();
      return;
    }

    wheelSpinning = true;
    elWheelEmoji.textContent = "🎰";
    elWheelEmoji.classList.add("spinning");
    elWheelActions.innerHTML = "";

    var target = available[Math.floor(Math.random() * available.length)];

    function step(i) {
      if (i >= WHEEL_SPIN_DELAYS.length) {
        wheelSpinning = false;
        wheelTarget = target;
        showWheelFace(target);
        launchConfetti();
        renderWheelResult(target);
        return;
      }
      var candidate = available[Math.floor(Math.random() * available.length)];
      showWheelFace(candidate);
      setTimeout(function () {
        step(i + 1);
      }, WHEEL_SPIN_DELAYS[i]);
    }

    step(0);
  }

  document.getElementById("confirmYes").addEventListener("click", function () {
    if (!pendingAction) return;
    var action = pendingAction;
    closeConfirm();

    if (action.type === "complete") {
      var challenge = CHALLENGES.find(function (c) {
        return c.id === action.id;
      });
      setChallengeDone(action.id);
      if (challenge) openUnlock(challenge.prize);
    } else if (action.type === "redeem") {
      redeemVoucher(action.id);
    }
  });

  document.getElementById("confirmNo").addEventListener("click", closeConfirm);
  document.getElementById("unlockClose").addEventListener("click", closeUnlock);

  var initialWheelSpinBtn = document.getElementById("wheelSpinBtn");
  if (initialWheelSpinBtn) initialWheelSpinBtn.addEventListener("click", spinWheel);

  document.getElementById("resetBtn").addEventListener("click", function () {
    var ok = confirm("Esto borrara TODO el progreso compartido con el grupo. ¿Seguro?");
    if (ok) {
      var typed = prompt('Escribe "REINICIAR" para confirmar:');
      if (typed === "REINICIAR") resetAllProgress();
    }
  });

  var tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabButtons.forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      document.querySelectorAll(".tab-panel").forEach(function (p) {
        p.classList.remove("active");
      });
      var target = btn.getAttribute("data-tab");
      document.getElementById(target + "Tab").classList.add("active");
    });
  });

  initFirebase();
})();
