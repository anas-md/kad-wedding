/* ═══════════════════════════════════════════════════════════
   Loaded BEFORE main.js. Everything here is visible to anyone
   who views the live site — committed deliberately for
   this short-lived repo.
   ═══════════════════════════════════════════════════════════ */
const WEDDING_PRIVATE = {
  groomParent: 'Mohamad Daud bin Hashim & Norhazana binti Mohd Salih',
  brideParent: 'Ruslan bin Ahmad & Roszaina binti Mohd Alide',

  address: 'No 1, Jalan Pandan Indah 5D\nTaman Pandan Indah\n75250 Melaka',

  contacts: [
    { name: 'Aiman',     relation: 'Pengantin Lelaki',         phone: '0139546016' },
    { name: 'Arifah',    relation: 'Pengantin Perempuan',      phone: '01160708738' }, 
    { name: 'Norhazana', relation: 'Ibu Pengantin Lelaki',     phone: '0139458357' },
    { name: 'Hairul',    relation: 'Bapa Pengantin Perempuan', phone: '0163140409' },
  ],

  // Paste the /exec URL from Deploy > Manage deployments
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbz6JrqptNMIawqn1AXYDjioYrU4Yx4ecQj-BACecWtQslduZtWuppYHg94pJC9LZLa3Rw/exec',
  // Must match WRITE_TOKEN in Apps Script > Project Settings > Script Properties
  rsvpToken: '339c9619-bbae-4bc2-8160-8c33b6eacfb0',
};
