/* ═══════════════════════════════════════════════════════════
   WEDDING CONFIG — edit everything here to customise the card
   ═══════════════════════════════════════════════════════════ */
const WEDDING = {
  groom:       'Aiman',
  bride:       'Arifah',
  groomParent: 'Mohamad Daud bin Hashim & Norhazana binti Mohd Salih',
  brideParent:  'Ruslan bin Ahmad & Roszaina binti Mohd Alide',
  hashtag:     '#AimanArifah',

  date:      '2026-08-22',
  timeStart: '20:00',
  timeEnd:   '22:30',
  timeZone:  'Asia/Kuala_Lumpur',

  venue:   'Rumah Pengantin',
  address: 'No 1, Jalan Pandan Indah 5D\Taman Pandan Indah\n75250 Melaka',

  mapsUrl: 'https://maps.app.goo.gl/xaXxwDHViyFTFBDPA?g_st=iwb',
  wazeUrl: 'https://waze.com/ul/hw22sw4qss',

  // ⚠️  Replace with a video whose owner allows embedding.
  // To check: open the video on YouTube → Share → Embed.
  // If "Embedding disabled" appears, pick a different upload of the same song.
  youtubeId: 'QgaTQ5-XfMM',

  programme: [
    { event: 'Arrival of Guests',             time: '11:00 AM' },
    { event: 'Arrival of Bride & Groom',      time: '12:30 PM' },
    { event: 'Wedding Ceremony',              time: '1:00 PM'  },
    { event: 'Lunch & Reception',             time: '1:30 PM'  },
    { event: 'End of Ceremony',               time: '5:00 PM'  },
  ],

  contacts: [
    { name: 'Ahmad',   relation: 'Father of Groom', phone: '+601X-XXXXXXX' },
    { name: 'Fatimah', relation: 'Mother of Groom', phone: '+601X-XXXXXXX' },
    { name: 'Ibrahim', relation: 'Father of Bride',  phone: '+601X-XXXXXXX' },
  ],

  gifts: {
    qrCodes: [
      { label: "Touch 'n Go", image: 'assets/qr-tng.png'     },
      { label: 'Maybank',     image: 'assets/qr-maybank.png' },
    ],
    wishlist: [
      // { name: 'Philips Rice Cooker', store: 'Shopee', image: 'assets/wish-1.jpg', url: '#' },
    ],
  },

  // Paste Google Apps Script Web App URL here after setup (see bottom of file)
  rsvpEndpoint: '',
};

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
  const d = parseDate();
  setText('footer-date', new Intl.DateTimeFormat('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: WEDDING.timeZone,
  }).format(d));
}

function populateDetails() {
  const d = parseDate();
  // Inline date/time
  const dayFmt  = new Intl.DateTimeFormat('en-MY', { weekday: 'long', timeZone: WEDDING.timeZone });
  const dateFmt = new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: WEDDING.timeZone });
  setText('dt-day',  dayFmt.format(d));
  setText('dt-date', dateFmt.format(d));
  setText('dt-time', `${to12h(WEDDING.timeStart)} – ${to12h(WEDDING.timeEnd)}`);
  // Popup date/time
  setText('pdt-day',  dayFmt.format(d));
  setText('pdt-date', dateFmt.format(d));
  setText('pdt-time', `${to12h(WEDDING.timeStart)} – ${to12h(WEDDING.timeEnd)}`);
  // Venue (inline)
  setText('venue-name-inline', WEDDING.venue);
  document.getElementById('venue-address-inline').textContent = WEDDING.address;
  // Venue (popup)
  setText('venue-name', WEDDING.venue);
  document.getElementById('venue-address').textContent = WEDDING.address;
  // Calendar links — both inline and popup share same anchors via IDs
  buildCalendarLinks(d);
}

function populateProgramme() {
  const list = document.getElementById('programme-list');
  WEDDING.programme.forEach(p => {
    const item = document.createElement('div');
    item.className = 'programme-item';
    item.innerHTML = `<span class="programme-event">${esc(p.event)}</span><span class="programme-time">${esc(p.time)}</span>`;
    list.appendChild(item);
  });
  setText('hashtag', WEDDING.hashtag);
}

function populateLocation() {
  document.getElementById('maps-btn').href = WEDDING.mapsUrl;
  document.getElementById('waze-btn').href = WEDDING.wazeUrl;
  document.getElementById('maps-btn-popup').href = WEDDING.mapsUrl;
  document.getElementById('waze-btn-popup').href = WEDDING.wazeUrl;
}

/* YT player — created lazily on first song popup open */
let ytPlayer    = null;
let ytApiReady  = false;
let ytPlayPending = false;

