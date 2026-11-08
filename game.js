'use strict';

// ─────────────────────────────────────────────────────────────────
//  PALETTE — 9 couleurs vives
// ─────────────────────────────────────────────────────────────────
const ALL_COLORS = [
    { name: 'rouge',  hex: '#FF4757' },
    { name: 'bleu',   hex: '#3DBEFF' },
    { name: 'vert',   hex: '#2ED573' },
    { name: 'jaune',  hex: '#FFD32A' },
    { name: 'mauve',  hex: '#B47BFF' },
    { name: 'orange', hex: '#FF7F50' },
    { name: 'rose',   hex: '#FF6B9D' },
    { name: 'cyan',   hex: '#00D2D3' },
    { name: 'lime',   hex: '#A3CB38' },
];

// Formes pour les daltoniens (superposées aux couleurs)
const COLOR_SHAPES = ['●', '■', '▲', '★', '♦', '♥', '◆', '✦', '✿'];

// Thèmes narratifs (mode Aventure)
const LEVEL_THEMES = [
    'La Lagune des Bulles',    'Le Récif Coloré',       'La Grotte des Perles',
    'Le Banc de Corail',       'La Danse des Méduses',   'La Baie Enchantée',
    'Le Jardin Marin',         'Les Profondeurs Bleues', 'Le Temple des Poissons',
    'La Grande Barrière',      "L'Abîme Mystérieux",    'La Cité Engloutie',
    'Le Vortex des Couleurs',  'La Forêt de Coraux',    'Le Labyrinthe Marin',
    'Les Étoiles de Mer',      'Le Maelstrom',           'La Chambre des Secrets',
    "L'Île des Défis",         'Le Défi Légendaire',
];

// ─────────────────────────────────────────────────────────────────
//  20 NIVEAUX
// ─────────────────────────────────────────────────────────────────
const LEVELS = [
    /* 01 */ { label: 'Niveau 1  — Découverte 🌱',       numColors: 2, numEmpty: 2, capacity: 4 },
    /* 02 */ { label: 'Niveau 2  — Débutant ⭐',          numColors: 3, numEmpty: 2, capacity: 4 },
    /* 03 */ { label: 'Niveau 3  — Débutant ⭐',          numColors: 4, numEmpty: 2, capacity: 4 },
    /* 04 */ { label: 'Niveau 4  — Apprenti ⭐⭐',        numColors: 4, numEmpty: 2, capacity: 4 },
    /* 05 */ { label: 'Niveau 5  — Apprenti ⭐⭐',        numColors: 5, numEmpty: 2, capacity: 4 },
    /* 06 */ { label: 'Niveau 6  — Facile ⭐⭐',          numColors: 5, numEmpty: 2, capacity: 4 },
    /* 07 */ { label: 'Niveau 7  — Facile ⭐⭐',          numColors: 6, numEmpty: 2, capacity: 4 },
    /* 08 */ { label: 'Niveau 8  — Intermédiaire ⭐⭐⭐', numColors: 6, numEmpty: 2, capacity: 4 },
    /* 09 */ { label: 'Niveau 9  — Intermédiaire ⭐⭐⭐', numColors: 7, numEmpty: 2, capacity: 4 },
    /* 10 */ { label: 'Niveau 10 — Avancé ⭐⭐⭐ 🎯',     numColors: 7, numEmpty: 2, capacity: 4 },
    /* 11 */ { label: 'Niveau 11 — Profond ⭐⭐⭐⭐',     numColors: 4, numEmpty: 2, capacity: 5 },
    /* 12 */ { label: 'Niveau 12 — Profond ⭐⭐⭐⭐',     numColors: 5, numEmpty: 2, capacity: 5 },
    /* 13 */ { label: 'Niveau 13 — Difficile ⭐⭐⭐⭐',   numColors: 5, numEmpty: 2, capacity: 5 },
    /* 14 */ { label: 'Niveau 14 — Difficile ⭐⭐⭐⭐',   numColors: 6, numEmpty: 2, capacity: 5 },
    /* 15 */ { label: 'Niveau 15 — Difficile ⭐⭐⭐⭐',   numColors: 6, numEmpty: 2, capacity: 5 },
    /* 16 */ { label: 'Niveau 16 — Expert ⭐⭐⭐⭐⭐',    numColors: 7, numEmpty: 2, capacity: 5 },
    /* 17 */ { label: 'Niveau 17 — Expert ⭐⭐⭐⭐⭐',    numColors: 7, numEmpty: 2, capacity: 5 },
    /* 18 */ { label: 'Niveau 18 — Maître 🔥',             numColors: 8, numEmpty: 2, capacity: 5 },
    /* 19 */ { label: 'Niveau 19 — Maître 🔥',             numColors: 8, numEmpty: 2, capacity: 5 },
    /* 20 */ { label: 'Niveau 20 — LÉGENDAIRE 💎',         numColors: 9, numEmpty: 2, capacity: 5 },
];

