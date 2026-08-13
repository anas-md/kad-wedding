/* ═══════════════════════════════════════════════════════════
   WEDDING CONFIG — public, non-sensitive values
   Private values are merged in from config.js (loaded first).
   ═══════════════════════════════════════════════════════════ */
const WEDDING = {
  groom:   'Aiman',
  bride:   'Arifah',
  hashtag: '#AimanArifah',

  date:      '2026-08-22',
  timeStart: '20:15',
  timeEnd:   '00:00',        // 12:00 AM — crosses midnight into 23 Aug (see endDateStr())
  timeZone:  'Asia/Kuala_Lumpur',
  utcOffset: '+08:00',       // Malaysia has no DST

  venue: 'Rumah Pengantin',

  mapsUrl: 'https://maps.app.goo.gl/xaXxwDHViyFTFBDPA?g_st=iwb',
  wazeUrl: 'https://waze.com/ul/hw22sw4qss',

  youtubeId: 'QgaTQ5-XfMM',

  programme: [
    { event: 'Ketibaan Tetamu',    time: '8:15 PM' },
    { event: 'Jamuan Makan',       time: '8:30 PM' },
    { event: 'Ketibaan Pengantin', time: '8:45 PM' },
    { event: 'Penutup Majlis',     time: '12:00 AM' },
  ],

  gifts: { wishlist: [] },

  /* ── Filled from config.js ── */
  groomParent:  '',
  brideParent:  '',
  address:      '',
  contacts:     [],
  rsvpEndpoint: '',
  rsvpToken:    '',
};

// Merge private config (config.js must be loaded before this file)
if (typeof WEDDING_PRIVATE !== 'undefined') Object.assign(WEDDING, WEDDING_PRIVATE);

/* ═══════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  populateCover();
  populateHero();
  populateDetails();
  populateProgramme();
  populateContacts();
  populateLocation();
  populateSong();
  populateGift();
  setupOpenButton();
  setupPopups();
  setupRsvp();
  startCountdown();
  if (WEDDING.rsvpEndpoint) loadWishes();
});

/* ═══════════════════════════════════════════════════════════
   POPULATE
   ═══════════════════════════════════════════════════════════ */
function populateCover() {
  setText('cover-groom', WEDDING.groom);
  setText('cover-bride', WEDDING.bride);
  setText('cover-date', formatShortDate(parseDate()));
}

function populateHero() {
  setText('parents-groom', WEDDING.groomParent);
  setText('parents-bride', WEDDING.brideParent);
  setText('hero-groom', WEDDING.groom);
  setText('hero-bride', WEDDING.bride);
  setText('footer-names', `${WEDDING.groom} & ${WEDDING.bride}`);
  setText('footer-date', new Intl.DateTimeFormat('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: WEDDING.timeZone,
  }).format(parseDate()));
}

function populateDetails() {
  const d = parseDate();
  const dayFmt  = new Intl.DateTimeFormat('ms-MY', { weekday: 'long', timeZone: WEDDING.timeZone });
  const dateFmt = new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: WEDDING.timeZone });
  const timeStr = `${to12h(WEDDING.timeStart)} – ${to12h(WEDDING.timeEnd)}`;

  // TARIKH / MASA (inline)
  setText('dt-day',  dayFmt.format(d));
  setText('dt-date', dateFmt.format(d));
  setText('dt-time', timeStr);
  // TARIKH & MASA (popup)
  setText('pdt-day',  dayFmt.format(d));
  setText('pdt-date', dateFmt.format(d));
  setText('pdt-time', timeStr);

  setText('venue-name-inline',    WEDDING.venue);
  setText('venue-address-inline', WEDDING.address);
  setText('venue-name',           WEDDING.venue);
  setText('venue-address',        WEDDING.address);

  buildCalendarLinks();
}

function populateProgramme() {
  const list = document.getElementById('programme-list');
  if (list) {
    WEDDING.programme.forEach(p => {
      const item = document.createElement('div');
      item.className = 'programme-item';
      item.innerHTML = `<span class="programme-event">${esc(p.event)}</span><span class="programme-time">${esc(p.time)}</span>`;
      list.appendChild(item);
    });
  }
  setText('hashtag', WEDDING.hashtag);
}

function populateLocation() {
  setHref('maps-btn',       WEDDING.mapsUrl);
  setHref('waze-btn',       WEDDING.wazeUrl);
  setHref('maps-btn-popup', WEDDING.mapsUrl);
  setHref('waze-btn-popup', WEDDING.wazeUrl);
}