window.onYouTubeIframeAPIReady = function () {
  ytApiReady = true;
  // If OPEN was already clicked before API loaded, create + play now
  if (ytPlayPending) createYTPlayer(true);
};

function createYTPlayer(autoplay) {
  ytPlayer = new YT.Player('yt-player', {
    videoId: WEDDING.youtubeId,
    playerVars: {
      autoplay:       autoplay ? 1 : 0,
      loop:           1,
      playlist:       WEDDING.youtubeId,
      playsinline:    1,
      rel:            0,
      modestbranding: 1,
    },
    events: {
      onReady: (e) => { if (autoplay) e.target.playVideo(); },
    },
  });
}

function populateSong() { /* YT player created lazily in reveal() */ }

function populateContacts() {
  const list = document.getElementById('contact-list');
  if (!list) return;
  WEDDING.contacts.forEach(c => {
    const item = document.createElement('div');
    item.className = 'contact-item';
    item.innerHTML = `
      <div class="contact-info">
        <div class="contact-name">${esc(c.name)}</div>
        <div class="contact-relation">${esc(c.relation)}</div>
      </div>
      <a class="contact-call" href="tel:${esc(c.phone)}" aria-label="Call ${esc(c.name)}">
        <i class="bi bi-telephone-fill"></i>
      </a>`;
    list.appendChild(item);
  });
}

function populateGift() {
  const qrList = document.getElementById('gift-qr-list');
  WEDDING.gifts.qrCodes.forEach(q => {
    const item = document.createElement('div');
    item.className = 'qr-item';
    item.innerHTML = `<img src="${esc(q.image)}" alt="${esc(q.label)} QR code"><span class="qr-label">${esc(q.label)}</span>`;
    qrList.appendChild(item);
  });
  const wishlist = document.getElementById('wishlist');
  if (!WEDDING.gifts.wishlist.length) { wishlist.style.display = 'none'; return; }
  WEDDING.gifts.wishlist.forEach(w => {
    const item = document.createElement('a');
    item.className = 'wish-item';
    item.href = w.url || '#'; item.target = '_blank'; item.rel = 'noopener';
    item.innerHTML = `<img src="${esc(w.image)}" alt="${esc(w.name)}"><div><div class="wish-item-name">${esc(w.name)}</div><div class="wish-item-store">${esc(w.store)}</div></div>`;
    wishlist.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════
   OPEN BUTTON — book-fold animation + entrance sequence
   ═══════════════════════════════════════════════════════════ */
function setupOpenButton() {
  const btn   = document.getElementById('open-btn');
  const cover = document.getElementById('cover');
  const card  = document.getElementById('card');
  const nav   = document.getElementById('sticky-nav');

  btn.addEventListener('click', () => {
    // 1. Fade medallion out, then start fold
    cover.classList.add('opening');

    // 2. Show card *behind* the cover immediately so it's ready
    card.classList.remove('d-none');

    // 3. Reveal card after fold completes — transitionend is primary,
    //    setTimeout(1500) is a fallback for environments that suppress the event
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      cover.classList.add('done');
      card.classList.add('visible');
      nav.classList.add('visible');
      AOS.init({ duration: 750, once: true, offset: 50 });
      AOS.refresh();
      addScrollHint();
      startAutoScroll();
      // Autoplay music — user gesture (OPEN click) is still in scope here
      if (ytApiReady) {
        createYTPlayer(true);
      } else {
        // API not loaded yet — flag to create+play once it fires
        ytPlayPending = true;
      }
    };

    const rightPanel = cover.querySelector('.cover-panel-right');
    rightPanel.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'transform') return;
      reveal();
    }, { once: true });

    // Fallback: fire after transition duration (1.4s) + small buffer
    setTimeout(reveal, 1500);
  });
}

/* ── Scroll hint indicator ── */
function addScrollHint() {
  const hint = document.createElement('div');
  hint.className = 'scroll-hint';
  hint.id = 'scroll-hint';
  hint.innerHTML = `<i class="bi bi-chevron-compact-down"></i><span>SCROLL</span>`;
  document.getElementById('card').appendChild(hint);
  setTimeout(() => hint.classList.add('visible'), 200);

  // Hide once user scrolls
  window.addEventListener('scroll', () => hint.classList.remove('visible'), { once: true });
}

/* ── Auto-scroll: starts if user doesn't interact for 2.5s ── */
let autoScrollTimer = null;
let userInteracted  = false;

function startAutoScroll() {
  const stopEvents = ['touchstart', 'mousedown', 'wheel', 'keydown'];
  const onInteract = () => {
    userInteracted = true;
    clearTimeout(autoScrollTimer);
    stopEvents.forEach(e => window.removeEventListener(e, onInteract));
  };
  stopEvents.forEach(e => window.addEventListener(e, onInteract, { passive: true }));

  autoScrollTimer = setTimeout(() => {
    if (!userInteracted) smoothAutoScroll();
  }, 2500);
}