// ─────────────────────────────────────────────────────────────────
//  ÉTAT DU JEU (core — inchangé)
// ─────────────────────────────────────────────────────────────────
let tubes           = [];
let selectedTube    = null;
let isAnimating     = false;
let moveCount       = 0;
let currentLevel    = 0;
let currentCapacity = 4;

// ── Undo ──────────────────────────────────────────────────────────
let history      = [];
let undoCount    = 0;
let maxUndos     = 3;  // ajusté par setMode() : bébé=∞, aventure=3, champion=1

// ── Mode ──────────────────────────────────────────────────────────
let currentMode = 'adventure'; // 'baby' | 'adventure' | 'champion'

// ── Combo (aventure) ─────────────────────────────────────────────
let streak = 0;

// ── Sourdine ──────────────────────────────────────────────────────
let muted = false;

// ── Cache localStorage (évite un JSON.parse par sauvegarde) ──────
let _progressCache = null;

// ── Timer (champion) ─────────────────────────────────────────────
let timerInterval = null;
let timerSeconds  = 0;
let timerRunning  = false;

// ── Mascotte idle ─────────────────────────────────────────────────
let mascotIdleTimer = null;

// ─────────────────────────────────────────────────────────────────
//  WEB AUDIO — effets sonores sans fichier externe
// ─────────────────────────────────────────────────────────────────
let _audioCtx = null;

function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Les navigateurs suspendent l'AudioContext jusqu'au premier geste utilisateur
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
}

// Crée un couple oscillateur+gain indépendant et le connecte à la sortie.
// Chaque note a son propre gain pour éviter les conflits de scheduling.
function _note(ctx, type, freq, startT, stopT, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, startT);
    g.gain.exponentialRampToValueAtTime(0.001, stopT);
    o.start(startT);
    o.stop(stopT + 0.02);
}

