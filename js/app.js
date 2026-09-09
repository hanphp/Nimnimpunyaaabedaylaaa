/* ==========================================================================
   Pastoral Cottagecore Birthday Web Experience — "For Hanim"
   Interactive Application Logic, iOS Safe Audio & Blowable Candle
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTaskbarClock();
  initAudioEngine();
  initWindowManager();
  initWaxSealEnvelope();
  initScrapbookAlbum();
  initBirthdayCake();
  initWishPinboard();
});

/* ==========================================================================
   1. TASKBAR CLOCK
   ========================================================================== */
function initTaskbarClock() {
  const clockEl = document.getElementById('taskbar-clock-text');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    clockEl.textContent = now.toLocaleTimeString([], options);
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. PERSISTENT AUDIO ENGINE (iOS Safe with Web Audio Fallback)
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let synthTimer = null;
let bgAudio = null;

function initAudioEngine() {
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const enterBtn = document.getElementById('welcome-btn');
  const widget = document.getElementById('audio-widget');
  const disk = document.getElementById('vinyl-disk');
  const label = document.getElementById('audio-label');
  const waves = document.getElementById('sound-waves');

  bgAudio = document.getElementById('bg-audio');

  function startAudioPlayback() {
    if (welcomeOverlay) {
      welcomeOverlay.classList.add('hidden');
    }

    if (!isAudioPlaying) {
      isAudioPlaying = true;
      if (disk) disk.classList.add('playing');
      if (waves) waves.classList.add('playing');
      if (label) label.textContent = "Music On";

      // Try playing MP3 audio file first
      if (bgAudio) {
        bgAudio.play().then(() => {
          console.log("Playing background MP3 audio.");
        }).catch(err => {
          console.warn("MP3 playback fallback to procedural piano synth:", err);
          startProceduralPianoSynth();
        });
      } else {
        startProceduralPianoSynth();
      }
    }
  }

  function pauseAudioPlayback() {
    isAudioPlaying = false;
    if (disk) disk.classList.remove('playing');
    if (waves) waves.classList.remove('playing');
    if (label) label.textContent = "Music Off";

    if (bgAudio) {
      bgAudio.pause();
    }
    if (synthTimer) {
      clearInterval(synthTimer);
      synthTimer = null;
    }
  }

  function toggleAudio() {
    if (isAudioPlaying) {
      pauseAudioPlayback();
    } else {
      startAudioPlayback();
    }
  }

  // iOS Autoplay unlock handlers on first tap/click
  if (welcomeOverlay) {
    welcomeOverlay.addEventListener('click', startAudioPlayback);
    welcomeOverlay.addEventListener('touchend', startAudioPlayback);
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', startAudioPlayback);
  }

  if (widget) {
    widget.addEventListener('click', toggleAudio);
  }

  // Fallback procedural gentle piano pentatonic synth
  function startProceduralPianoSynth() {
    function playNote() {
      if (!isAudioPlaying) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
        const freq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 2.5);
      } catch (e) {
        console.warn("Synth audio note error:", e);
      }
    }

    playNote();
    if (!synthTimer) {
      synthTimer = setInterval(playNote, 1600);
    }
  }
}

// Chime Sound Effect for Seal Break
function playSealChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) { }
}

/* ==========================================================================
   3. WINDOW MANAGER & BACKDROP BLUR
   ========================================================================== */
function initWindowManager() {
  const windows = document.querySelectorAll('.app-window');
  const desktopIcons = document.querySelectorAll('.desktop-icon-card');
  const closeBtns = document.querySelectorAll('.btn-close, .close-window-trigger');
  const backdropBlur = document.getElementById('modal-backdrop-blur');

  function openWindow(windowId) {
    windows.forEach(win => win.classList.remove('active'));
    const targetWin = document.getElementById(windowId);
    if (targetWin) {
      if (backdropBlur) backdropBlur.classList.add('active');
      targetWin.classList.add('active');
    }
  }

  function closeAllWindows() {
    windows.forEach(win => win.classList.remove('active'));
    if (backdropBlur) backdropBlur.classList.remove('active');
  }

  desktopIcons.forEach(icon => {
    const handler = (e) => {
      e.preventDefault();
      const targetId = icon.getAttribute('data-window');
      if (targetId === 'home') {
        closeAllWindows();
      } else if (targetId) {
        openWindow(targetId);
      }
    };
    icon.addEventListener('click', handler);
    icon.addEventListener('touchend', handler);
  });

  document.querySelectorAll('.taskbar-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-window');
      if (target === 'home') closeAllWindows();
      else if (target) openWindow(target);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllWindows();
    });
  });

  if (backdropBlur) {
    backdropBlur.addEventListener('click', closeAllWindows);
  }

  window.openWindow = openWindow;
  window.closeAllWindows = closeAllWindows;
}

