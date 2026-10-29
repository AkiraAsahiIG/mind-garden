/* =========================================
   MIND GARDEN — INTERACTIONS
   Existing activities preserved; new spaces added.
   Quran text is fetched from AlQuran Cloud when requested.
========================================= */
(function () {
  'use strict';

  // Welcome buttons: keep entry working even if a later feature fails to initialize.
  // The handlers are installed early; navigation uses the app's normal route when available.
  function openGardenFromWelcome(event) {
    event.preventDefault();
    const welcomePage = document.getElementById('welcomePage');
    const gardenPage = document.getElementById('gardenPage');
    if (!welcomePage || !gardenPage) return;

    if (window.MindGarden && typeof window.MindGarden.navigate === 'function') {
      window.MindGarden.navigate('gardenPage');
      return;
    }

    welcomePage.classList.remove('active');
    gardenPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  ['enterBtn', 'skipIntroBtn'].forEach((id) => {
    const button = document.getElementById(id);
    if (!button) return;
    // Avoid calling both the HTML inline handler and this handler for the same tap.
    button.removeAttribute('onclick');
    button.addEventListener('click', openGardenFromWelcome);
  });

  // Background music: loop continuously. Browsers may require a user gesture before playback.
  const backgroundMusic = new Audio('audio/rainy.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.25;
  backgroundMusic.preload = 'auto';

  function tryStartBackgroundMusic() {
    if (!backgroundMusic.paused) return;
    backgroundMusic.play().then(() => {
      document.removeEventListener('pointerdown', tryStartBackgroundMusic);
      document.removeEventListener('keydown', tryStartBackgroundMusic);
    }).catch(() => {
      // Autoplay may be blocked; retry on the next user interaction.
    });
  }

  // Attempt autoplay, then retry after the first tap/click or key press if needed.
  tryStartBackgroundMusic();
  document.addEventListener('pointerdown', tryStartBackgroundMusic);
  document.addEventListener('keydown', tryStartBackgroundMusic);

  const STORAGE_KEY = 'mindGardenState_v1';
  const DEFAULT_STATE = {
    name: 'Mawo', sound: false, reducedMotion: false,
    flowers: 0, visitedActivities: [], thoughts: [], tasks: [],
    mood: '', moodChecks: [], blessings: [], dhikrCounts: {}, duaReflections: []
  };

  const plantlessPages = [
    'breathePage', 'cloudPage', 'stepsPage', 'goodbyePage',
    'blessingsPage', 'quranPage', 'dhikrPage', 'duaPage', 'timeAyahPage'
  ];

  const moodDetails = {
    Calm: {
      emoji: '😌',
      note: 'A calm moment is worth noticing. You do not have to hold onto it perfectly. 💜'
    },
    Grateful: {
      emoji: '🤍',
      note: 'Let gratitude be gentle; it can sit beside any other feeling, too.'
    },
    Hopeful: {
      emoji: '🌤️',
      note: 'A little hope is enough. You can take things one step at a time.'
    },
    Joyful: {
      emoji: '😊',
      note: 'Make room to enjoy this moment without needing it to last forever.'
    },
    Tired: {
      emoji: '😴',
      note: 'Tiredness is information, not a personal failure. Rest where you can.'
    },
    Worried: {
      emoji: '🌧️',
      note: 'You do not need to solve every worry all at once. One small next step may be enough.'
    },
    Overwhelmed: {
      emoji: '🌊',
      note: 'You can pause, ask someone you trust for support, or choose one tiny next step.'
    },
    Sad: {
      emoji: '🌦️',
      note: 'You are allowed to feel sad. You do not have to force yourself to feel differently.'
    },
    Unsure: {
      emoji: '🌫️',
      note: 'You do not need a perfect word for what you feel. “Unsure” is enough for today.'
    }
  };

  const dhikrOptions = {
    subhan: {
      arabic: 'سُبْحَانَ اللَّهِ',
      phrase: 'SubhanAllah',
      meaning: 'Glory be to Allah.'
    },
    hamd: {
      arabic: 'الْحَمْدُ لِلَّهِ',
      phrase: 'Alhamdulillah',
      meaning: 'All praise belongs to Allah.'
    },
    akbar: {
      arabic: 'اللَّهُ أَكْبَرُ',
      phrase: 'Allahu Akbar',
      meaning: 'Allah is the Greatest.'
    },
    istighfar: {
      arabic: 'أَسْتَغْفِرُ اللَّهَ',
      phrase: 'Astaghfirullah',
      meaning: 'I seek Allah’s forgiveness.'
    },
    hawqala: {
      arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
      phrase: 'La hawla wa la quwwata illa billah',
      meaning: 'There is no power nor strength except through Allah.'
    }
  };

  const duas = {
    world: {
      ref: 'QUR’AN 2:201',
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.',
      translation: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.',
      note: 'Qur’an 2:201 · Saheeh International translation of meaning.'
    },
    heart: {
      ref: 'QUR’AN 3:8',
      arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
      transliteration: 'Rabbana la tuzigh qulubana ba’da idh hadaytana wa hab lana min ladunka rahmah; innaka Antal-Wahhab.',
      translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
      note: 'Qur’an 3:8 · Saheeh International translation of meaning.'
    },
    parents: {
      ref: 'QUR’AN 17:24',
      arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      transliteration: 'Rabbi irhamhuma kama rabbayani saghira.',
      translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
      note: 'Qur’an 17:24 · Saheeh International translation of meaning.'
    },
    ease: {
      ref: 'QUR’AN 20:25–28',
      arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي ۝ يَفْقَهُوا قَوْلِي',
      transliteration: 'Rabbi-shrah li sadri. Wa yassir li amri. Wahlul ‘uqdatan min lisani. Yafqahu qawli.',
      translation: 'My Lord, expand for me my breast; ease for me my task; untie the knot from my tongue; that they may understand my speech.',
      note: 'Qur’an 20:25–28 · A connected supplication of Prophet Musa; translation of meaning.'
    }
  };

  const reflectionPrompts = [
    'What word or phrase stands out to you? You can sit with it without needing to reach a quick conclusion.',
    'Is there one gentle, practical thing you would like to carry into the rest of your day?',
    'What question or feeling comes up as you read this ayah? It is okay to take your time.',
    'Read the ayah once more slowly. What do you notice this time?',
    'Would you like to share this verse with someone, save it, or simply let it be a quiet moment?'
  ];

  const pages = Array.from(document.querySelectorAll('.page'));
  const byId = (id) => document.getElementById(id);

  let toastTimer = null;
  let breathTimer = null;
  let breathPhase = 'stopped';
  let breathCycle = 0;
  let previousFocus = null;
  let audioContext = null;
  let selectedMood = '';
  let calendarMonth = new Date();

  function safeReadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return freshState();

      return {
        ...DEFAULT_STATE,
        ...parsed,
        name: typeof parsed.name === 'string' ? parsed.name.slice(0, 24) : DEFAULT_STATE.name,
        sound: Boolean(parsed.sound),
        reducedMotion: Boolean(parsed.reducedMotion),
        flowers: Number.isFinite(Number(parsed.flowers)) ? Math.max(0, Number(parsed.flowers)) : 0,
        visitedActivities: Array.isArray(parsed.visitedActivities)
          ? parsed.visitedActivities.filter(x => typeof x === 'string')
          : [],
        thoughts: Array.isArray(parsed.thoughts)
          ? parsed.thoughts.filter(x => x && typeof x.text === 'string')
          : [],
        tasks: Array.isArray(parsed.tasks)
          ? parsed.tasks.filter(x => x && typeof x.text === 'string')
          : [],
        mood: typeof parsed.mood === 'string' ? parsed.mood : '',
        moodChecks: Array.isArray(parsed.moodChecks)
          ? parsed.moodChecks.filter(x =>
              x && typeof x.mood === 'string' && Number.isFinite(Number(x.createdAt)))
          : [],
        blessings: Array.isArray(parsed.blessings)
          ? parsed.blessings.filter(x => x && typeof x.text === 'string')
          : [],
        dhikrCounts: parsed.dhikrCounts && typeof parsed.dhikrCounts === 'object'
          ? parsed.dhikrCounts
          : {},
        duaReflections: Array.isArray(parsed.duaReflections)
          ? parsed.duaReflections.filter(x => x && typeof x.text === 'string')
          : []
      };
    } catch (error) {
      console.warn('Mind Garden could not read saved data:', error);
      return freshState();
    }
  }

  function freshState() {
    return {
      ...DEFAULT_STATE,
      visitedActivities: [],
      thoughts: [],
      tasks: [],
      moodChecks: [],
      blessings: [],
      dhikrCounts: {},
      duaReflections: []
    };
  }

  let state = safeReadState();

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Mind Garden could not save data:', error);
      showToast('Browser storage is unavailable. This change may not stay after you leave.');
    }
  }

  function showToast(message) {
    const toast = byId('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2700);
  }

  function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function safeDate(timestamp) {
    const d = new Date(Number(timestamp));
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  function formatDate(timestamp, options) {
    try {
      return new Intl.DateTimeFormat(
        undefined,
        options || { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
      ).format(safeDate(timestamp));
    } catch (_) {
      return 'A little while ago';
    }
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function keyFromTimestamp(timestamp) {
    return dateKey(safeDate(timestamp));
  }

  function playTone(frequency = 660, duration = 0.09) {
    if (!state.sound) return;

    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      if (!audioContext) audioContext = new AC();
      if (audioContext.state === 'suspended') audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration + 0.02);
    } catch (_) {
      // Audio is optional.
    }
  }

  function updateSoundButton() {
    const btn = byId('soundBtn');
    if (!btn) return;

    btn.setAttribute('aria-pressed', String(state.sound));
    btn.title = state.sound ? 'Sound on' : 'Sound off';
    btn.setAttribute('aria-label', state.sound ? 'Turn sound off' : 'Turn sound on');
  }

  function updateHeaderAndCounts() {
    const title = byId('welcomeTitle');

    if (title) {
      title.replaceChildren(document.createTextNode(`Hello, ${state.name || 'Mawo'}`));

      const period = document.createElement('span');
      period.className = 'period';
      period.textContent = '.';
      title.append(period);
    }

    const flowerCount = byId('flowerCount');
    const decorCount = byId('decorCount');
    const greeting = byId('gardenGreeting');

    if (flowerCount) flowerCount.textContent = String(state.moodChecks.length);

    if (decorCount) {
      decorCount.textContent = String(
        state.visitedActivities.filter(id => plantlessPages.includes(id)).length
      );
    }

    if (greeting) {
      greeting.textContent = state.name
        ? `${state.name}’s peaceful little place.`
        : 'A peaceful place, just for you.';
    }

    updateSoundButton();
  }

  function applyMotionSetting() {
    document.body.classList.toggle('reduce-motion', state.reducedMotion);
    const toggle = byId('motionToggle');
    if (toggle) toggle.checked = state.reducedMotion;
  }

  // Glow & Breathe — original interaction retained.
  function stopBreathing(paused) {
    if (breathTimer !== null) {
      window.clearInterval(breathTimer);
      breathTimer = null;
    }

    breathPhase = 'stopped';

    const orb = byId('breathOrb');
    const word = byId('breathWord');
    const instruction = byId('breathInstruction');
    const counter = byId('breathCounter');
    const start = byId('breathStartBtn');
    const stop = byId('breathStopBtn');

    if (orb) orb.classList.remove('inhale', 'exhale');
    if (word) word.textContent = paused ? 'Paused' : 'Ready?';

    if (instruction) {
      instruction.textContent = paused
        ? 'Take your time. Resume whenever you’d like.'
        : 'You can breathe naturally, too.';
    }

    if (counter) {
      counter.textContent = breathCycle > 0
        ? `${breathCycle} gentle ${breathCycle === 1 ? 'cycle' : 'cycles'} completed.`
        : 'A quiet moment, just for you.';
    }

    if (start) start.textContent = breathCycle > 0 ? 'Resume gently' : 'Begin gently';
    if (stop) stop.disabled = true;
  }

  function setBreathPhase(phase) {
    breathPhase = phase;

    const orb = byId('breathOrb');
    const word = byId('breathWord');
    const instruction = byId('breathInstruction');
    const counter = byId('breathCounter');

    if (!orb || !word || !instruction || !counter) return;

    orb.classList.remove('inhale', 'exhale');

    if (phase === 'inhale') {
      orb.classList.add('inhale');
      word.textContent = 'Breathe in';
      instruction.textContent = 'Breathe in gently, only if comfortable.';
    } else {
      orb.classList.add('exhale');
      word.textContent = 'Breathe out';
      instruction.textContent = 'Let the breath out naturally.';
      breathCycle += 1;
    }

    counter.textContent = `${breathCycle} gentle ${breathCycle === 1 ? 'cycle' : 'cycles'} completed · no rush`;
  }

  function startBreathing() {
    if (breathTimer !== null) return;

    const start = byId('breathStartBtn');
    const stop = byId('breathStopBtn');

    if (start) start.textContent = 'Breathing…';
    if (stop) stop.disabled = false;

    setBreathPhase('inhale');
    playTone(523, 0.08);

    breathTimer = window.setInterval(() => {
      setBreathPhase(breathPhase === 'inhale' ? 'exhale' : 'inhale');
    }, 4000);
  }

  // Navigation
  function navigate(pageId) {
    const target = byId(pageId);
    if (!target || !target.classList.contains('page')) return;

    if (pageId !== 'breathePage' && breathTimer !== null) {
      stopBreathing(true);
    }

    pages.forEach(page => page.classList.toggle('active', page.id === pageId));

    window.scrollTo({
      top: 0,
      behavior: state.reducedMotion ? 'auto' : 'smooth'
    });

    if (
      plantlessPages.includes(pageId) &&
      !state.visitedActivities.includes(pageId)
    ) {
      state.visitedActivities.push(pageId);
      saveState();
      updateHeaderAndCounts();
    }

    if (pageId === 'goodbyePage') renderMoodTracker();
    if (pageId === 'blessingsPage') renderBlessings();

    if (pageId === 'duaPage') {
      renderDua();
      renderDuaReflections();
    }

    if (pageId === 'dhikrPage') renderDhikr();

    playTone(440, 0.05);
  }

  window.MindGarden = { navigate };

  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.getAttribute('data-go')));
  });

  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => navigate('gardenPage'));
  });

  const brandHome = byId('brandHome');
  if (brandHome) brandHome.addEventListener('click', () => navigate('gardenPage'));