function playSound(type) {
    if (muted) return;
    try {
        const ctx = getAudioCtx();
        const t   = ctx.currentTime;

        if (type === 'pour') {
            // Deux notes descendantes décalées — chacune son propre gain
            _note(ctx, 'sine', 500, t,        t + 0.34, 0.16);
            _note(ctx, 'sine', 410, t + 0.13, t + 0.47, 0.13);
        } else if (type === 'invalid') {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sawtooth'; o.connect(g); g.connect(ctx.destination);
            o.frequency.setValueAtTime(140, t);
            o.frequency.exponentialRampToValueAtTime(80, t + 0.15);
            g.gain.setValueAtTime(0.22, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            o.start(t); o.stop(t + 0.20);
        } else if (type === 'complete') {
            _note(ctx, 'triangle', 880,  t,       t + 0.40, 0.20);
            _note(ctx, 'triangle', 1100, t + 0.08, t + 0.40, 0.12);
        } else if (type === 'win') {
            // Fanfare : chaque note a son propre nœud gain
            [523, 659, 784, 1047].forEach((freq, i) => {
                _note(ctx, 'triangle', freq, t + i * 0.13, t + i * 0.13 + 0.25, 0.18);
            });
        } else if (type === 'combo') {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'square'; o.connect(g); g.connect(ctx.destination);
            o.frequency.setValueAtTime(440, t);
            o.frequency.exponentialRampToValueAtTime(880, t + 0.25);
            g.gain.setValueAtTime(0.18, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
            o.start(t); o.stop(t + 0.32);
        } else if (type === 'baby') {
            _note(ctx, 'sine', 1300, t, t + 0.16, 0.14);
        }
    } catch (_) { /* AudioContext non dispo → silence */ }
}

// ─────────────────────────────────────────────────────────────────
//  OPTIMAL & ÉTOILES
// ─────────────────────────────────────────────────────────────────
function getOptimalMoves(lvl) {
    return Math.ceil(lvl.numColors * lvl.capacity * 0.6);
}

function calculateStars(moves, optimal) {
    // Bébé : toujours 3 étoiles — on encourage, on ne pénalise pas
    if (currentMode === 'baby') return 3;
    // Champion : seuils stricts (3⭐ = optimal, 2⭐ = optimal×1.3, sinon 1⭐)
    if (currentMode === 'champion') {
        if (moves <= optimal)                    return 3;
        if (moves <= Math.round(optimal * 1.3))  return 2;
        return 1;
    }
    // Aventure : seuils normaux
    if (moves <= optimal)                        return 3;
    if (moves <= Math.round(optimal * 1.85))     return 2;
    return 1;
}

function starsHTML(n) {
    return '⭐'.repeat(n) + '☆'.repeat(3 - n);
}

// ─────────────────────────────────────────────────────────────────
//  LOCALSTORAGE — PROGRESSION
// ─────────────────────────────────────────────────────────────────
const LS_KEY = 'tubeColorGame_v2';

function loadProgress() {
    if (!_progressCache) {
        try {
            const stored = JSON.parse(localStorage.getItem(LS_KEY));
            _progressCache = stored && typeof stored === 'object' && !Array.isArray(stored)
                ? stored
                : {};
        }
        catch (_) { _progressCache = {}; }
    }
    return _progressCache;
}

function saveProgress(level, stars, moves) {
    const data = loadProgress(); // utilise le cache en mémoire
    const prev = data[level] || {};
    data[level] = {
        stars: Math.max(prev.stars || 0, stars),
        best:  prev.best ? Math.min(prev.best, moves) : moves,
    };
    data.maxUnlocked = Math.max(data.maxUnlocked || 0, level + 1);
    data.mode   = currentMode;
    data.muted  = muted;
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (_) { /* quota dépassé */ }
}

function getBestScore(level) {
    const d = loadProgress();
    return d[level] ? d[level].best : null;
}

// ─────────────────────────────────────────────────────────────────
//  GESTION DES MODES
// ─────────────────────────────────────────────────────────────────
function setMode(mode) {
    currentMode = mode;
    document.body.dataset.mode = mode;

    // ── Taille des tubes ──────────────────────────────────────────
    const isMobile = window.innerWidth <= 480;
    const slotSize = (mode === 'baby' && !isMobile) ? 66 : (isMobile ? 44 : 54);
    const rimSize  = Math.round(slotSize * 0.89);
    const gapSize  = mode === 'baby' ? 22 : 18;
    const root     = document.documentElement;
    root.style.setProperty('--slot-size', `${slotSize}px`);
    root.style.setProperty('--tube-rim',  `${rimSize}px`);
    root.style.setProperty('--tube-gap',  `${gapSize}px`);

    // ── Règles d'annulation par mode ──────────────────────────────
    //   Bébé     : illimité (on ne punit pas l'enfant)
    //   Aventure : 3 (standard)
    //   Champion : 1 (compétitif strict)
    if (mode === 'baby')      maxUndos = 999;
    else if (mode === 'champion') maxUndos = 1;
    else                      maxUndos = 3;

    // ── Visibilité des éléments ───────────────────────────────────
    _el('moveCounterEl').style.display = mode === 'baby'      ? 'none' : '';
    _el('championBar').style.display   = mode === 'champion'  ? 'flex' : 'none';
    _el('fishMascot').style.display    = mode === 'adventure' ? 'flex' : 'none';
    _el('levelTheme').style.display    = mode === 'adventure' ? 'block' : 'none';

    // Indice caché en mode champion (pas d'aide externe)
    const hintBtn = _el('hintBtn');
    if (hintBtn) hintBtn.style.display = mode === 'champion' ? 'none' : '';

    // Champion : chrono activé et affiché automatiquement
    if (mode === 'champion') {
        const tog = _el('chronoToggle');
        const disp = _el('chronoDisplay');
        if (tog)  tog.checked = true;
        if (disp) disp.style.display = 'inline';
    }
}

function showModeSelector() {
    _el('modeOverlay').classList.add('visible');
}

function hideModeSelector() {
    _el('modeOverlay').classList.remove('visible');
}

// ─────────────────────────────────────────────────────────────────
//  FOND DYNAMIQUE PAR TRANCHE
// ─────────────────────────────────────────────────────────────────
function applyLevelBackground() {
    const tier = Math.floor(currentLevel / 5);
    const bgs  = [
        'linear-gradient(160deg,#1a1a6e,#3a0070,#6b006b,#0d3b6e)', // 1–5   : océan
        'linear-gradient(160deg,#0a3d0a,#1a5e1a,#0d400d,#154a00)', // 6–10  : forêt
        'linear-gradient(160deg,#180055,#350040,#180030,#0a0060)', // 11–15 : cosmos
        'linear-gradient(160deg,#6e1000,#4a1200,#380600,#180800)', // 16–20 : lave
    ];
    document.body.style.background = bgs[Math.min(tier, 3)];
}

// ─────────────────────────────────────────────────────────────────
//  INITIALISATION (étendue)
// ─────────────────────────────────────────────────────────────────
function initGame() {
    // Mode bébé : limité aux 10 premiers niveaux (2–4 couleurs max)
    if (currentMode === 'baby') currentLevel = Math.min(currentLevel, 9);

    const lvl       = LEVELS[currentLevel];
    currentCapacity = lvl.capacity;

    document.documentElement.style.setProperty('--tube-capacity', currentCapacity);

    // Pool de couleurs mélangé
    const pool = [];
    for (let c = 0; c < lvl.numColors; c++) {
        for (let k = 0; k < currentCapacity; k++) pool.push(c);
    }
    shuffle(pool);

    tubes = [];
    for (let t = 0; t < lvl.numColors; t++)  tubes.push(pool.splice(0, currentCapacity));
    for (let t = 0; t < lvl.numEmpty; t++)    tubes.push([]);

    // Mode bébé : tube vide supplémentaire pour faciliter les déplacements
    if (currentMode === 'baby') tubes.push([]);

    // Reset état
    selectedTube = null;
    isAnimating  = false;
    moveCount    = 0;
    history      = [];
    undoCount    = 0;
    streak       = 0;

    resetTimer();
    hideDeadlockBanner();
    applyLevelBackground();
    updateUI();
    updateUndoBtn();
    updateGlobalProgress();
    hideWin();
    renderTubes();

    // Mode bébé : flèche tutorielle au niveau 1
    if (currentMode === 'baby' && currentLevel === 0) {
        setTimeout(positionTutorialArrow, 350);
    } else {
        hideTutorialArrow();
    }

    // Mode aventure : mascotte
    if (currentMode === 'adventure') {
        updateMascot('idle');
        resetMascotIdleTimer();
    }

    // Mode champion : optimal + record
    if (currentMode === 'champion') {
        _el('optimalMoves').textContent = getOptimalMoves(lvl);
        const best = getBestScore(currentLevel);
        _el('bestScore').textContent = best !== null ? best : '--';
    }
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// ─────────────────────────────────────────────────────────────────
//  RÈGLES (inchangées)
// ─────────────────────────────────────────────────────────────────
function canPour(from, to) {
    if (from === to) return false;
    const src = tubes[from], dst = tubes[to];
    if (src.length === 0)              return false;
    if (dst.length >= currentCapacity) return false;
    if (dst.length === 0)              return true;
    return src[src.length - 1] === dst[dst.length - 1];
}

function pour(from, to) {
    const src = tubes[from], dst = tubes[to];
    const top = src[src.length - 1];
    let count = 0;
    for (let i = src.length - 1; i >= 0 && src[i] === top; i--) count++;
    const move = Math.min(count, currentCapacity - dst.length);
    for (let k = 0; k < move; k++) dst.push(src.pop());
}

function checkWin() {
    return tubes.every(t =>
        t.length === 0 ||
        (t.length === currentCapacity && t.every(c => c === t[0]))
    );
}

function isComplete(tube) {
    return tube.length === currentCapacity && tube.every(c => c === tube[0]);
}

// ─────────────────────────────────────────────────────────────────
//  SOURDINE
// ─────────────────────────────────────────────────────────────────
function toggleMute() {
    muted = !muted;
    const btn = _el('muteBtn');
    if (btn) btn.textContent = muted ? '🔊 Son' : '🔇 Muet';
    // persister dans le cache et localStorage
    const data = loadProgress();
    data.muted = muted;
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (_) { /* quota dépassé */ }
}

// ─────────────────────────────────────────────────────────────────
//  DÉTECTION DE BLOCAGE
// ─────────────────────────────────────────────────────────────────
function isDeadlocked() {
    return !tubes.some((_, f) => tubes.some((_, t) => canPour(f, t)));
}

function showDeadlockBanner() {
    const b = _el('deadlockBanner');
    if (b) b.classList.add('visible');
}

function hideDeadlockBanner() {
    const b = _el('deadlockBanner');
    if (b) b.classList.remove('visible');
}

// ─────────────────────────────────────────────────────────────────
//  INDICE (💡)
// ─────────────────────────────────────────────────────────────────
function showHint() {
    if (isAnimating) return;
    for (let f = 0; f < tubes.length; f++) {
        for (let t = 0; t < tubes.length; t++) {
            if (!canPour(f, t)) continue;
            const fromEl = document.querySelector(`.tube-wrapper[data-index="${f}"]`);
            const toEl   = document.querySelector(`.tube-wrapper[data-index="${t}"]`);
            if (fromEl) fromEl.classList.add('hint-from');
            if (toEl)   toEl.classList.add('hint-to');
            setTimeout(() => {
                if (fromEl) fromEl.classList.remove('hint-from');
                if (toEl)   toEl.classList.remove('hint-to');
            }, 1500);
            return;
        }
    }
    // Aucun coup → confirme le blocage
    showDeadlockBanner();
}

// ─────────────────────────────────────────────────────────────────
//  PROGRESSION GLOBALE
// ─────────────────────────────────────────────────────────────────
function updateGlobalProgress() {
    const data = loadProgress();
    let completed = 0, totalStars = 0;
    for (let i = 0; i < LEVELS.length; i++) {
        if (data[i]) { completed++; totalStars += data[i].stars || 0; }
    }
    const el = _el('globalProgress');
    if (el) {
        el.textContent = completed > 0
            ? `${completed} / ${LEVELS.length} niveaux · ${totalStars} ⭐ / ${LEVELS.length * 3}`
            : '';
    }
}

// ─────────────────────────────────────────────────────────────────
//  UNDO
// ─────────────────────────────────────────────────────────────────
function saveState() {
    if (undoCount >= maxUndos) return; // quota atteint
    history.push({ tubes: tubes.map(t => [...t]), moves: moveCount });
}

function undoMove() {
    if (history.length === 0 || isAnimating) return;
    const snap  = history.pop();
    tubes       = snap.tubes;
    moveCount   = snap.moves;
    undoCount++;
    selectedTube = null;
    streak       = 0;
    hideDeadlockBanner();
    updateUI();
    updateUndoBtn();
    renderTubes();
    playSound('invalid');
    if (currentMode === 'adventure') updateMascot('sad');
}

function updateUndoBtn() {
    const btn  = _el('undoBtn');
    if (currentMode === 'baby') {
        _el('undoLeft').textContent = '∞';
        btn.disabled = (history.length === 0);
    } else {
        const left = maxUndos - undoCount;
        _el('undoLeft').textContent = left;
        btn.disabled = (history.length === 0 || left === 0);
    }
}

// ─────────────────────────────────────────────────────────────────
//  TIMER (champion)
// ─────────────────────────────────────────────────────────────────
function startTimer() {
    if (timerRunning) return;
    timerRunning  = true;
    timerInterval = setInterval(() => { timerSeconds++; updateTimerDisplay(); }, 1000);
}

function stopTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    timerSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const el = _el('chronoDisplay');
    if (!el) return;
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const s = String(timerSeconds % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
}

function formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─────────────────────────────────────────────────────────────────
//  MASCOTTE POISSON (aventure)
// ─────────────────────────────────────────────────────────────────
const MASCOT = {
    idle:     { emoji: '🐟', msg: 'À toi de jouer !'  },
    happy:    { emoji: '😊', msg: 'Bien joué !'        },
    excited:  { emoji: '🤩', msg: 'SUPER !'            },
    sad:      { emoji: '😮', msg: 'Essaie encore !'    },
    sleeping: { emoji: '😴', msg: 'Zzz...'             },
    win:      { emoji: '🎉', msg: 'TU AS GAGNÉ !'      },
};

function updateMascot(state) {
    if (currentMode !== 'adventure') return;
    const d      = MASCOT[state] || MASCOT.idle;
    const bubble = _el('fishBubble');
    _el('fishEmoji').textContent  = d.emoji;
    _el('fishMessage').textContent = d.msg;
    bubble.classList.add('visible');
    clearTimeout(bubble._t);
    bubble._t = setTimeout(() => bubble.classList.remove('visible'), 2600);
    resetMascotIdleTimer();
}

function resetMascotIdleTimer() {
    clearTimeout(mascotIdleTimer);
    if (currentMode === 'baby') {
        // Bébé : après 25 s sans jouer, afficher un indice automatiquement
        mascotIdleTimer = setTimeout(() => { showHint(); }, 25000);
    } else {
        mascotIdleTimer = setTimeout(() => updateMascot('sleeping'), 10000);
    }
}

// ─────────────────────────────────────────────────────────────────
//  COMBO (aventure)
// ─────────────────────────────────────────────────────────────────
function triggerCombo(count) {
    _el('comboCount').textContent = count;
    const notif = _el('comboNotif');
    notif.classList.add('visible');
    setTimeout(() => notif.classList.remove('visible'), 1700);
    playSound('combo');
    updateMascot('excited');
}

// ─────────────────────────────────────────────────────────────────
//  FLÈCHE TUTORIELLE (bébé)
// ─────────────────────────────────────────────────────────────────
function positionTutorialArrow() {
    const arrow = _el('tutorialArrow');
    const first = document.querySelector('.tube-wrapper[data-index="0"]');
    if (!arrow || !first) return;
    const r = first.getBoundingClientRect();
    arrow.style.left    = `${r.left + r.width / 2 - 24}px`;
    arrow.style.top     = `${r.top - 72 + window.scrollY}px`;
    arrow.style.display = 'flex';
}

function hideTutorialArrow() {
    const a = _el('tutorialArrow');
    if (a) a.style.display = 'none';
}

// ─────────────────────────────────────────────────────────────────
//  AUTO-COMPLÉTION (bébé — 2 derniers coups)
// ─────────────────────────────────────────────────────────────────
function tryAutoComplete() {
    if (currentMode !== 'baby' || isAnimating) return;
    const remaining = tubes.filter(t => t.length > 0 && !isComplete(t)).length;
    if (remaining > 2) return;

    // Cherche un coup valide et le joue automatiquement
    for (let f = 0; f < tubes.length; f++) {
        for (let t = 0; t < tubes.length; t++) {
            if (!canPour(f, t)) continue;
            const from = f, to = t;
            setTimeout(() => {
                if (isAnimating) return;
                animatePour(from, to, () => {
                    pour(from, to);
                    moveCount++;
                    updateUI();
                    renderTubes();
                    if (checkWin()) setTimeout(showWin, 400);
                    else tryAutoComplete();
                });
            }, 1100);
            return;
        }
    }
    // Aucun coup automatique possible → informer l'enfant
    showDeadlockBanner();
}

// ─────────────────────────────────────────────────────────────────
//  MINI-CONFETTIS (bébé — après chaque bon coup)
// ─────────────────────────────────────────────────────────────────
function miniConfetti(tubeIndex) {
    const el = document.querySelector(`.tube-wrapper[data-index="${tubeIndex}"]`);
    if (!el) return;
    const r  = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top;
    const pal = ['#FF4757','#3DBEFF','#2ED573','#FFD32A','#B47BFF','#FF7F50'];

    for (let i = 0; i < 14; i++) {
        const p     = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const dist  = 28 + Math.random() * 52;
        const color = pal[Math.floor(Math.random() * pal.length)];
        const size  = 5 + Math.random() * 6;
        p.style.cssText = [
            'position:fixed', `width:${size}px`, `height:${size}px`,
            `background:${color}`, 'border-radius:50%',
            `left:${cx}px`, `top:${cy}px`,
            'z-index:300', 'pointer-events:none',
            'transform:translate(-50%,-50%)',
            `transition:all ${0.38 + Math.random() * 0.28}s ease-out`,
        ].join(';');
        document.body.appendChild(p);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            p.style.left    = `${cx + Math.cos(angle) * dist}px`;
            p.style.top     = `${cy + Math.sin(angle) * dist}px`;
            p.style.opacity = '0';
        }));
        setTimeout(() => p.remove(), 750);
    }
}