/* ==========================================================================
   4. VIEW 2: INTERACTIVE WAX-SEAL LETTER FOR HANIM
   ========================================================================== */
function initWaxSealEnvelope() {
  const envelope = document.getElementById('envelope-wrapper');
  const sealBtn = document.getElementById('wax-seal-btn');
  const letterPreview = document.getElementById('envelope-letter-preview');
  const letterModal = document.getElementById('full-letter-modal');
  const closeLetterBtn = document.getElementById('close-letter-btn');

  if (!envelope || !sealBtn) return;

  function unsealEnvelope() {
    if (envelope.classList.contains('open')) {
      letterModal.classList.add('active');
      return;
    }

    playSealChime();

    envelope.classList.add('open');

    setTimeout(() => {
      if (letterPreview) letterPreview.classList.add('extracted');
    }, 400);

    setTimeout(() => {
      if (letterModal) letterModal.classList.add('active');
    }, 1000);
  }

  function closeLetterModal() {
    if (letterModal) letterModal.classList.remove('active');
  }

  sealBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    unsealEnvelope();
  });

  envelope.addEventListener('click', unsealEnvelope);

  if (closeLetterBtn) {
    closeLetterBtn.addEventListener('click', closeLetterModal);
  }

  if (letterModal) {
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) closeLetterModal();
    });
  }
}

/* ==========================================================================
   5. VIEW 3: "SAME ENERGY" SCRAPBOOK ALBUM FOR HANIM
   ========================================================================== */
const albumMemories = [
  {
    id: 1,
    title: "The forest Fawn",
    date: "Bambi • Deer",
    imageSrc: "./assets/photos/photo1.jpg",
    caption: "Just You in Another World 🌸",
    noteText: "A creature of soft moss and quiet dawn, she carries the tender grace of a forest fawn. With wide, velvet eyes that mirror the skies, gentle, unspoken, and endlessly wise."
  },
  {
    id: 2,
    title: "Morning Gentle Hue",
    date: "Sunrise • Sunset",
    imageSrc: "./assets/photos/photo2.jpg",
    caption: "Better Describe as",
    noteText: "Like morning light that gently weaves, through tender moss and golden leaves, a fawn of softest amber hue, quiet as the early dew."
  },
  {
    id: 3,
    title: "The Shoreline Dreamer",
    date: "Ariel • Goddesssss",
    imageSrc: "./assets/photos/photo3.jpg",
    caption: "Freedom with The Rule ✨",
    noteText: "A girl with a heart tuned to ocean tides, where hidden wonder and yearning resides. With sunlit sea-glass in her gaze, she dreams in waves and golden rays drawn toward shores unknown and bright, a soft tide reaching for the light."
  },
  {
    id: 4,
    title: "Tide and Petal",
    date: "Facing the Shoreline Sun",
    imageSrc: "./assets/photos/photo4.jpg",
    caption: "What flower? 🍓",
    noteText: "Turned toward the sun with an open face, she holds the wild sea dreaming grace. A forest heart in petal-gold, unafraid of the light she holds soft as the fawn, bright as the tide, where wonder and quiet warmth abide."
  },
	{
    id: 5,
    title: "Best of the best person",
    date: "Over that what she expect",
    imageSrc: "./assets/photos/photo5.jpg",
    caption: "Sunlit and Barefoot",
    noteText: "She never knew the grace she bore, just placing footsteps on the floor, unsure if fragile bones would break beneath the weight a heart can take. Yet here she stands, unbroken through, alive in ways she never knew."
  }
];

let currentMemoryIndex = 0;