function populateContacts() {
  const list = document.getElementById('contact-list');
  if (!list) return;
  WEDDING.contacts.forEach(c => {
    const tel = telHref(c.phone);
    if (!tel) return;   // skips placeholders like 01XXXXXXXX
    const item = document.createElement('div');
    item.className = 'contact-item';
    item.innerHTML = `
      <div class="contact-info">
        <div class="contact-name">${esc(c.name)}</div>
        <div class="contact-relation">${esc(c.relation)}</div>
      </div>
      <a class="contact-call" href="tel:${tel}" aria-label="Hubungi ${esc(c.name)}">
        <i class="bi bi-telephone-fill"></i>
      </a>`;
    list.appendChild(item);
  });
}

function populateGift() {
  const wishlist = document.getElementById('wishlist');
  if (!wishlist) return;
  if (!WEDDING.gifts.wishlist.length) { wishlist.style.display = 'none'; return; }
  WEDDING.gifts.wishlist.forEach(w => {
    const item = document.createElement('a');
    item.className = 'wish-item';
    item.href = safeUrl(w.url);
    item.target = '_blank';
    item.rel = 'noopener noreferrer';
    item.innerHTML = `<img src="${esc(w.image)}" alt="${esc(w.name)}"><div><div class="wish-item-name">${esc(w.name)}</div><div class="wish-item-store">${esc(w.store)}</div></div>`;
    wishlist.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════
   YOUTUBE (lazy)
   ═══════════════════════════════════════════════════════════ */
let ytPlayer = null, ytApiReady = false, ytPlayPending = false;

window.onYouTubeIframeAPIReady = function () {
  ytApiReady = true;
  if (ytPlayPending) createYTPlayer(true);
};

function createYTPlayer(autoplay) {
  if (ytPlayer) return;
  ytPlayer = new YT.Player('yt-player', {
    videoId: WEDDING.youtubeId,
    playerVars: {
      autoplay: autoplay ? 1 : 0, loop: 1, playlist: WEDDING.youtubeId,
      playsinline: 1, rel: 0, modestbranding: 1,
    },
    events: { onReady: e => { if (autoplay) e.target.playVideo(); } },
  });
}

function populateSong() { /* player created lazily in reveal() */ }

/* ═══════════════════════════════════════════════════════════
   BUKA BUTTON
   ═══════════════════════════════════════════════════════════ */
function setupOpenButton() {
  const btn   = document.getElementById('open-btn');
  const cover = document.getElementById('cover');
  const card  = document.getElementById('card');
  const nav   = document.getElementById('sticky-nav');
  if (!btn || !cover || !card) return;

  btn.addEventListener('click', () => {
    cover.classList.add('opening');
    card.classList.remove('d-none');

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      cover.classList.add('done');
      card.classList.add('visible');
      if (nav) nav.classList.add('visible');
      AOS.init({ duration: 750, once: true, offset: 50 });
      AOS.refresh();
      addScrollHint();
      startAutoScroll();
      if (ytApiReady) createYTPlayer(true);
      else ytPlayPending = true;
    };

    const rightPanel = cover.querySelector('.cover-panel-right');
    if (rightPanel) {
      rightPanel.addEventListener('transitionend', e => {
        if (e.propertyName === 'transform') reveal();
      }, { once: true });
    }
    setTimeout(reveal, 1500);
  });
}

function addScrollHint() {
  const card = document.getElementById('card');
  if (!card) return;
  const hint = document.createElement('div');
  hint.className = 'scroll-hint';
  hint.id = 'scroll-hint';
  hint.innerHTML = `<i class="bi bi-chevron-compact-down"></i><span>GESER</span>`;
  card.appendChild(hint);
  setTimeout(() => hint.classList.add('visible'), 200);
  window.addEventListener('scroll', () => hint.classList.remove('visible'), { once: true });
}

let autoScrollTimer = null, userInteracted = false;

function startAutoScroll() {
  const stopEvents = ['touchstart', 'mousedown', 'wheel', 'keydown'];
  const onInteract = () => {
    userInteracted = true;
    clearTimeout(autoScrollTimer);
    stopEvents.forEach(e => window.removeEventListener(e, onInteract));
  };
  stopEvents.forEach(e => window.addEventListener(e, onInteract, { passive: true }));
  autoScrollTimer = setTimeout(() => { if (!userInteracted) smoothAutoScroll(); }, 2500);
}

function smoothAutoScroll() {
  const target = window.scrollY + window.innerHeight * 0.75;
  const start  = window.scrollY;
  const dur    = 2200;
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    if (userInteracted) return;
    const progress = Math.min((ts - startTime) / dur, 1);
    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    window.scrollTo(0, start + (target - start) * ease);
    if (progress < 1 && !userInteracted) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════
   POPUPS
   ═══════════════════════════════════════════════════════════ */
let activePopup = null;

function setupPopups() {
  const backdrop = document.getElementById('popup-backdrop');

  document.querySelectorAll('.nav-icon[data-popup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.popup;
      if (activePopup && activePopup.id === id) closePopup();
      else openPopup(id);
    });
  });

  const rsvpNow  = document.getElementById('btn-open-rsvp');
  const writeMsg = document.getElementById('btn-open-wishes');
  if (rsvpNow)  rsvpNow.addEventListener('click',  () => openPopup('popup-rsvp'));
  if (writeMsg) writeMsg.addEventListener('click', () => openPopup('popup-rsvp'));

  if (backdrop) backdrop.addEventListener('click', closePopup);

  document.querySelectorAll('.popup').forEach(popup => {
    let startY = 0;
    popup.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    popup.addEventListener('touchend',   e => { if (e.changedTouches[0].clientY - startY > 60) closePopup(); }, { passive: true });
  });
}