// ─────────────────────────────────────────────────────────────────
//  GESTION DES CLICS (étendue)
// ─────────────────────────────────────────────────────────────────
function handleTubeClick(index) {
    if (isAnimating) return;

    hideTutorialArrow();
    resetMascotIdleTimer();

    if (selectedTube === null) {
        if (tubes[index].length > 0) {
            selectedTube = index;
            renderTubes();
        }
        return;
    }

    if (index === selectedTube) {
        selectedTube = null;
        streak = 0;
        renderTubes();
        return;
    }

    if (canPour(selectedTube, index)) {
        hideDeadlockBanner();    // un coup valide signifie qu'on n'est plus bloqué
        saveState();               // snapshot avant le coup
        const from = selectedTube;
        selectedTube = null;

        // Lancer le chrono au 1er coup (champion : auto ; autres : si toggle actif)
        if (currentMode === 'champion' && moveCount === 0) {
            startTimer(); // démarre toujours en champion
        }

        animatePour(from, index, () => {
            pour(from, index);
            moveCount++;
            streak++;
            updateUI();
            updateUndoBtn();
            renderTubes();
            playSound('pour');

            // Tube complété ?
            if (isComplete(tubes[index])) {
                playSound('complete');
                if (currentMode === 'adventure') updateMascot('happy');
            }

            // Mode bébé : grelot + mini confettis + auto-complétion
            if (currentMode === 'baby') {
                playSound('baby');
                miniConfetti(index);
                tryAutoComplete();
            }

            // Mode aventure : combo
            if (currentMode === 'adventure') {
                streak >= 3 ? triggerCombo(streak) : updateMascot('happy');
            }

            if (checkWin()) setTimeout(showWin, 380);
            else if (isDeadlocked()) {
                showDeadlockBanner();
                if (currentMode === 'adventure') updateMascot('sad');
            }
        });
    } else {
        // Coup invalide
        const prev   = selectedTube;
        selectedTube = (tubes[index].length > 0 && !isComplete(tubes[index])) ? index : null;
        streak       = 0;
        renderTubes();
        flashInvalid(prev);
        playSound('invalid');
        if (currentMode === 'adventure') updateMascot('sad');
    }
}