function smoothAutoScroll() {
  // Gently scroll down ~80% of viewport, then stop — just a hint
  const target = window.scrollY + window.innerHeight * 0.75;
  const start  = window.scrollY;
  const dur    = 2200;
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    if (userInteracted) return;
    const progress = Math.min((ts - startTime) / dur, 1);
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;
    window.scrollTo(0, start + (target - start) * ease);
    if (progress < 1 && !userInteracted) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════
   POPUP SYSTEM
   ═══════════════════════════════════════════════════════════ */
let activePopup = null;

function setupPopups() {
  const backdrop = document.getElementById('popup-backdrop');

  document.querySelectorAll('.nav-icon[data-popup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.popup;
      activePopup && activePopup.id === id ? closePopup() : openPopup(id);
    });
  });

  // Inline "RSVP Now" and "Write a Message" buttons
  const rsvpNow = document.getElementById('btn-open-rsvp');
  const writeMsg = document.getElementById('btn-open-wishes');
  if (rsvpNow)  rsvpNow.addEventListener('click',  () => openPopup('popup-rsvp'));
  if (writeMsg) writeMsg.addEventListener('click', () => openPopup('popup-rsvp'));

  backdrop.addEventListener('click', closePopup);

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
  document.getElementById('popup-backdrop').classList.add('visible');
  const navBtn = document.querySelector(`.nav-icon[data-popup="${id}"]`);
  if (navBtn) navBtn.classList.add('active');
  activePopup = popup;
  // Stop auto-scroll when popup opens
  userInteracted = true;
}