function initScrapbookAlbum() {
  const grid = document.getElementById('album-photos-grid');
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');

  if (!grid) return;

  grid.innerHTML = albumMemories.map((mem, index) => `
    <div class="polaroid-frame" data-index="${index}">
      <div class="polaroid-img-wrapper">
        <img src="${mem.imageSrc}" alt="${mem.title}" loading="lazy" />
      </div>
      <div class="polaroid-caption">${mem.caption}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.polaroid-frame').forEach(frame => {
    const handler = () => {
      const idx = parseInt(frame.getAttribute('data-index'), 10);
      openLightbox(idx);
    };
    frame.addEventListener('click', handler);
  });

  function openLightbox(index) {
    currentMemoryIndex = index;
    updateLightboxContent();
    if (modal) modal.classList.add('active');
  }

  function closeLightbox() {
    if (modal) modal.classList.remove('active');
  }

  function updateLightboxContent() {
    const mem = albumMemories[currentMemoryIndex];
    document.getElementById('lightbox-img').src = mem.imageSrc;
    document.getElementById('lightbox-title').textContent = mem.title;
    document.getElementById('lightbox-date').textContent = mem.date;
    document.getElementById('lightbox-text').textContent = mem.noteText;
  }

  function nextMemory() {
    currentMemoryIndex = (currentMemoryIndex + 1) % albumMemories.length;
    updateLightboxContent();
  }

  function prevMemory() {
    currentMemoryIndex = (currentMemoryIndex - 1 + albumMemories.length) % albumMemories.length;
    updateLightboxContent();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', nextMemory);
  if (prevBtn) prevBtn.addEventListener('click', prevMemory);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'ArrowRight') nextMemory();
    if (e.key === 'ArrowLeft') prevMemory();
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ==========================================================================
   6. VIEW 4: INTERACTIVE BIRTHDAY CAKE & FLOWER PETAL SHOWER
   ========================================================================== */
function initBirthdayCake() {
  const cakeContainer = document.getElementById('cake-container');
  const flame = document.getElementById('candle-flame');
  const instruction = document.getElementById('cake-instruction');
  const messageEl = document.getElementById('cake-celebration-message');

  if (!cakeContainer || !flame) return;

  let isBlownOut = false;

  function blowOutCandle(e) {
    if (e) e.preventDefault();
    if (isBlownOut) return;
    isBlownOut = true;

    // 1. Extinguish flame
    flame.classList.add('extinguished');

    // 2. Create rising smoke particles
    createSmokeAnimation(cakeContainer);

    // 3. Trigger flower petal and confetti shower
    createPetalShower();

    // 4. Update instruction & display popup message
    if (instruction) {
      instruction.textContent = "✨ Your birthday wish has been sent to the stars! ✨";
    }

    if (messageEl) {
      messageEl.textContent = "🎉 Happy Birthday Hanim! May all your wishes come true! 💖🌸";
      messageEl.style.display = "block";
    }
  }

  cakeContainer.addEventListener('click', blowOutCandle);
  cakeContainer.addEventListener('touchend', blowOutCandle);
}

function createSmokeAnimation(container) {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-particle';
      container.appendChild(smoke);
      setTimeout(() => smoke.remove(), 2000);
    }, i * 300);
  }
}

function createPetalShower() {
  const layer = document.createElement('div');
  layer.className = 'petal-shower-layer';
  document.body.appendChild(layer);

  const petals = ['🌸', '✨', '💖', '🌼', '🌷', '🎀'];

  for (let i = 0; i < 45; i++) {
    setTimeout(() => {
      const petal = document.createElement('div');
      petal.className = 'petal-particle';
      petal.textContent = petals[Math.floor(Math.random() * petals.length)];
      petal.style.left = Math.random() * 100 + 'vw';
      petal.style.animationDuration = (3 + Math.random() * 2) + 's';
      layer.appendChild(petal);

      setTimeout(() => petal.remove(), 5000);
    }, i * 80);
  }

  setTimeout(() => layer.remove(), 7000);
}

/* ==========================================================================
   7. WISH PINBOARD GUESTBOOK FOR HANIM
   ========================================================================== */
const defaultHanimWishes = [
  {
    name: "Try 1",
    message: "Happy Birthday Hanim! May your day be bathed in golden sunlight, pink roses, and infinite joy! ✨🌸",
    date: "September 10"
  },
  {
    name: "Try 2",
    message: "Wishing you the sweetest year ahead Hanim! May all your dreams unfold into beautiful reality! 💖",
    date: "September 10"
  },
  {
    name: "Try 3",
    message: "Happy Birthday Hanim!",
    date: "September 10"
  }
];

function initWishPinboard() {
  const container = document.getElementById('pinboard-canvas');
  const form = document.getElementById('guestbook-form');

  if (!container) return;

  let wishes = JSON.parse(localStorage.getItem('birthday_wishes_hanim') || 'null');
  if (!wishes || wishes.length === 0) {
    wishes = defaultHanimWishes;
    localStorage.setItem('birthday_wishes_hanim', JSON.stringify(wishes));
  }

  function renderWishes() {
    container.innerHTML = wishes.map(w => `
      <div class="pinned-sticky-note">
        <div class="pushpin-dot"></div>
        <div class="sticky-author">${escapeHTML(w.name)}</div>
        <div class="sticky-content">"${escapeHTML(w.message)}"</div>
      </div>
    `).join('');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-author-input');
      const msgInput = document.getElementById('wish-message-input');

      const name = nameInput.value.trim();
      const message = msgInput.value.trim();

      if (!name || !message) return;

      wishes.unshift({ name, message, date: "Just now" });
      localStorage.setItem('birthday_wishes_hanim', JSON.stringify(wishes));

      renderWishes();

      nameInput.value = '';
      msgInput.value = '';
    });
  }

  renderWishes();
}