// ─────────────────────────────────────────────────────────────────
//  ANIMATIONS (inchangées)
// ─────────────────────────────────────────────────────────────────
function animatePour(from, to, callback) {
    isAnimating = true;
    const fromEl = document.querySelector(`.tube-wrapper[data-index="${from}"]`);
    const toEl   = document.querySelector(`.tube-wrapper[data-index="${to}"]`);
    if (fromEl) { fromEl.classList.add('pouring');  fromEl.classList.remove('selected'); }
    if (toEl)   { toEl.classList.add('receiving'); }
    setTimeout(() => {
        if (fromEl) fromEl.classList.remove('pouring');
        if (toEl)   toEl.classList.remove('receiving');
        isAnimating = false;
        callback();
    }, 430);
}

function flashInvalid(index) {
    const el = document.querySelector(`.tube-wrapper[data-index="${index}"]`);
    if (!el) return;
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 460);
}

// ─────────────────────────────────────────────────────────────────
//  RENDU (étendu : formes accessibilité)
// ─────────────────────────────────────────────────────────────────
function renderTubes() {
    const area = document.getElementById('tubesArea');
    if (!area) return;

    const focusedTubeIndex =
        document.activeElement &&
        document.activeElement.classList.contains('tube-wrapper')
            ? Number(document.activeElement.dataset.index)
            : null;

    const colors = ALL_COLORS.slice(0, LEVELS[currentLevel].numColors);
    area.innerHTML = '';

    tubes.forEach((tube, index) => {
        const complete = isComplete(tube);
        const wrapper = document.createElement('div');

        wrapper.className = 'tube-wrapper';
        if (selectedTube === index) wrapper.classList.add('selected');
        if (complete) wrapper.classList.add('complete');

        wrapper.dataset.index = index;
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('aria-pressed', String(selectedTube === index));

        const contents = tube.length
            ? tube.slice().reverse()
                .map(colorIndex => colors[colorIndex]?.name || 'couleur inconnue')
                .join(', ')
            : 'vide';

        wrapper.setAttribute(
            'aria-label',
            `Tube ${index + 1}, ${contents}, ${tube.length} sur ${currentCapacity} cases` +
                (complete ? ', terminé' : '')
        );

        wrapper.addEventListener('click', () => handleTubeClick(index));
        wrapper.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleTubeClick(index);
            }
        });

        const rim = document.createElement('div');
        rim.className = 'tube-top';

        const body = document.createElement('div');
        body.className = 'tube-body';

        for (let i = currentCapacity - 1; i >= 0; i--) {
            const layer = document.createElement('div');
            layer.className = 'color-layer';

            if (i < tube.length) {
                const colorIndex = tube[i];
                layer.classList.add('filled');
                layer.style.backgroundColor = colors[colorIndex].hex;

                const shape = document.createElement('span');
                shape.className = 'color-shape';
                shape.textContent = COLOR_SHAPES[colorIndex];
                shape.setAttribute('aria-hidden', 'true');
                layer.appendChild(shape);
            }

            body.appendChild(layer);
        }

        const shine = document.createElement('div');
        shine.className = 'glass-shine';
        shine.setAttribute('aria-hidden', 'true');

        const shadow = document.createElement('div');
        shadow.className = 'glass-shadow';
        shadow.setAttribute('aria-hidden', 'true');

        body.appendChild(shine);
        body.appendChild(shadow);
        wrapper.appendChild(rim);
        wrapper.appendChild(body);
        area.appendChild(wrapper);
    });

    if (focusedTubeIndex !== null) {
        const nextFocusedTube = area.querySelector(
            `.tube-wrapper[data-index="${focusedTubeIndex}"]`
        );
        if (nextFocusedTube) nextFocusedTube.focus();
    }
}