function openPopup(id) {
  if (activePopup) {
    activePopup.classList.remove('show');
    document.querySelectorAll('.nav-icon').forEach(b => b.classList.remove('active'));
  }
  const popup = document.getElementById(id);
  if (!popup) return;
  popup.classList.add('show');
  const bd = document.getElementById('popup-backdrop');
  if (bd) bd.classList.add('visible');
  const navBtn = document.querySelector(`.nav-icon[data-popup="${id}"]`);
  if (navBtn) navBtn.classList.add('active');
  activePopup = popup;
  userInteracted = true;
}

function closePopup() {
  if (!activePopup) return;
  activePopup.classList.remove('show');
  const bd = document.getElementById('popup-backdrop');
  if (bd) bd.classList.remove('visible');
  document.querySelectorAll('.nav-icon').forEach(b => b.classList.remove('active'));
  activePopup = null;
}

/* ═══════════════════════════════════════════════════════════
   MENGIRA HARI — identical result in every timezone
   ═══════════════════════════════════════════════════════════ */
function startCountdown() {
  const targetMs = parseDate(true).getTime();
  let timer = null;

  function tick() {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      ['days','hours','minutes','seconds'].forEach(k => {
        setText(`cd-${k}`, '0'); setText(`pcd-${k}`, '0');
      });
      if (timer) clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    const vals = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
    ['days','hours','minutes','seconds'].forEach((k, i) => {
      setText(`cd-${k}`,  String(vals[i]));
      setText(`pcd-${k}`, String(vals[i]));
    });
  }
  tick();
  timer = setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR EXPORT — midnight-crossing aware
   ═══════════════════════════════════════════════════════════ */
function buildCalendarLinks() {
  const title = `Perkahwinan ${WEDDING.groom} & ${WEDDING.bride}`;
  const loc   = `${WEDDING.venue}, ${String(WEDDING.address).replace(/\n/g, ', ')}`;
  const gcal  = 'https://calendar.google.com/calendar/r/eventedit'
    + `?text=${encodeURIComponent(title)}`
    + `&dates=${toCalUTC(WEDDING.date, WEDDING.timeStart)}/${toCalUTC(endDateStr(), WEDDING.timeEnd)}`
    + `&location=${encodeURIComponent(loc)}`
    + `&ctz=${encodeURIComponent(WEDDING.timeZone)}`;

  ['gcal-btn','pgcal-btn'].forEach(id => setHref(id, gcal));

  const icalHandler = e => {
    e.preventDefault();
    const blob = new Blob([buildICS(title, loc)], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'walimatulurus-aiman-arifah.ics'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  ['ical-btn','pical-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', icalHandler);
  });
}

// If timeEnd is at or before timeStart, the majlis crosses midnight → next day
function endDateStr() {
  const [sh, sm] = WEDDING.timeStart.split(':').map(Number);
  const [eh, em] = WEDDING.timeEnd.split(':').map(Number);
  if (eh * 60 + em > sh * 60 + sm) return WEDDING.date;
  const d = new Date(`${WEDDING.date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function toCalUTC(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr}:00${WEDDING.utcOffset}`);
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`
       + `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;
}

function toCalLocal(dateStr, timeStr) {
  return `${dateStr.replace(/-/g, '')}T${timeStr.replace(':', '')}00`;
}

function buildICS(title, loc) {
  const escICS = s => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Card//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    `UID:${WEDDING.date}-aimanarifah@aimanandarifah.my`,
    `DTSTART;TZID=${WEDDING.timeZone}:${toCalLocal(WEDDING.date, WEDDING.timeStart)}`,
    `DTEND;TZID=${WEDDING.timeZone}:${toCalLocal(endDateStr(), WEDDING.timeEnd)}`,
    `SUMMARY:${escICS(title)}`,
    `LOCATION:${escICS(loc)}`,
    'END:VEVENT','END:VCALENDAR',
  ].join('\r\n');
}

/* ═══════════════════════════════════════════════════════════
   RSVP
   ═══════════════════════════════════════════════════════════ */