function closePopup() {
  if (!activePopup) return;
  activePopup.classList.remove('show');
  document.getElementById('popup-backdrop').classList.remove('visible');
  document.querySelectorAll('.nav-icon').forEach(b => b.classList.remove('active'));
  activePopup = null;
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN
   ═══════════════════════════════════════════════════════════ */
function startCountdown() {
  function tick() {
    const diff = parseDate(true).getTime() - Date.now();
    if (diff <= 0) {
      ['cd-days','cd-hours','cd-minutes','cd-seconds',
       'pcd-days','pcd-hours','pcd-minutes','pcd-seconds'].forEach(id => setText(id, '0'));
      return;
    }
    const s = Math.floor(diff / 1000);
    const vals = [Math.floor(s/86400), Math.floor((s%86400)/3600), Math.floor((s%3600)/60), s%60];
    ['days','hours','minutes','seconds'].forEach((k,i) => {
      setText(`cd-${k}`,  String(vals[i]));
      setText(`pcd-${k}`, String(vals[i]));
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR EXPORT
   ═══════════════════════════════════════════════════════════ */
function buildCalendarLinks(d) {
  const title = encodeURIComponent(`Wedding of ${WEDDING.groom} & ${WEDDING.bride}`);
  const loc   = encodeURIComponent(`${WEDDING.venue}, ${WEDDING.address.replace(/\n/g, ', ')}`);
  const start = toCalStr(d, WEDDING.timeStart);
  const end   = toCalStr(d, WEDDING.timeEnd);
  const gcal  = `https://calendar.google.com/calendar/r/eventedit?text=${title}&dates=${start}/${end}&location=${loc}`;

  ['gcal-btn','pgcal-btn'].forEach(id => { const el = document.getElementById(id); if(el) el.href = gcal; });

  const icalHandler = e => {
    e.preventDefault();
    const blob = new Blob([buildICS(title, d, loc)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'wedding.ics'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  ['ical-btn','pical-btn'].forEach(id => { const el = document.getElementById(id); if(el) el.addEventListener('click', icalHandler); });
}

function toCalStr(d, timeStr) {
  const [h,m] = timeStr.split(':').map(Number);
  const dt = new Date(d); dt.setHours(h,m,0,0);
  const p = n => String(n).padStart(2,'0');
  return `${dt.getFullYear()}${p(dt.getMonth()+1)}${p(dt.getDate())}T${p(dt.getHours())}${p(dt.getMinutes())}00`;
}

function buildICS(title, d, loc) {
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Card//EN','BEGIN:VEVENT',
    `DTSTART;TZID=${WEDDING.timeZone}:${toCalStr(d, WEDDING.timeStart)}`,
    `DTEND;TZID=${WEDDING.timeZone}:${toCalStr(d, WEDDING.timeEnd)}`,
    `SUMMARY:${decodeURIComponent(title)}`,
    `LOCATION:${decodeURIComponent(loc)}`,
    'END:VEVENT','END:VCALENDAR',
  ].join('\r\n');
}

/* ═══════════════════════════════════════════════════════════
   RSVP
   ═══════════════════════════════════════════════════════════ */
function setupRsvp() {
  const btnAttend   = document.getElementById('btn-attending');
  const btnAbsent   = document.getElementById('btn-not-attending');
  const hiddenField = document.getElementById('rsvp-attending');
  const form        = document.getElementById('rsvp-form');
  const feedback    = document.getElementById('rsvp-feedback');
  const submitBtn   = document.getElementById('rsvp-submit');

  [btnAttend, btnAbsent].forEach(btn => btn.addEventListener('click', () => {
    btnAttend.classList.toggle('active', btn === btnAttend);
    btnAbsent.classList.toggle('active', btn === btnAbsent);
    hiddenField.value = btn.dataset.value;
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name      = document.getElementById('rsvp-name').value.trim();
    const message   = document.getElementById('rsvp-message').value.trim();
    const attending = hiddenField.value;
    if (!name) { showFeedback(feedback, 'Please enter your name.', 'error'); return; }
    if (!WEDDING.rsvpEndpoint) {
      showFeedback(feedback, 'RSVP endpoint not configured yet — see setup instructions in main.js.', 'error');
      return;
    }
    submitBtn.disabled = true; submitBtn.textContent = 'Sending…';
    try {
      const res  = await fetch(WEDDING.rsvpEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, attending, message }), mode: 'cors' });
      const json = await res.json();
      if (json.success) {
        showFeedback(feedback, 'Thank you! Your RSVP has been received. 🎉', 'success');
        form.reset();
        btnAttend.classList.add('active'); btnAbsent.classList.remove('active'); hiddenField.value = 'attending';
        if (json.wishes) renderWishes(json.wishes);
        else loadWishes();
      } else throw new Error('Server error');
    } catch { showFeedback(feedback, 'Something went wrong. Please try again.', 'error'); }
    finally { submitBtn.disabled = false; submitBtn.textContent = 'Send RSVP'; }
  });
}

function showFeedback(el, msg, type) {
  el.textContent = msg;
  el.style.color = type === 'error' ? '#c0665a' : 'var(--accent)';
  setTimeout(() => { el.textContent = ''; }, 6000);
}

/* ═══════════════════════════════════════════════════════════
   WISHES WALL
   ═══════════════════════════════════════════════════════════ */
async function loadWishes() {
  if (!WEDDING.rsvpEndpoint) return;
  try {
    const res  = await fetch(WEDDING.rsvpEndpoint, { mode: 'cors' });
    const json = await res.json();
    if (json.wishes) renderWishes(json.wishes);
  } catch { /* silent */ }
}

function renderWishes(wishes) {
  const container = document.getElementById('wishes-list-inline');
  if (!container) return;
  container.innerHTML = '';
  wishes.filter(w => w.message).slice(-8).reverse().forEach(w => {
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
  const [h, m] = WEDDING.timeStart.split(':').map(Number);
  return withTime
    ? new Date(`${WEDDING.date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)
    : new Date(`${WEDDING.date}T00:00:00`);
}
function formatShortDate(d) {
  return new Intl.DateTimeFormat('en-MY', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: WEDDING.timeZone,
  }).format(d);
}
function to12h(t) {
  const [h,m] = t.split(':').map(Number);
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}
function setText(id, val) { const el = document.getElementById(id); if(el) el.textContent = val; }
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/* ═══════════════════════════════════════════════════════════
   GOOGLE APPS SCRIPT SETUP (RSVP BACKEND)
   ═══════════════════════════════════════════════════════════

   1. Go to https://script.google.com — New project
   2. Create a Google Sheet, copy its ID from the URL
   3. Paste the code below into Code.gs
   4. Deploy > New deployment > Web App
        Execute as: Me | Who has access: Anyone
   5. Copy the Web App URL → paste into WEDDING.rsvpEndpoint above

──────────────────────────────────────────────
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp','Name','Attending','Message']);
    sheet.appendRow([new Date(), data.name||'', data.attending||'', data.message||'']);
    const rows   = sheet.getDataRange().getValues().slice(1);
    const wishes = rows.map(r => ({ name: r[1], attending: r[2], message: r[3] }));
    return ContentService.createTextOutput(JSON.stringify({ success: true, wishes }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet() {
  const sheet  = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const rows   = sheet.getDataRange().getValues().slice(1);
  const wishes = rows.map(r => ({ name: r[1], attending: r[2], message: r[3] }));
  return ContentService.createTextOutput(JSON.stringify({ wishes }))
    .setMimeType(ContentService.MimeType.JSON);
}
──────────────────────────────────────────────
   ═══════════════════════════════════════════════════════════ */
