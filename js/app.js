(function () {
  "use strict";

  var progress = {}; // { [id]: { completed: bool, completedAt, redeemed: bool, redeemedAt } }
  var pendingAction = null; // { type: 'complete' | 'redeem', id }
  var db = null;
  var usingLocalFallback = false;
  var LOCAL_KEY = "retosSayagoProgress";

  // Pruebas graficas (foto/video) adjuntadas a cada reto. Se guardan SOLO en
  // este dispositivo (localStorage), nunca en Firebase: un video en base64
  // supera facilmente el limite de 1MB por documento de Firestore, asi que
  // mezclarlo con el progreso compartido rompería la sincronizacion del grupo.
  var PROOF_KEY = "retosSayagoProofs";
  var MAX_PROOF_BYTES = 4 * 1024 * 1024; // 4MB: limite prudente para localStorage
  var proofs = loadProofs();
  var imageAvailability = {}; // file -> "ok" | "missing" (cache de comprobacion)

  var elChallengeList = document.getElementById("challengeList");
  var elVoucherList = document.getElementById("voucherList");
  var elEmptyVales = document.getElementById("emptyVales");
  var elProgressFill = document.getElementById("progressFill");
  var elProgressLabel = document.getElementById("progressLabel");
  var elPointsLabel = document.getElementById("pointsLabel");
  var elValesCount = document.getElementById("valesCount");
  var elConnStatus = document.getElementById("connStatus");
  var elConfirmModal = document.getElementById("confirmModal");
  var elConfirmText = document.getElementById("confirmText");
  var elUnlockModal = document.getElementById("unlockModal");
  var elUnlockPrize = document.getElementById("unlockPrize");
  var elConfettiLayer = document.getElementById("confettiLayer");
  var elPrizeGrids = document.getElementById("prizeGrids");

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
      db = firebase.firestore();
      elConnStatus.textContent = "🔄 Conectando con el grupo...";
      db.collection("retos").onSnapshot(
        function (snapshot) {
          var next = {};
          snapshot.forEach(function (doc) {
            next[doc.id] = doc.data();
          });
          progress = next;
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
      db.collection("retos").doc(String(id)).set(entry, { merge: true });
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
      db.collection("retos").doc(String(id)).set(
        { redeemed: true, redeemedAt: Date.now() },
        { merge: true }
      );
    }
  }

  function resetAllProgress() {
    progress = {};
    if (usingLocalFallback || !db) {
      localStorage.removeItem(LOCAL_KEY);
      renderAll();
    } else {
      db.collection("retos")
        .get()
        .then(function (snapshot) {
          var batch = db.batch();
          snapshot.forEach(function (doc) {
            batch.delete(doc.ref);
          });
          return batch.commit();
        });
    }
  }

  function renderAll() {
    renderChallenges();
    renderVouchers();
    renderProgress();
    renderWheel();
    renderPrizeGrids();
  }

  // --- Puntuacion ---------------------------------------------------------

  function getTotalPossiblePoints() {
    return CHALLENGES.reduce(function (sum, c) {
      return sum + (c.points || 0);
    }, 0);
  }

  function getEarnedPoints() {
    return CHALLENGES.reduce(function (sum, c) {
      var done = progress[c.id] && progress[c.id].completed;
      return sum + (done ? c.points || 0 : 0);
    }, 0);
  }

  // --- Pruebas graficas (foto/video) --------------------------------------

  function loadProofs() {
    try {
      return JSON.parse(localStorage.getItem(PROOF_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function persistProofs() {
    try {
      localStorage.setItem(PROOF_KEY, JSON.stringify(proofs));
    } catch (e) {
      alert(
        "No se pudo guardar la prueba en este dispositivo (puede que ocupe " +
          "demasiado). Prueba con un archivo más ligero."
      );
    }
  }

  function saveProofFile(id, file) {
    if (file.size > MAX_PROOF_BYTES) {
      alert("El archivo pesa demasiado (máx. 4 MB). Prueba con una foto o un vídeo más corto/ligero.");
      return;
    }
    var isVideo = file.type.indexOf("video") === 0;
    var reader = new FileReader();
    reader.onload = function () {
      proofs[id] = {
        dataUrl: reader.result,
        type: isVideo ? "video" : "image",
        name: file.name,
        savedAt: Date.now(),
      };
      persistProofs();
      renderAll();
    };
    reader.onerror = function () {
      alert("No se pudo leer el archivo. Inténtalo de nuevo.");
    };
    reader.readAsDataURL(file);
  }

  function removeProof(id) {
    delete proofs[id];
    persistProofs();
    renderAll();
  }

  function renderProofSection(challengeId) {
    var proof = proofs[challengeId];
    var section = document.createElement("div");
    section.className = "proof-section";

    if (proof) {
      var mediaEl = proof.type === "video" ? document.createElement("video") : document.createElement("img");
      mediaEl.className = "proof-media";
      mediaEl.src = proof.dataUrl;
      if (proof.type === "video") {
        mediaEl.controls = true;
      } else {
        mediaEl.alt = "Prueba del reto";
      }
      section.appendChild(mediaEl);

      var hint = document.createElement("p");
      hint.className = "proof-hint";
      hint.textContent = "📎 Prueba guardada (solo en este móvil)";
      section.appendChild(hint);

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "proof-remove-btn";
      removeBtn.textContent = "🗑️ Quitar prueba";
      removeBtn.addEventListener("click", function () {
        removeProof(challengeId);
      });
      section.appendChild(removeBtn);
    } else {
      var label = document.createElement("label");
      label.className = "proof-upload-label";
      label.textContent = "📎 Añadir foto/vídeo de prueba";

      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,video/*";
      input.className = "proof-upload-input";
      input.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) saveProofFile(challengeId, file);
      });
      label.appendChild(input);
      section.appendChild(label);
    }

    return section;
  }

  // --- Grid de imagenes premio ---------------------------------------------

  function checkImageAvailability(file, cb) {
    if (imageAvailability[file]) {
      cb(imageAvailability[file]);
      return;
    }
    var img = new Image();
    img.onload = function () {
      imageAvailability[file] = "ok";
      cb("ok");
    };
    img.onerror = function () {
      imageAvailability[file] = "missing";
      cb("missing");
    };
    img.src = file;
  }

  // Cada imagen premio se corta en PRIZE_GRID_ROWS x PRIZE_GRID_COLS piezas
  // (2x3 = 6). Las piezas se desbloquean en orden: primero se completa la
  // imagen 1, luego la 2, luego la 3, repartiendo el total de piezas segun
  // el porcentaje de puntos conseguidos sobre el total posible. Al ser un
  // calculo dinamico a partir de los "points" de CHALLENGES, no hace falta
  // tocar nada aqui si se reajustan los puntos de los retos.
  function getUnlockedPieceCount() {
    var totalPieces = PRIZE_IMAGES.length * PRIZE_GRID_ROWS * PRIZE_GRID_COLS;
    var totalPoints = getTotalPossiblePoints();
    if (totalPoints <= 0) return 0;
    var unlocked = Math.floor((getEarnedPoints() / totalPoints) * totalPieces);
    return Math.max(0, Math.min(totalPieces, unlocked));
  }

  function renderPrizeGrids() {
    if (!elPrizeGrids) return;
    var piecesPerImage = PRIZE_GRID_ROWS * PRIZE_GRID_COLS;
    var unlockedTotal = getUnlockedPieceCount();

    elPrizeGrids.innerHTML = "";

    PRIZE_IMAGES.forEach(function (prizeImg, imgIndex) {
      var unlockedForThis = Math.max(0, Math.min(piecesPerImage, unlockedTotal - imgIndex * piecesPerImage));

      var wrap = document.createElement("div");
      wrap.className = "prize-image-wrap" + (unlockedForThis === piecesPerImage ? " complete" : "");

      var title = document.createElement("p");
      title.className = "prize-image-title";
      title.textContent = prizeImg.label + " — " + unlockedForThis + "/" + piecesPerImage;
      wrap.appendChild(title);

      var grid = document.createElement("div");
      grid.className = "prize-grid";
      grid.style.setProperty("--prize-cols", PRIZE_GRID_COLS);
      grid.style.setProperty("--prize-rows", PRIZE_GRID_ROWS);
      wrap.appendChild(grid);

      elPrizeGrids.appendChild(wrap);

      checkImageAvailability(prizeImg.file, function (status) {
        grid.innerHTML = "";
        if (status === "missing") {
          var pending = document.createElement("div");
          pending.className = "prize-pending";
          pending.textContent = "📷 Imagen pendiente (" + prizeImg.file + ")";
          grid.appendChild(pending);
          return;
        }
        for (var i = 0; i < piecesPerImage; i++) {
          var row = Math.floor(i / PRIZE_GRID_COLS);
          var col = i % PRIZE_GRID_COLS;
          var piece = document.createElement("div");
          var unlocked = i < unlockedForThis;
          piece.className = "prize-piece" + (unlocked ? " unlocked" : " locked");
          if (unlocked) {
            piece.style.backgroundImage = "url('" + prizeImg.file + "')";
            piece.style.backgroundPosition =
              (PRIZE_GRID_COLS > 1 ? (col / (PRIZE_GRID_COLS - 1)) * 100 : 0) +
              "% " +
              (PRIZE_GRID_ROWS > 1 ? (row / (PRIZE_GRID_ROWS - 1)) * 100 : 0) +
              "%";
          } else {
            piece.textContent = "🔒";
          }
          grid.appendChild(piece);
        }
      });
    });
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

      var meta = document.createElement("div");
      meta.className = "challenge-meta";

      var prize = document.createElement("span");
      prize.className = "challenge-prize";
      prize.textContent = "🎟️ " + c.prize;
      meta.appendChild(prize);

      var points = document.createElement("span");
      points.className = "challenge-points";
      points.textContent = "⭐ " + (c.points || 0) + " pts";
      meta.appendChild(points);

      card.appendChild(meta);

      card.appendChild(renderProofSection(c.id));

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
        reto.textContent = "Reto #" + c.id + ": " + c.text + " (⭐ " + (c.points || 0) + " pts)";
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
    if (elPointsLabel) {
      elPointsLabel.textContent = "⭐ " + getEarnedPoints() + " / " + getTotalPossiblePoints() + " puntos";
    }
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