// ─────────────────────────────────────────────────────────────────
//  ÉTOILES PAR NIVEAU
// ─────────────────────────────────────────────────────────────────
function renderLevelStars(levelIndex) {
    const el = _el('levelStars');
    if (!el) return;
    const data  = loadProgress();
    const saved = data[levelIndex];
    el.textContent = (saved && saved.stars) ? starsHTML(saved.stars) : '';
}

// ─────────────────────────────────────────────────────────────────
//  MISE À JOUR UI
// ─────────────────────────────────────────────────────────────────
function updateUI() {
    const lvl = LEVELS[currentLevel];
    _el('levelLabel').textContent    = lvl.label;
    _el('levelProgress').textContent = `${currentLevel + 1} / ${LEVELS.length}`;
    _el('moveCount').textContent     = moveCount;

    // Étoiles du niveau actuel (depuis localStorage)
    renderLevelStars(currentLevel);

    // Thème narratif (aventure)
    const themeEl = _el('levelTheme');
    if (themeEl) themeEl.textContent = LEVEL_THEMES[currentLevel] || '';

    // Record en temps réel (champion)
    if (currentMode === 'champion') {
        const best = getBestScore(currentLevel);
        _el('bestScore').textContent = best !== null ? best : '--';
    }
}

// ─────────────────────────────────────────────────────────────────
//  VICTOIRE (étendue : étoiles + sauvegarde + chrono)
// ─────────────────────────────────────────────────────────────────
function showWin() {
    stopTimer();

    const isLastLevel = currentLevel === LEVELS.length - 1;
    const lvl         = LEVELS[currentLevel];
    const optimal     = getOptimalMoves(lvl);
    const stars       = calculateStars(moveCount, optimal);

    // Détecter nouveau record AVANT la sauvegarde
    const prevBest  = getBestScore(currentLevel);
    const isNewBest = prevBest !== null && moveCount < prevBest;

    saveProgress(currentLevel, stars, moveCount);
    updateGlobalProgress();
    renderLevelStars(currentLevel); // met à jour la barre de niveau en temps réel

    // Étoiles
    _el('winStars').textContent = starsHTML(stars);

    // Message contextuel
    let msg;
    if (isLastLevel)                           msg = '🏆 Défi LÉGENDAIRE vaincu !';
    else if (currentMode === 'baby')           msg = '🌈 Super ! Tu as tout trié !';
    else if (stars === 3)                      msg = '🌟 Solution parfaite !';
    else if (stars === 2)                      msg = '👏 Très bien joué !';
    else if (currentMode === 'champion' && !isNewBest && prevBest !== null)
                                               msg = '💪 Bats ton record la prochaine fois !';
    else                                       msg = 'Tu as trié toutes les couleurs !';
    _el('winMessage').textContent = msg;

    // Coups + nouveau record
    _el('winMoves').textContent   = moveCount;
    _el('winOptimal').textContent = ` (optimal : ~${optimal})`;
    const recEl = _el('newRecord');
    if (recEl) recEl.style.display = isNewBest ? 'block' : 'none';

    // Chrono (champion)
    _el('winChrono').textContent = (currentMode === 'champion' && timerSeconds > 0)
        ? `⏱ Temps : ${formatTime(timerSeconds)}`
        : '';

    // Bouton niveau suivant
    const nextBtn = _el('winNextBtn');
    nextBtn.style.display = isLastLevel ? 'none' : 'inline-block';
    nextBtn.textContent   = `Niveau ${currentLevel + 2} ▶`;

    _el('winOverlay').classList.add('visible');
    playSound('win');
    launchConfetti(isLastLevel ? 150 : 70);
    if (currentMode === 'adventure') updateMascot('win');
}

