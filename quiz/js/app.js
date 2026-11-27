/*
  MathRush 7 game logic: start screen, countdown, questions, timer, scoring,
  power-ups, results, and the leaderboard saved on this device.
*/
(function () {
  'use strict';

  const MR = window.MathRushQuestions;
  const $ = (id) => document.getElementById(id);
  const TOPIC = Object.fromEntries(MR.TOPICS.map((t) => [t.id, t]));
  const ALL_TOPICS = MR.TOPICS.map((t) => t.id);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Saved settings and scores (this browser only) ----------
  const PREFS_KEY = 'mathrush7.prefs';
  const BOARD_KEY = 'mathrush7.board';
  const store = {
    get(key, fallback) {
      try {
        const v = window.localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* Storage is blocked (private window, for example). The game still works. */
      }
    },
  };

  const prefs = { name: '', topics: ALL_TOPICS.slice(), count: 10, timer: 30, sound: true };
  function loadPrefs(saved) {
    if (!saved || typeof saved !== 'object') return;
    if (typeof saved.name === 'string') prefs.name = saved.name.slice(0, 16);
    if (Array.isArray(saved.topics)) {
      const t = saved.topics.filter((id) => TOPIC[id]);
      if (t.length) prefs.topics = t;
    }
    if ([10, 15, 20].includes(saved.count)) prefs.count = saved.count;
    if ([0, 20, 30, 45].includes(saved.timer)) prefs.timer = saved.timer;
    if (typeof saved.sound === 'boolean') prefs.sound = saved.sound;
  }
  const savePrefs = () => store.set(PREFS_KEY, prefs);

  // ---------- Icons ----------
  const svg = (body, size = 20, width = 3) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const ICON = {
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    x: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
    clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', 22, 2.5),
    soundOn: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>', 20, 2),
    soundOff: svg('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>', 20, 2),
    snow: svg('<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>', 15, 2.4),
    shield: svg('<path d="M12 3.5l7 2.8v5.4c0 4.2-2.9 7.6-7 8.8-4.1-1.2-7-4.6-7-8.8V6.3z"/>', 15, 2.4),
    flame: svg('<path d="M12 3c.6 3.4 4.8 5.2 4.8 10a4.8 4.8 0 0 1-9.6 0c0-2.2 1.2-3.7 2.3-4.7.3 1.4 1 2.3 1.9 2.8-.1-3.1-.2-5.6.6-8.1z"/>', 16, 2.2),
  };

  const POWERUPS = {
    fifty: { name: '50/50', desc: 'Remove two wrong answers', icon: '½', on: '50/50 used' },
    double: { name: 'Double points', desc: 'Get 2× points on this question', icon: '2×', on: '2× points' },
    freeze: { name: 'Time freeze', desc: 'Stop the timer on this question', icon: ICON.snow, on: 'Timer frozen' },
    shield: { name: 'Streak shield', desc: 'Keep your streak if you miss this question', icon: ICON.shield, on: 'Streak shielded' },
  };

  // ---------- Small helpers ----------
  const pick = MR.pick;
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n) => Math.round(n).toLocaleString('en-US');
  const plainText = (html) => {
    const d = document.createElement('div');
    d.innerHTML = html;
    d.querySelectorAll('.sr-only').forEach((el) => { el.textContent = el.textContent.trim() === 'over' ? '/' : ' '; });
    return d.textContent;
  };
  let toastTimer = 0;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  // ---------- Sound (Web Audio, no files needed) ----------
  let actx = null;
  function unlockAudio() {
    if (!prefs.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
    } catch (e) {
      actx = null;
    }
  }
  function tone(freq, dur, type, delay = 0, vol = 0.06) {
    const t0 = actx.currentTime + delay;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }
  const SOUNDS = {
    count: () => tone(523, 0.12, 'triangle'),
    go: () => { tone(659, 0.1, 'triangle'); tone(988, 0.24, 'triangle', 0.08); },
    correct: () => { tone(660, 0.09, 'triangle'); tone(880, 0.09, 'triangle', 0.07); tone(1320, 0.2, 'triangle', 0.14, 0.045); },
    wrong: () => { tone(233, 0.18, 'sawtooth', 0, 0.035); tone(165, 0.3, 'sawtooth', 0.12, 0.035); },
    tick: () => tone(1150, 0.04, 'square', 0, 0.02),
    power: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.09, 'triangle', i * 0.06, 0.045)),
    finish: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.15, 'triangle', i * 0.11, 0.05)),
  };
  function sfx(name) {
    if (!prefs.sound || !actx) return;
    try { SOUNDS[name](); } catch (e) { /* ignore audio errors */ }
  }
  function renderSound() {
    const btn = $('soundBtn');
    btn.setAttribute('aria-pressed', String(prefs.sound));
    btn.title = prefs.sound ? 'Sound on' : 'Sound off';
    $('soundLabel').textContent = prefs.sound ? 'Sound on' : 'Sound off';
    $('soundIcon').innerHTML = prefs.sound ? ICON.soundOn : ICON.soundOff;
  }

  // ---------- Screens ----------
  const screens = { home: $('screenHome'), countdown: $('screenCountdown'), play: $('screenPlay'), results: $('screenResults') };
  let current = 'home';
  function show(name) {
    current = name;
    Object.keys(screens).forEach((k) => { screens[k].hidden = k !== name; });
    $('quitWrap').hidden = !(name === 'play' || name === 'countdown');
    closeQuit();
    window.scrollTo(0, 0);
  }

  // ---------- Start screen ----------
  function renderSetup() {
    $('nameInput').value = prefs.name;
    $('topicChips').innerHTML = MR.TOPICS.map((t) =>
      `<label class="chip" for="topic-${t.id}"><input type="checkbox" id="topic-${t.id}" value="${t.id}"${prefs.topics.includes(t.id) ? ' checked' : ''} /><span>${t.label}<small>${t.strand}</small></span></label>`
    ).join('');
    const c = $('count-' + prefs.count); if (c) c.checked = true;
    const t = $('timer-' + prefs.timer); if (t) t.checked = true;
    updateSetupState();
  }
  function readSetup() {
    prefs.name = $('nameInput').value.trim().slice(0, 16);
    prefs.topics = Array.from(document.querySelectorAll('#topicChips input:checked')).map((i) => i.value);
    const c = document.querySelector('input[name="count"]:checked');
    const t = document.querySelector('input[name="timer"]:checked');
    prefs.count = c ? Number(c.value) : 10;
    prefs.timer = t ? Number(t.value) : 30;
  }
  function updateSetupState() {
    const n = document.querySelectorAll('#topicChips input:checked').length;
    $('allTopicsBtn').textContent = n === ALL_TOPICS.length ? 'Clear' : 'Select all';
    if (n) $('formMsg').hidden = true;
  }

  // Warm-up question on the start screen
  const WARMUPS = [
    ['integers', 'addIntegers'], ['integers', 'subtractIntegers'], ['integers', 'multiplyIntegers'],
    ['percents', 'percentOfNumber'], ['expressions', 'evaluate'], ['equations', 'twoStepEquation'],
  ];
  let warm = null;
  function newWarmup() {
    const [tid, gname] = pick(WARMUPS);
    const gen = TOPIC[tid].gens.find((g) => g.name === gname);
    warm = gen();
    $('warmupQ').innerHTML = warm.prompt;
    $('warmupTiles').innerHTML = warm.choices.map((c, i) =>
      `<button type="button" class="tile" data-i="${i}"><span class="key" aria-hidden="true">${i + 1}</span><span class="tile-text">${c.html}</span></button>`
    ).join('');
    const msg = $('warmupMsg');
    msg.className = 'warmup-msg';
    msg.textContent = 'Tap an answer. This one does not count.';
  }
  function answerWarmup(i) {
    if (!warm || warm.done) return;
    warm.done = true;
    unlockAudio();
    const ok = i === warm.answer;
    document.querySelectorAll('#warmupTiles .tile').forEach((t) => {
      const k = Number(t.dataset.i);
      t.disabled = true;
      if (k === warm.answer) { t.classList.add('is-correct'); t.insertAdjacentHTML('beforeend', `<span class="badge">${ICON.check}</span>`); }
      else if (k === i) { t.classList.add('is-wrong'); t.insertAdjacentHTML('beforeend', `<span class="badge">${ICON.x}</span>`); }
      else t.classList.add('is-dim');
    });
    const msg = $('warmupMsg');
    msg.className = 'warmup-msg ' + (ok ? 'good' : 'bad');
    msg.innerHTML = ok ? 'Correct! You are warmed up.' : `Not quite. The answer is ${warm.correctHtml}.`;
    sfx(ok ? 'correct' : 'wrong');
  }

  // ---------- Leaderboard ----------
  function loadBoard() {
    const b = store.get(BOARD_KEY, []);
    return Array.isArray(b) ? b.filter((e) => e && typeof e.score === 'number' && typeof e.name === 'string').slice(0, 10) : [];
  }
  function saveScore(entry) {
    entry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const board = loadBoard();
    board.push(entry);
    board.sort((a, b) => b.score - a.score || (b.correct / b.total) - (a.correct / a.total));
    const top = board.slice(0, 10);
    store.set(BOARD_KEY, top);
    const saved = loadBoard();
    const idx = saved.findIndex((e) => e.id === entry.id);
    return { id: entry.id, rank: idx >= 0 ? idx + 1 : null, stored: saved.length > 0 };
  }
  function renderBoard(listEl, emptyEl, highlightId) {
    const board = loadBoard();
    emptyEl.hidden = board.length > 0;
    listEl.hidden = board.length === 0;
    listEl.innerHTML = board.map((e, i) =>
      `<li class="${e.id === highlightId ? 'me' : ''}"><span class="b-rank">${i + 1}</span>` +
      `<span class="b-who"><span class="b-name">${escapeHtml(e.name)}</span><span class="b-meta">${e.correct}/${e.total} correct · ${escapeHtml(e.topics || '')}</span></span>` +
      `<span class="b-score">${num(e.score)}</span></li>`
    ).join('');
  }
  function topicsLabel(ids) {
    if (ids.length === ALL_TOPICS.length) return 'All topics';
    if (ids.length === 1) return TOPIC[ids[0]].label;
    return ids.length + ' topics';
  }

  // ---------- Game state ----------
  let game = null;
  let lastGame = null;
  let raf = 0;
  let countTimer = 0;
  let autoTimer = 0;

  function newGame(mode, questions) {
    stopTimers();
    game = {
      mode,
      questions: questions || MR.buildQuestions(prefs.topics, prefs.count),
      topics: prefs.topics.slice(),
      timer: prefs.timer,
      i: 0,
      score: 0,
      streak: 0,
      best: 0,
      used: 0,
      results: [],
      powerups: [],
      paused: false,
    };
    game.powerups.push(randomPowerup());
    countdown();
  }

  function countdown() {
    show('countdown');
    const el = $('countNum');
    const steps = ['3', '2', '1', 'Go!'];
    let i = 0;
    const step = () => {
      if (!game || current !== 'countdown') return;
      if (game.paused) { countTimer = setTimeout(step, 200); return; }
      if (i >= steps.length) { showQuestion(); return; }
      el.textContent = steps[i];
      el.classList.toggle('go', i === 3);
      el.classList.remove('pop');
      void el.offsetWidth;
      if (!reduceMotion) el.classList.add('pop');
      sfx(i === 3 ? 'go' : 'count');
      i += 1;
      countTimer = setTimeout(step, i === 4 ? 500 : 650);
    };
    step();
  }

  function stopTimers() {
    cancelAnimationFrame(raf);
    clearTimeout(countTimer);
    clearTimeout(autoTimer);
    raf = countTimer = autoTimer = 0;
  }

  // ---------- Question screen ----------
  function isBig(q) {
    return !q.figure && q.prompt.indexOf('<table') < 0 && plainText(q.prompt).length <= 30;
  }

  function showQuestion() {
    show('play');
    const q = game.questions[game.i];
    game.q = q;
    game.answered = false;
    game.active = { fifty: false, double: false, freeze: false, shield: false };

    $('qCount').textContent = `Question ${game.i + 1} of ${game.questions.length}`;
    $('qTopic').textContent = TOPIC[q.topic].label;
    updateHud();

    const fig = $('qFigure');
    fig.hidden = !q.figure;
    fig.innerHTML = q.figure || '';
    const text = $('qText');
    text.innerHTML = q.prompt;
    text.classList.toggle('q-big', isBig(q));

    const answers = $('answers');
    const form = $('typeinForm');
    if (q.type === 'input') {
      answers.hidden = true;
      answers.innerHTML = '';
      form.hidden = false;
      form.classList.remove('is-correct', 'is-wrong');
      const input = $('typeinInput');
      input.value = '';
      input.disabled = false;
      $('typeinSubmit').disabled = false;
      $('typeinPrefix').innerHTML = q.inputPrefix || '';
      $('typeinUnit').textContent = q.inputUnit || '';
      $('typeinPrefix').hidden = !q.inputPrefix;
      $('typeinUnit').hidden = !q.inputUnit;
      input.focus({ preventScroll: true });
    } else {
      form.hidden = true;
      answers.hidden = false;
      answers.innerHTML = q.choices.map((c, i) =>
        `<button type="button" class="tile" data-i="${i}" id="tile-${i}"><span class="key" aria-hidden="true">${i + 1}</span><span class="tile-text">${c.html}</span></button>`
      ).join('');
      text.focus({ preventScroll: true });
    }

    hideFeedback();
    renderPowerups();
    startTimer();
  }

  function updateHud() {
    $('scoreVal').textContent = num(game.score);
    $('streakVal').innerHTML = game.streak >= 3 ? `${ICON.flame}${game.streak}` : String(game.streak);
    $('streakStat').classList.toggle('hot', game.streak >= 3);
  }

  function startTimer() {
    cancelAnimationFrame(raf);
    const bar = $('timer');
    const q = game.q;
    game.limit = game.timer ? game.timer * (q.type === 'input' ? 1.5 : 1) : 0;
    game.elapsed = 0;
    game.qStart = performance.now();
    game.last = game.qStart;
    game.lastTick = null;
    bar.hidden = !game.limit;
    $('timeStat').hidden = !game.limit;
    bar.classList.remove('low', 'frozen');
    $('timeStat').classList.remove('low');
    if (!game.limit) return;
    $('timerFill').style.transform = 'scaleX(1)';
    $('timeVal').textContent = Math.ceil(game.limit);
    const loop = (now) => {
      if (!game || game.answered) return;
      const dt = Math.min(0.25, (now - game.last) / 1000);
      game.last = now;
      if (!game.active.freeze && !game.paused) game.elapsed += dt;
      const left = Math.max(0, game.limit - game.elapsed);
      $('timerFill').style.transform = `scaleX(${left / game.limit})`;
      const secs = Math.ceil(left);
      $('timeVal').textContent = secs;
      const low = left <= 5 && !game.active.freeze;
      bar.classList.toggle('low', low);
      $('timeStat').classList.toggle('low', low);
      if (low && left > 0 && secs !== game.lastTick && !game.paused) {
        game.lastTick = secs;
        sfx('tick');
      }
      if (left <= 0) {
        resolve({ timedOut: true });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  // ---------- Power-ups ----------
  function randomPowerup() {
    const pool = ['fifty', 'double', 'shield'];
    if (game && game.timer) pool.push('freeze');
    return pick(pool);
  }
  function canUse(p) {
    if (!game || game.answered || game.paused || game.active[p]) return false;
    if (p === 'fifty') return game.q.type === 'mc' && game.q.choices.length > 2;
    if (p === 'freeze') return !!game.limit;
    return true;
  }
  function renderPowerups() {
    const box = $('powerups');
    const on = Object.keys(game.active).filter((k) => game.active[k])
      .map((k) => `<span class="pu-on">${POWERUPS[k].on}</span>`).join('');
    const btns = game.powerups.map((p, i) =>
      `<button type="button" class="pu${game.fresh === i ? ' pop' : ''}" data-idx="${i}"${canUse(p) ? '' : ' disabled'} title="${POWERUPS[p].desc}" aria-label="Use ${POWERUPS[p].name}: ${POWERUPS[p].desc}">` +
      `<span class="pu-icon" aria-hidden="true">${POWERUPS[p].icon}</span>${POWERUPS[p].name}</button>`
    ).join('');
    game.fresh = null;
    box.innerHTML = on + btns || '<span class="pu-hint">Get 3 right in a row to earn a power-up.</span>';
  }
  function usePowerup(idx) {
    const p = game.powerups[idx];
    if (!p || !canUse(p)) return;
    game.powerups.splice(idx, 1);
    game.active[p] = true;
    game.used += 1;
    sfx('power');
    if (p === 'fifty') {
      const q = game.q;
      const wrong = MR.shuffle(q.choices.map((_, i) => i).filter((i) => i !== q.answer)).slice(0, 2);
      wrong.forEach((i) => {
        const t = $('tile-' + i);
        t.classList.add('removed');
        t.disabled = true;
      });
    }
    if (p === 'freeze') $('timer').classList.add('frozen');
    renderPowerups();
  }
  function awardPowerup() {
    if (game.powerups.length >= 3) return null;
    const p = randomPowerup();
    game.powerups.push(p);
    game.fresh = game.powerups.length - 1;
    return p;
  }

  // ---------- Answering ----------
  function resolve({ index, text, timedOut }) {
    if (!game || game.answered) return;
    game.answered = true;
    cancelAnimationFrame(raf);
    const q = game.q;
    const time = (performance.now() - game.qStart) / 1000;
    let correct = false;
    let chosen = null;
    if (!timedOut) {
      if (q.type === 'input') {
        correct = MR.checkInput(q, text);
        chosen = escapeHtml(text.trim()) || '(blank)';
        if (q.inputPrefix && text.trim()) chosen = q.inputPrefix + ' ' + chosen;
      } else {
        correct = index === q.answer;
        chosen = q.choices[index].html;
      }
    }

    const prevStreak = game.streak;
    let points = 0;
    let unlocked = null;
    let shieldSaved = false;
    if (correct) {
      game.streak += 1;
      game.best = Math.max(game.best, game.streak);
      const speed = game.limit ? Math.max(0, 1 - game.elapsed / game.limit) : 0.5;
      points = Math.round(400 + 600 * speed) + Math.min(game.streak - 1, 5) * 100;
      if (game.active.double) points *= 2;
      game.score += points;
      if (game.streak % 3 === 0) unlocked = awardPowerup();
    } else if (game.active.shield && prevStreak > 0) {
      shieldSaved = true;
    } else {
      game.streak = 0;
    }
    game.results.push({ q, chosen, correct, timedOut: !!timedOut, points, time });

    revealAnswer(q, index, correct);
    updateHud();
    renderPowerups();
    showFeedback({ q, correct, timedOut, points, unlocked, shieldSaved, prevStreak });
    sfx(correct ? 'correct' : 'wrong');
    if (unlocked) setTimeout(() => sfx('power'), 350);
  }

  function revealAnswer(q, index, correct) {
    if (q.type === 'input') {
      $('typeinInput').disabled = true;
      $('typeinSubmit').disabled = true;
      $('typeinForm').classList.add(correct ? 'is-correct' : 'is-wrong');
      return;
    }
    document.querySelectorAll('#answers .tile').forEach((t) => {
      const i = Number(t.dataset.i);
      t.disabled = true;
      if (i === q.answer) {
        t.classList.remove('removed');
        t.classList.add('is-correct');
        t.insertAdjacentHTML('beforeend', `<span class="badge" aria-label="Correct answer">${ICON.check}</span>`);
      } else if (i === index) {
        t.classList.add('is-wrong');
        t.insertAdjacentHTML('beforeend', `<span class="badge" aria-label="Your answer">${ICON.x}</span>`);
      } else if (!t.classList.contains('removed')) {
        t.classList.add('is-dim');
      }
    });
  }

  function showFeedback({ q, correct, timedOut, points, unlocked, shieldSaved, prevStreak }) {
    const fb = $('feedback');
    fb.classList.toggle('bad', !correct);
    $('fbIcon').innerHTML = correct ? ICON.check : timedOut ? ICON.clock : ICON.x;
    $('fbTitle').textContent = correct
      ? pick(['Correct!', 'Nice work!', 'You got it!', 'Exactly right!'])
      : timedOut ? 'Time is up' : 'Not quite';
    let sub;
    if (correct) {
      sub = game.streak >= 2 ? `${game.streak} in a row` : 'Keep it going';
      if (game.active.double) sub += ' · double points';
      if (unlocked) sub += ` · you earned ${POWERUPS[unlocked].name}`;
    } else {
      sub = `Answer: ${q.correctHtml}`;
      if (shieldSaved) sub += ` · your shield saved a ${prevStreak}-answer streak`;
    }
    $('fbSub').innerHTML = sub;
    $('fbPoints').textContent = correct ? `+${num(points)}` : '+0';
    $('fbExplain').innerHTML = `<span class="fb-label">How to solve it</span>${q.explain}`;
    $('nextLabel').textContent = game.i + 1 >= game.questions.length ? 'See results' : 'Next question';
    fb.hidden = false;
    screens.play.style.paddingBottom = fb.offsetHeight + 24 + 'px';
    $('nextBtn').focus({ preventScroll: true });
    if (correct) startAutoAdvance();
  }

  function hideFeedback() {
    cancelAutoAdvance();
    $('feedback').hidden = true;
    screens.play.style.paddingBottom = '';
  }

  // After a correct answer the game moves on by itself, unless you point at or tap the panel to read it.
  function startAutoAdvance() {
    const fill = $('nextFill');
    const dur = 3200;
    fill.style.transition = 'none';
    fill.style.transform = 'scaleX(0)';
    void fill.offsetWidth;
    fill.style.transition = `transform ${dur}ms linear`;
    fill.style.transform = 'scaleX(1)';
    clearTimeout(autoTimer);
    autoTimer = setTimeout(next, dur);
  }
  function cancelAutoAdvance() {
    clearTimeout(autoTimer);
    autoTimer = 0;
    const fill = $('nextFill');
    fill.style.transition = 'none';
    fill.style.transform = 'scaleX(0)';
  }

  function next() {
    if (!game || !game.answered) return;
    cancelAutoAdvance();
    hideFeedback();
    game.i += 1;
    if (game.i >= game.questions.length) finish();
    else showQuestion();
  }

  // ---------- Quit ----------
  function openQuit() {
    $('quitBtn').hidden = true;
    $('quitConfirm').hidden = false;
    if (game) {
      game.paused = true;
      cancelAutoAdvance();
      if (game.q && !game.answered) renderPowerups();
    }
    $('quitNo').focus();
  }
  function closeQuit() {
    $('quitBtn').hidden = false;
    $('quitConfirm').hidden = true;
    if (game && game.paused) {
      game.paused = false;
      if (current === 'play' && game.q && !game.answered) renderPowerups();
    }
  }
  function quitGame() {
    stopTimers();
    hideFeedback();
    game = null;
    goHome();
  }
  function goHome() {
    renderSetup();
    renderBoard($('homeBoard'), $('homeBoardEmpty'));
    newWarmup();
    show('home');
  }

  // ---------- Results ----------
  function finish() {
    stopTimers();
    const g = game;
    game = null;
    lastGame = g;
    const r = g.results;
    const total = r.length;
    const correctN = r.filter((x) => x.correct).length;
    const acc = total ? Math.round((correctN / total) * 100) : 0;
    const avg = total ? r.reduce((s, x) => s + x.time, 0) / total : 0;
    const name = prefs.name || 'Player';

    let saved = null;
    if (g.mode === 'normal') {
      saved = saveScore({ name, score: g.score, correct: correctN, total, topics: topicsLabel(g.topics), timer: g.timer, date: new Date().toISOString() });
    }

    $('resEyebrow').textContent = g.mode === 'practice' ? 'Practice round complete' : 'Quiz complete';
    const title = acc >= 90 ? 'Outstanding' : acc >= 70 ? 'Nice work' : acc >= 50 ? 'Good effort' : 'Keep practicing';
    $('resTitle').textContent = `${title}, ${name}!`;
    $('resScore').textContent = num(g.score);
    const rank = $('resRank');
    rank.classList.remove('top');
    if (g.mode === 'practice') rank.textContent = 'Practice rounds are not added to the leaderboard';
    else if (saved && saved.rank) { rank.textContent = `#${saved.rank} on this device`; if (saved.rank <= 3) rank.classList.add('top'); }
    else if (saved && !saved.stored) rank.textContent = 'This browser is not saving scores';
    else rank.textContent = 'Not in the top 10 yet';

    $('resAcc').textContent = acc + '%';
    const ring = $('ring');
    ring.classList.toggle('mid', acc >= 50 && acc < 80);
    ring.classList.toggle('low', acc < 50);
    const bar = $('ringBar');
    const circ = 326.73;
    bar.style.transition = 'none';
    bar.style.strokeDashoffset = circ;
    void bar.getBoundingClientRect();
    bar.style.transition = '';
    requestAnimationFrame(() => { bar.style.strokeDashoffset = String(circ * (1 - acc / 100)); });

    $('resCorrect').textContent = `${correctN} / ${total}`;
    $('resStreak').textContent = g.best;
    $('resTime').textContent = avg.toFixed(1) + ' s';
    $('resPowerups').textContent = g.used;

    const missed = r.filter((x) => !x.correct).length;
    const retry = $('retryBtn');
    retry.hidden = missed === 0;
    retry.textContent = missed === 1 ? 'Practice the 1 I missed' : `Practice the ${missed} I missed`;

    renderTopicBars(r);
    renderBoard($('resBoard'), $('resBoardEmpty'), saved && saved.id);
    renderReview(r);
    show('results');
    sfx('finish');
    if (acc >= 80) confetti();
  }

  function renderTopicBars(r) {
    const by = {};
    r.forEach((x) => {
      const t = by[x.q.topic] || (by[x.q.topic] = { c: 0, n: 0 });
      t.n += 1;
      if (x.correct) t.c += 1;
    });
    const rows = Object.keys(by).map((id) => ({ id, ...by[id], pct: by[id].c / by[id].n }))
      .sort((a, b) => a.pct - b.pct || b.n - a.n);
    $('topicBars').innerHTML = rows.map((t) => {
      const cls = t.pct >= 0.8 ? '' : t.pct >= 0.5 ? 'tb-mid' : 'tb-low';
      const chip = t.pct >= 0.8 ? 'Strong' : t.pct >= 0.5 ? 'Getting there' : 'Practice this';
      return `<li class="${cls}"><div class="tb-row"><span class="tb-name">${TOPIC[t.id].label}<span class="tb-chip">${chip}</span></span>` +
        `<span class="tb-score">${t.c} / ${t.n}</span></div>` +
        `<div class="tb-track" role="img" aria-label="${Math.round(t.pct * 100)} percent correct"><div class="tb-fill" style="width:${Math.max(3, t.pct * 100)}%"></div></div></li>`;
    }).join('');
  }

  function renderReview(r) {
    $('reviewList').innerHTML = r.map((x, i) => {
      const yours = x.timedOut ? 'No answer. Time ran out.' : x.chosen;
      return `<li class="rv ${x.correct ? 'ok' : 'miss'}">` +
        `<div class="rv-head"><span class="rv-num">${i + 1}</span><span class="rv-mark" aria-label="${x.correct ? 'Correct' : 'Incorrect'}">${x.correct ? ICON.check : ICON.x}</span>` +
        `<span class="topic-tag">${TOPIC[x.q.topic].label}</span><span class="rv-pts">+${num(x.points)} · ${x.time.toFixed(1)} s</span></div>` +
        `<div class="rv-q">${x.q.prompt}</div>` +
        `<p class="rv-ans"><b>Your answer:</b> ${yours}</p>` +
        (x.correct ? '' : `<p class="rv-ans"><b>Correct answer:</b> ${x.q.correctHtml}</p>`) +
        `<details${x.correct ? '' : ' open'}><summary>How to solve it</summary><p>${x.q.explain}</p></details></li>`;
    }).join('');
  }

  // Missed questions come back with their answer choices in a new order.
  function practiceMissed() {
    if (!lastGame) return;
    const qs = lastGame.results.filter((x) => !x.correct).map((x) => {
      const q = Object.assign({}, x.q);
      if (q.type === 'mc') {
        const right = q.choices[q.answer];
        q.choices = MR.shuffle(q.choices);
        q.answer = q.choices.indexOf(right);
      }
      return q;
    });
    if (!qs.length) return;
    unlockAudio();
    newGame('practice', MR.shuffle(qs));
  }

  // ---------- Confetti ----------
  function confetti() {
    if (reduceMotion) return;
    const cv = $('confetti');
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = (cv.width = window.innerWidth * dpr);
    const H = (cv.height = window.innerHeight * dpr);
    const css = getComputedStyle(document.documentElement);
    const colors = ['--t1', '--t2', '--t3', '--t4', '--hi'].map((v) => css.getPropertyValue(v).trim() || '#ffd43b');
    const parts = Array.from({ length: 150 }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.5,
      vx: (Math.random() - 0.5) * 3 * dpr,
      vy: (2 + Math.random() * 3) * dpr,
      s: (6 + Math.random() * 6) * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: pick(colors),
    }));
    const end = performance.now() + 3400;
    const frame = (now) => {
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035 * dpr;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (now < end) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(frame);
  }

  // ---------- Events ----------
  function bindEvents() {
    $('setupForm').addEventListener('submit', (e) => {
      e.preventDefault();
      readSetup();
      if (!prefs.topics.length) {
        $('formMsg').hidden = false;
        return;
      }
      savePrefs();
      unlockAudio();
      newGame('normal');
    });
    $('topicChips').addEventListener('change', updateSetupState);
    $('allTopicsBtn').addEventListener('click', () => {
      const boxes = Array.from(document.querySelectorAll('#topicChips input'));
      const all = boxes.every((b) => b.checked);
      boxes.forEach((b) => { b.checked = !all; });
      updateSetupState();
    });
    $('warmupNew').addEventListener('click', newWarmup);
    $('warmupTiles').addEventListener('click', (e) => {
      const t = e.target.closest('.tile');
      if (t) answerWarmup(Number(t.dataset.i));
    });

    $('answers').addEventListener('click', (e) => {
      const t = e.target.closest('.tile');
      if (t && !t.disabled && game && !game.answered && !game.paused) resolve({ index: Number(t.dataset.i) });
    });
    $('typeinForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!game || game.answered || game.paused) return;
      const v = $('typeinInput').value;
      if (!v.trim()) {
        toast('Type an answer first.');
        $('typeinInput').focus();
        return;
      }
      resolve({ text: v });
    });
    $('powerups').addEventListener('click', (e) => {
      const b = e.target.closest('.pu');
      if (b && game) usePowerup(Number(b.dataset.idx));
    });
    $('nextBtn').addEventListener('click', next);
    const fb = $('feedback');
    fb.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') cancelAutoAdvance(); });
    fb.addEventListener('pointerdown', (e) => { if (!e.target.closest('#nextBtn')) cancelAutoAdvance(); });
    fb.addEventListener('scroll', cancelAutoAdvance, { passive: true });

    $('quitBtn').addEventListener('click', openQuit);
    $('quitNo').addEventListener('click', closeQuit);
    $('quitYes').addEventListener('click', quitGame);
    $('brandBtn').addEventListener('click', () => {
      if (current === 'play' || current === 'countdown') openQuit();
      else if (current !== 'home') goHome();
    });

    $('againBtn').addEventListener('click', () => { unlockAudio(); newGame('normal'); });
    $('retryBtn').addEventListener('click', practiceMissed);
    $('homeBtn').addEventListener('click', goHome);

    $('soundBtn').addEventListener('click', () => {
      prefs.sound = !prefs.sound;
      savePrefs();
      renderSound();
      if (prefs.sound) unlockAudio();
    });

    document.addEventListener('keydown', (e) => {
      if (current !== 'play' || !game || game.paused) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const inField = e.target.matches && e.target.matches('input, textarea');
      if (!game.answered) {
        if (!inField && game.q.type === 'mc' && /^[1-4]$/.test(e.key)) {
          const t = $('tile-' + (Number(e.key) - 1));
          if (t && !t.disabled) {
            e.preventDefault();
            resolve({ index: Number(t.dataset.i) });
          }
        }
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement !== $('nextBtn')) {
        e.preventDefault();
        next();
      }
    });
  }

  // ---------- Start ----------
  function start(data) {
    loadPrefs(store.get(PREFS_KEY, null));
    if (data && data.prefs) loadPrefs(data.prefs);
    renderSound();
    bindEvents();
    goHome();
  }

  const hot = window.claude && window.claude.hot;
  if (hot && typeof hot.snapshot === 'function') {
    try { hot.snapshot(() => ({ prefs: Object.assign({}, prefs) })); } catch (e) { /* optional */ }
  }
  if (hot && typeof hot.ready === 'function') hot.ready(start);
  else start((hot && hot.data) || {});
})();