// Cloud Thoughts — optionally save a copy; release animation is independent of saving.
  function renderThoughts() {
    const list = byId('thoughtList');
    if (!list) return;

    list.replaceChildren();

    if (!state.thoughts.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-note';
      empty.textContent = 'No clouds saved yet. You can leave this space empty, too. ☁️';
      list.append(empty);
      return;
    }

    [...state.thoughts]
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
      .forEach(thought => {
        const card = document.createElement('article');
        card.className = 'thought-card';

        const top = document.createElement('div');
        top.className = 'thought-card-top';

        const time = document.createElement('small');
        time.textContent = formatDate(thought.createdAt);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'small-delete';
        remove.textContent = 'Let go ✕';
        remove.setAttribute('aria-label', 'Delete saved thought');

        remove.addEventListener('click', () => {
          state.thoughts = state.thoughts.filter(x => x.id !== thought.id);
          saveState();
          renderThoughts();
          showToast('That cloud has drifted away. ☁️');
        });

        const text = document.createElement('p');
        text.textContent = thought.text;

        top.append(time, remove);
        card.append(top, text);
        list.append(card);
      });
  }

  const thoughtInput = byId('thoughtInput');
  const thoughtChars = byId('thoughtChars');

  if (thoughtInput && thoughtChars) {
    thoughtInput.addEventListener('input', () => {
      thoughtChars.textContent = `${thoughtInput.value.length} / 500`;
    });
  }

  const thoughtForm = byId('thoughtForm');

  if (thoughtForm) {
    thoughtForm.addEventListener('submit', event => {
      event.preventDefault();

      const text = thoughtInput ? thoughtInput.value.trim() : '';

      if (!text) {
        showToast('Write a little something first, or leave the space empty. ☁️');
        if (thoughtInput) thoughtInput.focus();
        return;
      }

      const keep = Boolean(
        byId('saveReleasedThought') && byId('saveReleasedThought').checked
      );

      const sky = byId('cloudSky');
      const message = byId('skyMessage');

      if (message) {
        message.textContent = text.length > 120 ? `${text.slice(0, 120)}…` : text;
        message.classList.remove('release-float');
        void message.offsetWidth;
        message.classList.add('release-float');
      }

      if (keep) {
        state.thoughts.unshift({
          id: makeId(),
          text: text.slice(0, 500),
          createdAt: Date.now()
        });

        saveState();
        renderThoughts();
        showToast('Released — and a copy is safely saved in this browser. ☁️');
      } else {
        showToast('Letting this thought drift away. Nothing was saved. ☁️');
      }

      thoughtInput.value = '';
      if (thoughtChars) thoughtChars.textContent = '0 / 500';

      if (byId('saveReleasedThought')) {
        byId('saveReleasedThought').checked = false;
      }

      window.setTimeout(() => {
        if (message) {
          message.classList.remove('release-float');
          message.textContent = 'Your thoughts are welcome here.';
        }
      }, 1300);

      playTone(587, 0.08);
    });
  }

  const clearThoughtsBtn = byId('clearThoughtsBtn');

  if (clearThoughtsBtn) {
    clearThoughtsBtn.addEventListener('click', () => {
      if (!state.thoughts.length) {
        showToast('There are no saved thoughts to clear. 🌿');
        return;
      }

      if (!window.confirm('Clear all saved thoughts from this browser?')) return;

      state.thoughts = [];
      saveState();
      renderThoughts();
      showToast('The sky is clear again. ☁️');
    });
  }

  // Little Steps
  function renderTasks() {
    const list = byId('taskList');
    const count = byId('taskCount');

    if (!list) return;

    list.replaceChildren();

    const total = state.tasks.length;
    const remaining = state.tasks.filter(t => !t.completed).length;

    if (count) {
      count.textContent = `${total} ${total === 1 ? 'task' : 'tasks'} · ${remaining} left`;
    }

    if (!total) {
      const empty = document.createElement('div');
      empty.className = 'empty-note';
      empty.textContent = 'Your list is taking a quiet little breath. Add a step whenever you’re ready. 🌿';
      list.append(empty);
      return;
    }

    const priorities = {
      gentle: 'Whenever I can 🌱',
      soon: 'I’d like to do it soon 🌷',
      important: 'My next priority ✨'
    };

    state.tasks.forEach(task => {
      const card = document.createElement('article');
      card.className = `task-card${task.completed ? ' completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(task.completed);
      checkbox.setAttribute('aria-label', `Mark task ${task.text} completed`);

      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        saveState();
        renderTasks();
        playTone(task.completed ? 784 : 523, 0.07);

        if (task.completed) {
          showToast('One small step, done. Nice and gentle. ✨');
        }
      });

      const content = document.createElement('div');
      content.className = 'task-content';

      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;

      const meta = document.createElement('small');
      meta.className = 'task-meta';
      meta.textContent = priorities[task.priority] || priorities.gentle;

      content.append(text, meta);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'task-delete';
      remove.textContent = '✕';
      remove.setAttribute('aria-label', `Delete task ${task.text}`);

      remove.addEventListener('click', () => {
        state.tasks = state.tasks.filter(x => x.id !== task.id);
        saveState();
        renderTasks();
        showToast('Step removed. Make room for what matters. 🌿');
      });
       
      card.append(checkbox, content, remove);
      list.append(card);
    });
  }

  const taskForm = byId('taskForm');

  if (taskForm) {
    taskForm.addEventListener('submit', event => {
      event.preventDefault();

      const input = byId('taskInput');
      const priority = byId('taskPriority');
      const text = input ? input.value.trim() : '';

      if (!text) {
        showToast('Choose one small step to add. 🌱');
        if (input) input.focus();
        return;
      }

      state.tasks.push({
        id: makeId(),
        text: text.slice(0, 120),
        priority: priority ? priority.value : 'gentle',
        completed: false,
        createdAt: Date.now()
      });

      saveState();

      input.value = '';
      renderTasks();
      showToast('One small step is on your list. 🌷');
      playTone(587, 0.07);
      input.focus();
    });
  }

  const clearCompletedBtn = byId('clearCompletedBtn');

  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const before = state.tasks.length;
      state.tasks = state.tasks.filter(t => !t.completed);

      if (state.tasks.length === before) {
        showToast('No completed steps to clear just yet. 🌿');
        return;
      }

      saveState();
      renderTasks();
      showToast('Completed steps cleared. You did what you could. ✨');
    });
  }

  // Mood tracker: check-ins, calendar, weekly summary, and an optional growing garden.
  function renderMoodGarden() {
    const garden = byId('moodGarden');
    const count = byId('moodBloomCount');

    if (!garden) return;

    garden.replaceChildren();

    const total = state.moodChecks.length;

    if (count) {
      count.textContent = `${total} ${total === 1 ? 'bloom' : 'blooms'}`;
    }

    if (!total) {
      garden.textContent = '🌱';
      return;
    }

    const bloomEmojis = ['🌷', '🌼', '🌸', '🌿', '✨', '🌻', '🍃'];
    const show = Math.min(total, 60);

    for (let i = 0; i < show; i++) {
      const item = document.createElement('span');
      item.className = 'garden-bloom';
      item.textContent = bloomEmojis[i % bloomEmojis.length];
      item.setAttribute('aria-hidden', 'true');
      garden.append(item);
    }

    if (total > show) {
      const more = document.createElement('span');
      more.className = 'tiny-note';
      more.textContent = `+ ${total - show} more`;
      garden.append(more);
    }
  }

  function renderWeek() {
    const wrap = byId('weekOverview');
    const count = byId('weekCheckCount');
     
    if (!wrap) return;

    wrap.replaceChildren();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    const tally = {};
    let total = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const key = dateKey(d);
      const hits = state.moodChecks.filter(c => keyFromTimestamp(c.createdAt) === key);

      total += hits.length;
      hits.forEach(c => {
        tally[c.mood] = (tally[c.mood] || 0) + 1;
      });

      days.push({ d, hits });
    }

    if (count) {
      count.textContent = `${total} ${total === 1 ? 'check-in' : 'check-ins'}`;
    }

    days.forEach(({ d, hits }) => {
      const el = document.createElement('div');
      el.className = 'week-day';

      const day = document.createElement('span');
      day.textContent = d.toLocaleDateString(undefined, { weekday: 'short' });

      const strong = document.createElement('strong');
      strong.textContent = hits.length
        ? (moodDetails[hits[hits.length - 1].mood]?.emoji || '•')
        : '·';

      const small = document.createElement('small');
      small.textContent = hits.length ? String(hits.length) : '0';

      el.append(day, strong, small);
      wrap.append(el);
    });

    const summary = document.createElement('p');
    summary.className = 'week-summary';

    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);

    summary.textContent = total
      ? `You recorded ${total} check-in${total === 1 ? '' : 's'} in the last 7 days${sorted.length ? `. Most logged: ${sorted[0][0]} (${sorted[0][1]}).` : '.'}`
      : 'No check-ins this week yet. There is no need to fill every day.';

    wrap.append(summary);
  }

  function renderCalendar() {
    const grid = byId('moodCalendar');
    const label = byId('calendarMonth');

    if (!grid || !label) return;

    grid.replaceChildren();
    label.textContent = calendarMonth.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });

       const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;

    for (let i = 0; i < offset; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day empty';
      empty.setAttribute('aria-hidden', 'true');
      grid.append(empty);
    }

    const lastByDay = {};

    state.moodChecks.forEach(check => {
      const d = safeDate(check.createdAt);

      if (d.getFullYear() === year && d.getMonth() === month) {
        lastByDay[d.getDate()] = check;
      }
    });

    const now = new Date();

    for (let day = 1; day <= daysInMonth; day++) {
      const el = document.createElement('div');
      el.className = 'calendar-day';

      if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
        el.classList.add('today');
      }

      const check = lastByDay[day];
      if (check) el.classList.add('has-mood');

      const number = document.createElement('span');
      number.textContent = String(day);
      el.append(number);

      if (check) {
        const emoji = document.createElement('span');
        emoji.className = 'day-mood';
        emoji.textContent = moodDetails[check.mood]?.emoji || '•';
        el.append(emoji);
        el.title = `${check.mood} · ${formatDate(check.createdAt, { month: 'short', day: 'numeric' })}`;
      }

      grid.append(el);
    }
  }
   function renderMoodHistory() {
    const list = byId('moodHistory');
    if (!list) return;

    list.replaceChildren();

    const checks = [...state.moodChecks]
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .slice(0, 30);

    if (!checks.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-note';
      empty.textContent = 'Your first check-in can begin whenever you are ready. 🌱';
      list.append(empty);
      return;
    }

    checks.forEach(check => {
      const card = document.createElement('article');
      card.className = 'mood-history-card';

      const top = document.createElement('div');
      top.className = 'mood-history-top';

      const emoji = document.createElement('span');
      emoji.className = 'mood-history-emoji';
      emoji.textContent = moodDetails[check.mood]?.emoji || '🌿';

      const details = document.createElement('div');
      details.className = 'mood-history-details';

      const strong = document.createElement('strong');
      strong.textContent = check.mood;

      const time = document.createElement('small');
      time.textContent = formatDate(check.createdAt);

      details.append(strong, time);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'small-delete';
      remove.textContent = 'Delete';

      remove.addEventListener('click', () => {
        state.moodChecks = state.moodChecks.filter(x => x.id !== check.id);
        state.flowers = Math.max(0, state.flowers - 1);
        state.mood = state.moodChecks[0]?.mood || '';
        saveState();
        renderMoodTracker();
        updateHeaderAndCounts();
        showToast('Check-in removed.');
      });

      top.append(emoji, details, remove);
      card.append(top);

      if (check.reflection) {
        const p = document.createElement('p');
        p.textContent = check.reflection;
        card.append(p);
      }

      list.append(card);
    });
  }

  function renderMoodTracker() {
    renderMoodGarden();
    renderWeek();
    renderCalendar();
    renderMoodHistory();
  }

  document.querySelectorAll('[data-mood-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMood = btn.getAttribute('data-mood-choice') || '';
      document.querySelectorAll('[data-mood-choice]').forEach(b => {
        b.classList.toggle('selected', b === btn);
      });
      playTone(523, 0.06);
    });
  });
   
  const moodForm = byId('moodForm');

  if (moodForm) {
    moodForm.addEventListener('submit', event => {
      event.preventDefault();

      if (!selectedMood) {
        showToast('Choose the feeling that fits best, or take another moment. 🌿');
        return;
      }

      const check = {
        id: makeId(),
        mood: selectedMood,
        emoji: moodDetails[selectedMood]?.emoji || '🌿',
        reflection: (byId('moodReflection')?.value || '').trim().slice(0, 350),
        createdAt: Date.now()
      };

      state.moodChecks.push(check);
      state.mood = selectedMood;
      state.flowers = Math.max(0, Number(state.flowers) || 0) + 1;
      saveState();

      selectedMood = '';

      document.querySelectorAll('[data-mood-choice]').forEach(b => b.classList.remove('selected'));

      if (byId('moodReflection')) byId('moodReflection').value = '';

      renderMoodTracker();
      updateHeaderAndCounts();
      showToast('Check-in saved. One more little bloom in your garden. 🌷');
      playTone(784, 0.1);
    });
  }

  const prevMonth = byId('prevMoodMonth');
  const nextMonth = byId('nextMoodMonth');

  if (prevMonth) {
    prevMonth.addEventListener('click', () => {
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
      renderCalendar();
    });
  }

  if (nextMonth) {
    nextMonth.addEventListener('click', () => {
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
      renderCalendar();
    });
  }
   
  // Little Blessings journal
  function renderBlessings() {
    const list = byId('blessingList');
    const count = byId('blessingCount');

    if (!list) return;

    list.replaceChildren();

    if (count) count.textContent = `${state.blessings.length} saved`;

    if (!state.blessings.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-note';
      empty.textContent = 'This page can stay empty until a little blessing comes to mind. 🤍';
      list.append(empty);
      return;
    }

    [...state.blessings]
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .forEach(item => {
        const card = document.createElement('article');
        card.className = 'blessing-card';

        const top = document.createElement('div');
        top.className = 'blessing-card-top';

        const symbol = document.createElement('span');
        symbol.className = 'blessing-symbol';
        symbol.textContent = '✧';

        const date = document.createElement('small');
        date.textContent = formatDate(item.createdAt);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'small-delete';
        remove.textContent = 'Delete';

        remove.addEventListener('click', () => {
          state.blessings = state.blessings.filter(x => x.id !== item.id);
          saveState();
          renderBlessings();
          showToast('Blessing removed from your list.');
        });

        const p = document.createElement('p');
        p.textContent = item.text;

        top.append(symbol, date, remove);
        card.append(top, p);
        list.append(card);
      });
  }
   
  const blessingForm = byId('blessingForm');

  if (blessingForm) {
    blessingForm.addEventListener('submit', event => {
      event.preventDefault();

      const input = byId('blessingInput');
      const text = input ? input.value.trim() : '';

      if (!text) {
        showToast('Write a little blessing first. 🤍');
        return;
      }

      state.blessings.unshift({
        id: makeId(),
        text: text.slice(0, 700),
        createdAt: Date.now()
      });

      saveState();
      input.value = '';
      renderBlessings();
      showToast('Your little blessing has been saved. 🤍');
      playTone(587, 0.07);
    });
  }

  // Dhikr counter
  function renderDhikr() {
    const key = byId('dhikrSelect')?.value || 'subhan';
    const item = dhikrOptions[key] || dhikrOptions.subhan;

    if (byId('dhikrArabic')) byId('dhikrArabic').textContent = item.arabic;
    if (byId('dhikrPhrase')) byId('dhikrPhrase').textContent = item.phrase;
    if (byId('dhikrMeaning')) byId('dhikrMeaning').textContent = item.meaning;

    if (byId('dhikrCount')) {
      byId('dhikrCount').textContent = String(Math.max(0, Number(state.dhikrCounts[key]) || 0));
    }
  }

  const dhikrSelect = byId('dhikrSelect');
  if (dhikrSelect) dhikrSelect.addEventListener('change', renderDhikr);

  const dhikrTap = byId('dhikrTapBtn');

  if (dhikrTap) {
    dhikrTap.addEventListener('click', () => {
      const key = dhikrSelect?.value || 'subhan';
      state.dhikrCounts[key] = Math.max(0, Number(state.dhikrCounts[key]) || 0) + 1;
      saveState();
      renderDhikr();
      playTone(660, 0.045);
    });
  }

  const dhikrReset = byId('dhikrResetBtn');

  if (dhikrReset) {
    dhikrReset.addEventListener('click', () => {
      const key = dhikrSelect?.value || 'subhan';

      if (!(Number(state.dhikrCounts[key]) > 0)) {
        showToast('This counter is already at zero.');
        return;
      }

      if (!window.confirm('Reset this dhikr counter?')) return;

      state.dhikrCounts[key] = 0;
      saveState();
      renderDhikr();
      showToast('Counter reset. Continue whenever you are ready.');
    });
  }
   
   
  // Dua & Reflection: Qur'anic supplications with references; user notes stay locally.
  function renderDua() {
    const key = byId('duaSelect')?.value || 'world';
    const dua = duas[key] || duas.world;

    if (byId('duaReference')) byId('duaReference').textContent = dua.ref;
    if (byId('duaArabic')) byId('duaArabic').textContent = dua.arabic;
    if (byId('duaTransliteration')) byId('duaTransliteration').textContent = dua.transliteration;

    if (byId('duaTranslation')) {
      byId('duaTranslation').textContent = `“${dua.translation}”`;
    }

    if (byId('duaSourceNote')) byId('duaSourceNote').textContent = dua.note;
    if (byId('duaReflection')) byId('duaReflection').value = '';
  }

  const duaSelect = byId('duaSelect');
  if (duaSelect) duaSelect.addEventListener('change', renderDua);

  function renderDuaReflections() {
    const list = byId('duaReflectionList');
    const count = byId('duaReflectionCount');

    if (!list) return;

    list.replaceChildren();

    if (count) count.textContent = `${state.duaReflections.length} saved`;

    if (!state.duaReflections.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-note';
      empty.textContent = 'Any reflections you choose to save will appear here. 🌙';
      list.append(empty);
      return;
    }

    [...state.duaReflections]
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .forEach(entry => {
        const card = document.createElement('article');
        card.className = 'reflection-card';

        const top = document.createElement('div');
        top.className = 'thought-card-top';

        const ref = document.createElement('small');
        ref.className = 'reflection-ref';
        ref.textContent = entry.ref;

        const date = document.createElement('small');
        date.textContent = formatDate(entry.createdAt);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'small-delete';
        remove.textContent = 'Delete';

        remove.addEventListener('click', () => {
          state.duaReflections = state.duaReflections.filter(x => x.id !== entry.id);
          saveState();
          renderDuaReflections();
          showToast('Reflection removed.');
        });

        const p = document.createElement('p');
        p.textContent = entry.text;

        top.append(ref, date, remove);
        card.append(top, p);
        list.append(card);
      });
  }
   
  const saveDuaBtn = byId('saveDuaReflectionBtn');

  if (saveDuaBtn) {
    saveDuaBtn.addEventListener('click', () => {
      const text = (byId('duaReflection')?.value || '').trim();

      if (!text) {
        showToast('Add a reflection first, or leave this private space empty.');
        return;
      }

      const key = duaSelect?.value || 'world';

      state.duaReflections.unshift({
        id: makeId(),
        key,
        ref: duas[key].ref,
        text: text.slice(0, 500),
        createdAt: Date.now()
      });

      saveState();

      if (byId('duaReflection')) byId('duaReflection').value = '';

      renderDuaReflections();
      showToast('Reflection saved in this browser. 🌙');
    });
  }

  // Time to Ayah: maps every valid 24-hour minute to a valid global ayah number.
  // This is a deterministic browsing rule, not a claim that a clock time is religiously significant.
  function globalAyahForTime(value) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value || '');
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

    const minutes = hour * 60 + minute;
    return Math.round((minutes / 1439) * 6235) + 1;
  }

  function showAyahLoading(message) {
    const result = byId('ayahResult');

    if (result) {
      result.replaceChildren();

      const box = document.createElement('div');
      box.className = 'loading-note';
      box.textContent = message;

      result.append(box);
    }
  }

  function renderAyahResult(arabicData, translationData, time, globalNumber) {
    const result = byId('ayahResult');
    if (!result) return;

    result.replaceChildren();

    const surah = arabicData.surah || translationData.surah || {};
    const card = document.createElement('article');
    card.className = 'ayah-result-card';

    const heading = document.createElement('p');
    heading.className = 'ayah-meta';
    heading.textContent = `${surah.englishName || 'Surah'} · ${surah.name || ''}`;

    const ref = document.createElement('p');
    ref.className = 'ayah-meta';
    ref.textContent = `Surah ${surah.number || '?'} · Ayah ${arabicData.numberInSurah || translationData.numberInSurah || '?'} · Chosen for ${time}`;

    const arabic = document.createElement('p');
    arabic.className = 'verse-arabic';
    arabic.setAttribute('lang', 'ar');
    arabic.setAttribute('dir', 'rtl');
    arabic.textContent = arabicData.text || 'Arabic text was not returned.';

    const translationHeading = document.createElement('p');
    translationHeading.className = 'tiny-label';
    translationHeading.textContent = 'ENGLISH TRANSLATION · SAHEEH INTERNATIONAL';

   
    const translation = document.createElement('p');
    translation.className = 'ayah-translation';
    translation.textContent = translationData.text || 'Translation was not returned.';

    const global = document.createElement('p');
    global.className = 'tiny-note center-text';
    global.textContent = `Qur’an global ayah index: ${arabicData.number || translationData.number || globalNumber}`;

    const prompt = document.createElement('div');
    prompt.className = 'reflection-prompt';

    const strong = document.createElement('strong');
    strong.textContent = 'Personal reflection prompt · not Qur’an text';

    const p = document.createElement('p');
    p.textContent = reflectionPrompts[
      (time.split(':').reduce((sum, n) => sum * 60 + Number(n), 0)) % reflectionPrompts.length
    ];
    p.style.margin = '0';

    prompt.append(strong, p);
    card.append(heading, ref, arabic, translationHeading, translation, global, prompt);
    result.append(card);
  }

  async function findAyahForTime(time) {
    const globalNumber = globalAyahForTime(time);

    if (!globalNumber) {
      showToast('Please choose a valid time between 00:00 and 23:59.');
      return;
    }

    showAyahLoading(`Finding a real Qur’anic ayah for ${time}…`);

    const endpoint = `https://api.alquran.cloud/v1/ayah/${globalNumber}/editions/quran-uthmani,en.sahih`;

    try {
      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error(`Quran service returned ${response.status}`);

      const payload = await response.json();

      if (payload.code !== 200 || !Array.isArray(payload.data)) {
        throw new Error('Unexpected Quran response');
      }

      const arabicData =
        payload.data.find(item => item.edition && item.edition.identifier === 'quran-uthmani') ||
        payload.data[0];

      const translationData =
        payload.data.find(item => item.edition && item.edition.identifier === 'en.sahih') ||
        payload.data[1];

      if (!arabicData?.text || !translationData?.text || !arabicData?.surah) {
        throw new Error('Verse details were incomplete');
    }
       
      renderAyahResult(arabicData, translationData, time, globalNumber);
      playTone(587, 0.07);
    } catch (error) {
      console.warn('Time to Ayah could not load verse:', error);

      showAyahLoading(
        'The ayah service could not be reached right now. Check your internet connection and try again. No verse has been guessed or made up.'
      );
    }
  }

  const timeAyahForm = byId('timeAyahForm');

  if (timeAyahForm) {
    timeAyahForm.addEventListener('submit', event => {
      event.preventDefault();
      findAyahForTime(byId('ayahTimeInput')?.value || '');
    });
  }

  // Audio file guidance when GitHub files are not present yet.
  document.querySelectorAll('.audio-card audio').forEach(audio => {
    audio.addEventListener('error', () => {
      const status = audio.closest('.audio-copy')?.querySelector('.audio-status');

      if (status) {
        status.textContent = 'Audio file not found. Check the exact MP3 filename inside the audio folder.';
      }
    });

        audio.addEventListener('canplay', () => {
      const status = audio.closest('.audio-copy')?.querySelector('.audio-status');
      if (status) status.textContent = '';
    });
  });

  // Settings panel, focus restoration, and reset.
  function openSettings() {
    const modal = byId('settingsModal');
    if (!modal) return;

    previousFocus = document.activeElement;

    if (byId('soundToggle')) byId('soundToggle').checked = state.sound;
    if (byId('motionToggle')) byId('motionToggle').checked = state.reducedMotion;
    if (byId('nameInput')) byId('nameInput').value = state.name;

    modal.hidden = false;
    byId('closeSettingsBtn')?.focus();
  }

  function closeSettings() {
    const modal = byId('settingsModal');
    if (modal) modal.hidden = true;

    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function saveSettings() {
    state.sound = Boolean(byId('soundToggle')?.checked);
    state.reducedMotion = Boolean(byId('motionToggle')?.checked);

    const name = (byId('nameInput')?.value || '').trim().slice(0, 24);
    state.name = name || 'Mawo';

    saveState();
    applyMotionSetting();
    updateHeaderAndCounts();
    closeSettings();
    showToast('Your little space has been updated. 💜');
    playTone(660, 0.08);
  }

  function resetProgress() {
    if (!window.confirm(
      'Reset all Mind Garden progress, thoughts, tasks, moods, blessings, dhikr counts, reflections, and preferences on this browser?'
    )) return;

    state = freshState();
    saveState();
    breathCycle = 0;
    selectedMood = '';

    stopBreathing(false);
    renderThoughts();
    renderTasks();
    renderMoodTracker();
    renderBlessings();
    renderDhikr();
    renderDuaReflections();

    if (thoughtInput) thoughtInput.value = '';
    if (thoughtChars) thoughtChars.textContent = '0 / 500';
    if (byId('blessingInput')) byId('blessingInput').value = '';
    if (byId('moodReflection')) byId('moodReflection').value = '';

    document.querySelectorAll('[data-mood-choice]').forEach(b => {
      b.classList.remove('selected');
    });

       applyMotionSetting();
    updateHeaderAndCounts();
    renderDua();
    closeSettings();

    showToast('A fresh little garden, just for you. 🌱');
  }

  const soundBtn = byId('soundBtn');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      state.sound = !state.sound;
      saveState();
      updateSoundButton();

      if (state.sound) playTone(660, 0.08);

      showToast(
        state.sound ? 'Soft sounds are on. ♪' : 'Sound is off. Quiet is lovely, too. 🌙'
      );
    });
  }

  const settingsBtn = byId('settingsBtn');
  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);

  const closeSettingsBtn = byId('closeSettingsBtn');
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);

  const saveSettingsBtn = byId('saveSettingsBtn');
  if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

  const resetBtn = byId('resetProgressBtn');
  if (resetBtn) resetBtn.addEventListener('click', resetProgress);

  const modal = byId('settingsModal');

  if (modal) {
    modal.addEventListener('click', event => {
      if (event.target === modal) closeSettings();
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal && !modal.hidden) closeSettings();
  });

  const breathStart = byId('breathStartBtn');
  if (breathStart) breathStart.addEventListener('click', startBreathing);

  const breathStop = byId('breathStopBtn');

  if (breathStop) {
    breathStop.addEventListener('click', () => {
      stopBreathing(true);
      showToast('Pause whenever you need. 🌙');
    });
  }

  // Initial render. Old saved tasks/thoughts/preferences remain available.
  applyMotionSetting();
  updateHeaderAndCounts();
  renderThoughts();
  renderTasks();
  renderMoodTracker();
  renderBlessings();
  renderDhikr();
  renderDua();
  renderDuaReflections();
  stopBreathing(false);

  if (thoughtInput && thoughtChars) {
    thoughtChars.textContent = `${thoughtInput.value.length} / 500`;
  }
})();