function hideWin() {
    _el('winOverlay').classList.remove('visible');
}

// ─────────────────────────────────────────────────────────────────
//  CONFETTIS
// ─────────────────────────────────────────────────────────────────
function launchConfetti(count = 70) {
    const pal = ['#FF4757','#3DBEFF','#2ED573','#FFD32A','#B47BFF','#FF7F50','#FF6B9D','#00D2D3','#A3CB38'];
    for (let i = 0; i < count; i++) {
        const p   = document.createElement('div');
        const sz  = 6 + Math.random() * 10;
        const del = Math.random() * 1.0;
        const dur = 1.5 + Math.random() * 2.5;
        p.style.cssText = [
            'position:fixed', `width:${sz}px`, `height:${sz}px`,
            `background:${pal[Math.floor(Math.random() * pal.length)]}`,
            `border-radius:${Math.random() > .45 ? '50%' : '2px'}`,
            `left:${Math.random() * 100}vw`, 'top:-12px', 'z-index:200',
            `animation:confettiFall ${dur}s ease-in ${del}s forwards`,
            'pointer-events:none',
        ].join(';');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), (dur + del + .5) * 1000);
    }
}

// ─────────────────────────────────────────────────────────────────
//  UTILITAIRE
// ─────────────────────────────────────────────────────────────────
function _el(id) { return document.getElementById(id); }