const MAX_NAME = 100, MAX_MSG = 500;

function setupRsvp() {
  const btnAttend   = document.getElementById('btn-attending');
  const btnAbsent   = document.getElementById('btn-not-attending');
  const hiddenField = document.getElementById('rsvp-attending');
  const form        = document.getElementById('rsvp-form');
  const feedback    = document.getElementById('rsvp-feedback');
  const submitBtn   = document.getElementById('rsvp-submit');
  if (!form || !btnAttend || !btnAbsent || !hiddenField) return;

  [btnAttend, btnAbsent].forEach(btn => btn.addEventListener('click', () => {
    btnAttend.classList.toggle('active', btn === btnAttend);
    btnAbsent.classList.toggle('active', btn === btnAbsent);
    hiddenField.value = btn.dataset.value;
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameEl = document.getElementById('rsvp-name');
    const msgEl  = document.getElementById('rsvp-message');
    const name      = (nameEl ? nameEl.value : '').trim().slice(0, MAX_NAME);
    const message   = (msgEl ? msgEl.value : '').trim().slice(0, MAX_MSG);
    const attending = normalizeAttending(hiddenField.value);
    const hpEl      = document.getElementById('rsvp-website');
    const honeypot  = hpEl ? hpEl.value : '';

    if (!name) { showFeedback(feedback, 'Sila masukkan nama anda.', 'error'); return; }
    if (!WEDDING.rsvpEndpoint || !WEDDING.rsvpToken) {
      showFeedback(feedback, 'Endpoint RSVP belum dikonfigurasi.', 'error');
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menghantar…'; }
    try {
      const res = await fetch(WEDDING.rsvpEndpoint, {
        method: 'POST',
        // text/plain avoids the CORS preflight Apps Script cannot answer.
        // Server still does JSON.parse(e.postData.contents).
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          token: WEDDING.rsvpToken,
          name, attending, message,
          website: honeypot,
        }),
        redirect: 'follow',
      });
      const json = await res.json();
      if (!json.success) throw new Error('Server error');

      showFeedback(feedback, 'Terima kasih. RSVP anda telah diterima. 🎉', 'success');
      form.reset();
      btnAttend.classList.add('active');
      btnAbsent.classList.remove('active');
      hiddenField.value = btnAttend.dataset.value || 'attending';
      loadWishes();
    } catch {
      showFeedback(feedback, 'Terdapat ralat. Sila cuba semula.', 'error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Hantar RSVP'; }
    }
  });
}

// Accepts 'attending'/'not-attending'/'yes'/'no'/'hadir'/'tidak-hadir'
function normalizeAttending(v) {
  const s = String(v || '').toLowerCase();
  return /(^no$|not|tidak|tak)/.test(s) ? 'no' : 'yes';
}

let feedbackTimer = null;
function showFeedback(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'error' ? '#c0665a' : 'var(--accent)';
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { el.textContent = ''; }, 6000);
}

/* ═══════════════════════════════════════════════════════════
   WISHES WALL (UCAPAN)
   ═══════════════════════════════════════════════════════════ */
async function loadWishes() {
  if (!WEDDING.rsvpEndpoint) return;
  try {
    const res  = await fetch(WEDDING.rsvpEndpoint, { redirect: 'follow' });
    const json = await res.json();
    if (json.wishes) renderWishes(json.wishes);
  } catch { /* silent */ }
}

function renderWishes(wishes) {
  const container = document.getElementById('wishes-list-inline');
  if (!container || !Array.isArray(wishes)) return;
  container.innerHTML = '';
  wishes.filter(w => w && w.message).slice(-8).reverse().forEach(w => {
    const item = document.createElement('div');
    item.className = 'wish-inline-item';
    item.innerHTML = `<p class="wish-inline-msg">${esc(w.message)}</p><p class="wish-inline-name">${esc(w.name)}</p>`;
    container.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════ */
function parseDate(withTime = false) {
  const time = withTime ? WEDDING.timeStart : '00:00';
  return new Date(`${WEDDING.date}T${time}:00${WEDDING.utcOffset}`);
}

function formatShortDate(d) {
  return new Intl.DateTimeFormat('ms-MY', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: WEDDING.timeZone,
  }).format(d);
}

function to12h(t) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val == null ? '' : val;
}

function setHref(id, url) {
  const el = document.getElementById(id);
  if (el) el.href = safeUrl(url);
}

function safeUrl(url) {
  const s = String(url || '#').trim();
  return /^(https?:|mailto:|tel:|#|\/|\.)/i.test(s) ? s : '#';
}

function telHref(phone) {
  const cleaned = String(phone || '').replace(/[^\d+]/g, '');
  return /^\+?\d{7,15}$/.test(cleaned) ? cleaned : '';
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}