// ─────────────────────────────────────────────────────────────────
//  DÉMARRAGE
// ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Restaurer mode + niveau + sourdine depuis localStorage
    const saved = loadProgress();
    if (saved.mode)        currentMode  = saved.mode;
    if (saved.maxUnlocked) currentLevel = Math.min(saved.maxUnlocked, LEVELS.length - 1);
    if (saved.muted) {
        muted = true;
        const btn = _el('muteBtn');
        if (btn) btn.textContent = '🔊 Son';
    }

    // Afficher le sélecteur de mode
    showModeSelector();

    // Sélection du mode
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Restaurer la dernière position (saved partage la même référence que _progressCache)
            currentLevel = saved.maxUnlocked
                ? Math.min(saved.maxUnlocked, LEVELS.length - 1)
                : 0;
            hideModeSelector();
            setMode(btn.dataset.mode);
            initGame(); // initGame() plafonnera à 9 si mode bébé
        });
    });

    // Bouton changer de mode en cours de jeu
    _el('modeSwitchBtn').addEventListener('click', showModeSelector);

    // Undo
    _el('undoBtn').addEventListener('click', undoMove);

    // Recommencer
    _el('restartBtn').addEventListener('click', () => {
        streak = 0;
        initGame();
    });

    // Overlay victoire
    _el('winRestartBtn').addEventListener('click', () => { hideWin(); initGame(); });
    _el('winNextBtn').addEventListener('click', () => {
        hideWin();
        if (currentLevel < LEVELS.length - 1) currentLevel++;
        initGame();
    });

    // Navigation niveaux
    _el('prevLevel').addEventListener('click', () => {
        if (currentLevel > 0) { currentLevel--; initGame(); }
    });
    _el('nextLevel').addEventListener('click', () => {
        if (currentLevel < LEVELS.length - 1) { currentLevel++; initGame(); }
    });

    // Chrono toggle (champion)
    _el('chronoToggle').addEventListener('change', function () {
        _el('chronoDisplay').style.display = this.checked ? 'inline' : 'none';
        if (!this.checked) stopTimer();
        else if (moveCount > 0) startTimer();
    });

    // Sourdine
    _el('muteBtn').addEventListener('click', toggleMute);

    // Indice
    _el('hintBtn').addEventListener('click', showHint);

    // Progression globale (init)
    updateGlobalProgress();
});
