/* =====================================================================
   FAZET Login v9 · FAZET HEART — terintegrasi dengan FAZETT LOPP LOPP
   Modul ES mandiri. Dirender di dalam Shadow DOM supaya CSS-nya tidak
   bentrok dengan Tailwind aplikasi, dan seluruh timer/listener dibersihkan
   saat komponen dilepas (destroy()).

   Dipakai lewat:  mountFazetLogin(hostElement, opsi)
   ===================================================================== */
const CSS = __CSS__;
const BODY = __BODY__;

export function mountFazetLogin(host, opsi = {}) {
  const o = Object.assign({
    workspace: null,          // 'fathur' | 'mazet' — workspace aktif terakhir
    initialView: 'login',     // 'login' | 'forgot'
    sessions: {},             // { fathur: bool, mazet: bool } — sesi Supabase yang masih hidup
    login: null,              // async (email, password, remember, workspace)
    resetPassword: null,      // async (email, workspace)
    signOut: async () => {},  // async () => keluar dari workspace aktif
    onSuccess: () => {},      // (workspace) => navigasi setelah login
    openWorkspace: () => {},  // (workspace) => pakai sesi yang sudah ada
    navigate: (p) => location.assign(p),
    formatError: (e) => (e && e.message) || String(e || ''),
  }, opsi);

  const sh = host.shadowRoot || host.attachShadow({ mode: 'open' });
  sh.innerHTML = `<style>${CSS}</style><div class="fz-html" data-theme="dark"><div class="fz-body v8-scroll-anywhere" data-p="">${BODY}</div></div>`;

  const $ = (s) => sh.querySelector(s);
  const $$ = (s) => [...sh.querySelectorAll(s)];
  const htmlEl = $('.fz-html');
  const bodyEl = $('.fz-body');
  const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- lifecycle helpers ---------- */
  let alive = true;
  const disposers = [];
  const timers = new Set();
  const listen = (t, ev, fn, op) => { t.addEventListener(ev, fn, op); disposers.push(() => t.removeEventListener(ev, fn, op)); };
  const every = (fn, ms) => { const id = setInterval(fn, ms); timers.add(id); return id; };
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const meta = document.querySelector('meta[name=theme-color]');
  const metaOrig = meta ? meta.content : null;

  /* ---------- profil ---------- */
  const P = {
    fathur: { n: 'Fathur', g: 'linear-gradient(135deg,#2563eb,#06b6d4)', i: 'F' },
    mazet: { n: 'Mazet', g: 'linear-gradient(135deg,#7c3aed,#ec4899)', i: 'M' },
  };
  const isP = (k) => k === 'fathur' || k === 'mazet';
  let who = isP(o.workspace) ? o.workspace : (isP(store.get('fz-last')) ? store.get('fz-last') : null);
  const wait = (ms) => new Promise((r) => later(r, ms));
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const authMode = () => 'Supabase Auth · RLS';

  /* ---------- tema per waktu WIB ---------- */
  const PERIODS = {
    dawn: { label: 'Pagi', icon: '🌅', theme: 'light' },
    day: { label: 'Siang', icon: '☀️', theme: 'light' },
    dusk: { label: 'Sore', icon: '🌇', theme: 'light' },
    night: { label: 'Malam', icon: '🌙', theme: 'dark' },
  };
  const hourWIB = () => +new Intl.DateTimeFormat('en', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }).format(new Date()) % 24;
  const periodNow = () => { const h = hourWIB(); return h < 6 ? 'night' : h < 11 ? 'dawn' : h < 15 ? 'day' : h < 19 ? 'dusk' : 'night'; };
  let themeMode = store.get('fz-theme-mode') || 'auto';
  function applyTheme() {
    const pr = periodNow(), info = PERIODS[pr], manual = store.get('fz-theme') || 'dark';
    htmlEl.dataset.period = pr;
    htmlEl.dataset.theme = themeMode === 'auto' ? info.theme : manual;
    htmlEl.classList.toggle('manual-theme', themeMode !== 'auto');
    $('.show')?.setAttribute('data-scene', pr);
    $('#periodIcon').textContent = info.icon;
    $('#periodText').textContent = info.label;
    $('#periodChip').title = 'Suasana otomatis · ' + info.label;
    $('#sessionMode').textContent = themeMode === 'auto' ? 'Mode otomatis · ' + info.label : 'Tema manual · ' + htmlEl.dataset.theme;
    $('#securityMode').textContent = authMode() + (navigator.onLine ? '' : ' · offline');
    if (meta) meta.content = pr === 'dusk' ? '#ff8a3d' : pr === 'night' ? '#090a0f' : '#f4f6fb';
  }
  function syncSceneCopy() {
    const pr = periodNow(), n = $('#ambientNote');
    if (n) n.textContent = pr === 'dawn' ? 'Cahaya pagi lembut · siap memulai hari.' : pr === 'day' ? 'Mode siang cerah · fokus tanpa ramai.' : pr === 'dusk' ? 'Golden hour · aksen orange lebih hangat.' : 'Night mode · tenang, gelap, dan fokus.';
  }
  function toast(t) {
    const e = document.createElement('div');
    e.className = 'tk'; e.textContent = t; e.setAttribute('role', 'status');
    bodyEl.appendChild(e); later(() => e.remove(), 2600);
  }
  applyTheme(); syncSceneCopy();
  every(applyTheme, 30000);
  if (!RM) every(syncSceneCopy, 15000);
  $('#theme').onclick = () => {
    const next = htmlEl.dataset.theme === 'dark' ? 'light' : 'dark';
    if (themeMode === 'auto') { themeMode = 'manual'; store.set('fz-theme-mode', 'manual'); store.set('fz-theme', next); toast('Tema manual diaktifkan'); }
    else { store.set('fz-theme', next); toast('Tema ' + (next === 'dark' ? 'gelap' : 'terang')); }
    applyTheme(); syncSceneCopy();
  };

  /* ---------- jam & jaringan ---------- */
  function tick() {
    $('#clock').textContent = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).replace('.', ':');
  }
  tick(); every(tick, 15000);
  function net() {
    const on = navigator.onLine;
    $('#net').classList.toggle('off', !on);
    $('#netT').textContent = on ? 'Realtime' : 'Offline';
    $('#securityMode').textContent = authMode() + (on ? '' : ' · offline');
  }
  net(); listen(window, 'online', net); listen(window, 'offline', net);
  const greet = () => { const h = hourWIB(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam'; };

  /* logo fallback */
  const crest = $('#crest');
  if (crest) crest.onerror = (e) => { e.target.outerHTML = '<span class="logo" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z"/><path d="M6 10.2V15c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.8"/></svg></span>'; };

  /* ---------- hero mengetik ---------- */
  const W = ['tugas', 'jadwal', 'catatan', 'fokus belajar', 'rencana', 'Lopp Lopp'];
  let wi = 0, ci = 0, dl = false;
  (function typeLoop() {
    if (!alive) return;
    if (RM) { $('#typed').textContent = W[0]; return; }
    const w = W[wi]; ci += dl ? -1 : 1; $('#typed').textContent = w.slice(0, ci);
    let t = dl ? 44 : 84;
    if (!dl && ci === w.length) { dl = true; t = 1250; } else if (dl && !ci) { dl = false; wi = (wi + 1) % W.length; t = 280; }
    later(typeLoop, t);
  })();

  /* ---------- konten fitur (disesuaikan dengan aplikasi FAZETT LOPP LOPP) ---------- */
  const F = {
    penting: [
      ['🏠', 'Dashboard', 'Ringkasan hari ini', 'Lihat tugas mendesak, jadwal, dan progres mingguan dalam satu layar.', ['Buka Dashboard setelah masuk', 'Cek kartu Hari ini', 'Klik tugas untuk langsung mengerjakan']],
      ['✅', 'Tugas', 'Deadline & checklist', 'Prioritas, deadline, checklist, komentar, dan lampiran file.', ['Tekan Tugas baru', 'Isi judul, deadline, prioritas', 'Centang checklist sampai selesai']],
      ['🗓️', 'Jadwal', 'Kelas & kuliah', 'Jadwal mingguan lengkap dengan jam dan ruang.', ['Buka Jadwal', 'Pilih hari, tambah mata pelajaran', 'Otomatis muncul di Kalender']],
      ['📅', 'Kalender', 'Agenda terpadu', 'Semua deadline dan jadwal dalam satu kalender.', ['Buka Kalender', 'Ganti tampilan bulan atau minggu', 'Klik tanggal untuk melihat agenda']],
      ['📝', 'Catatan', 'Tulis & simpan', 'Catatan belajar tersimpan di cloud dan mudah dicari.', ['Buat catatan baru', 'Beri judul dan isi', 'Cari lewat kolom pencarian']],
      ['⏱️', 'TimeBox', 'Fokus belajar', 'Timer fokus untuk sesi belajar tanpa gangguan.', ['Pilih tugas', 'Atur durasi fokus', 'Mulai timer sampai selesai']],
    ],
    pendukung: [
      ['💞', 'Lopp Lopp', 'Hubungan dua workspace', 'Hubungkan akun Fathur & Mazet lewat email pasangan: chat realtime, jadwal, serta tugas dan catatan yang sengaja dibagikan.', ['Buka menu Lopp Lopp', 'Masukkan email pasangan', 'Tandai tugas atau catatan yang ingin dibagikan']],
      ['🤖', 'FAZET AI', 'Saran otomatis', 'AI memecah tugas besar dan menyarankan tenggat yang realistis.', ['Buka tugas besar', 'Tekan Saran AI', 'Terima atau ubah pecahannya']],
      ['💬', 'Chat', 'Obrolan workspace', 'Ruang chat untuk diskusi tugas, tampil realtime.', ['Buka Chat', 'Ketik pesan atau kirim file', 'Pesan tampil realtime']],
      ['🎬', 'MediaBox', 'Media & Watch Party', 'Putar dan simpan video belajar, atau nonton bareng lewat Watch Party.', ['Buka MediaBox', 'Tambahkan video', 'Ajak pasangan lewat Watch Party']],
      ['📊', 'Insight', 'Statistik', 'Grafik tugas selesai, jam fokus, dan tren mingguan.', ['Buka Insight', 'Pilih rentang waktu', 'Lihat tren dan evaluasi']],
      ['🖼️', 'My Minee', 'Galeri pribadi', 'Simpan foto dan kenangan di galeri pribadi workspace.', ['Buka My Minee', 'Unggah foto', 'Lihat kembali kapan saja']],
      ['🔔', 'Notifikasi', 'Pengingat & ringkasan', 'Pengingat deadline, jadwal, dan ringkasan harian lewat notifikasi.', ['Izinkan notifikasi', 'Atur pengingat', 'Terima tepat waktu']],
      ['📴', 'Mode Offline', 'Tanpa internet', 'Aplikasi bisa dibuka offline (PWA) dan tersinkron saat online.', ['Pasang ke layar utama', 'Buka tanpa internet', 'Data tersinkron otomatis']],
      ['🛡️', 'Aktivitas & Keamanan', 'Sesi & perangkat', 'Pantau riwayat login, sesi aktif, dan perangkat yang terhubung.', ['Buka Aktivitas', 'Cek sesi dan perangkat', 'Akhiri sesi yang tidak dikenal']],
    ],
  };
  let grp = 'penting';
  function pick(i) {
    $$('.mod').forEach((m, j) => m.setAttribute('aria-pressed', i === j));
    const m = F[grp][i];
    $('#detail').innerHTML = `<h3><span>${m[0]}</span>${m[1]}</h3><p>${m[3]}</p><ol>${m[4].map((t) => `<li>${t}</li>`).join('')}</ol>`;
  }
  function mods() {
    $('#mods').innerHTML = F[grp].map((m, i) => `<button class="mod" style="--i:${i}" data-i="${i}" aria-pressed="false"><i>${m[0]}</i><b>${m[1]}</b><span>${m[2]}</span></button>`).join('');
    $$('.mod').forEach((b) => (b.onclick = () => pick(+b.dataset.i)));
    pick(0);
  }
  mods();
  $$('.sg[data-g]').forEach((b) => (b.onclick = () => { grp = b.dataset.g; $$('.sg[data-g]').forEach((x) => x.setAttribute('aria-pressed', x === b)); mods(); }));

  /* ---------- tutorial ---------- */
  const S = [
    ['🔐', 'Pilih profil & masuk', 'Pilih Fathur atau Mazet, isi email dan password (minimal 8 karakter), lalu tekan Masuk.'],
    ['✅', 'Tambah tugas pertama', 'Buka Tugas, tekan Tugas baru, isi judul dan deadline. Centang checklist saat selesai.'],
    ['🗓️', 'Atur jadwal', 'Isi Jadwal mingguan. Otomatis tampil di Kalender bersama deadline tugas.'],
    ['⏱️', 'Mulai sesi fokus', 'Buka TimeBox, pilih tugas dan durasi, lalu mulai timer tanpa gangguan.'],
    ['📊', 'Lihat insight', 'Cek Insight untuk melihat tugas selesai dan jam fokus, lalu atur strategi minggu depan.'],
  ];
  const rowsD = (a, f) => a.map((x, i) => `<i class="r" style="top:${8 + i * (f || 30)}px;animation-delay:${i * .3}s">${x}</i>`).join('');
  const DM = (i) => [
    `<i class="r" style="top:8px;height:30px;background:color-mix(in srgb,var(--ac) 20%,transparent);border:1px solid var(--ac)"></i><i class="r" style="top:44px"><s style="width:60%"></s></i><i class="r" style="top:76px;height:26px;background:var(--ac);color:#fff;justify-content:center;font-size:10px;animation:pop .5s .9s both">Masuk ✓</i>`,
    rowsD([0, 1, 2].map((k) => `<u style="animation-delay:${.8 + k * .4}s"></u><s style="width:${70 - k * 15}%"></s>`), 32),
    rowsD(['Sen', 'Sel', 'Rab', 'Kam'].map((h, k) => `${h}<s style="width:${30 + k * 14}%;background:linear-gradient(90deg,var(--ac2),var(--ac));opacity:1;height:8px"></s>`), 25),
    `<svg viewBox="0 0 90 90" style="position:absolute;inset:0;margin:auto;width:96px;height:96px"><circle cx="45" cy="45" r="36" fill="none" stroke="var(--bd)" stroke-width="7"/><circle cx="45" cy="45" r="36" fill="none" stroke="var(--ac2)" stroke-width="7" stroke-linecap="round" stroke-dasharray="226" stroke-dashoffset="226" transform="rotate(-90 45 45)"><animate attributeName="stroke-dashoffset" from="226" to="40" dur="5s" fill="freeze"/></circle><text x="45" y="50" text-anchor="middle" fill="currentColor" font-size="15" font-weight="800">25:00</text></svg>`,
    [40, 65, 50, 85, 60, 95, 75].map((h, k) => `<i class="hb" style="left:${8 + k * 13}%;height:${h * .8}px;animation-delay:${k * .12}s"></i>`).join(''),
  ][i];
  let st = 0, play = !RM, tm;
  const D = 6000;
  $('#bars').style.setProperty('--d', D / 1000 + 's');
  $('#bars').innerHTML = S.map((_, i) => `<button class="bar" data-i="${i}" aria-label="Langkah ${i + 1}"><i></i></button>`).join('');
  function run(i) {
    st = (i + S.length) % S.length;
    const q0 = S[st];
    $('#sIcon').textContent = q0[0];
    $('#demo').innerHTML = DM(st);
    $('#sInfo').innerHTML = `<h3 style="font-size:14px;font-weight:800">${st + 1}. ${q0[1]}</h3><p style="font-size:12px;color:var(--mu);margin-top:4px">${q0[2]}</p>`;
    $$('.bar').forEach((b, j) => { b.className = 'bar' + (j < st ? ' done' : j === st && play ? ' run' : ''); void b.offsetWidth; });
    clearTimeout(tm);
    if (play && alive) tm = later(() => run(st + 1), D);
  }
  run(0);
  $('#next').onclick = () => run(st + 1);
  $('#prev').onclick = () => run(st - 1);
  $('#auto').onclick = (e) => { play = !play; e.target.textContent = play ? 'Jeda' : 'Putar'; run(st); };
  $$('.bar').forEach((b) => (b.onclick = () => run(+b.dataset.i)));
  $$('.tab').forEach((b) => (b.onclick = () => {
    $$('.tab').forEach((x) => x.setAttribute('aria-selected', x === b));
    $('#fitur').hidden = b.dataset.t !== 'fitur';
    $('#tutor').hidden = b.dataset.t !== 'tutor';
    if (b.dataset.t === 'tutor') run(st);
  }));

  /* ---------- status akun / sesi ---------- */
  const online = {};
  if (o.sessions) for (const k of ['fathur', 'mazet']) if (o.sessions[k]) online[k] = true;
  const sessionActive = { ...online };
  const todayKey = 'fz-logins-' + new Date().toDateString();
  let logins = {};
  try { logins = JSON.parse(store.get(todayKey) || '{}') || {}; } catch { logins = {}; }
  function count(id, v) {
    const el = $(id), old = +el.textContent;
    if (RM || old === v) { el.textContent = v; return; }
    let n = old; clearInterval(el._t);
    el._t = every(() => { n += n < v ? 1 : -1; el.textContent = n; if (n === v) clearInterval(el._t); }, 90);
  }
  function render() {
    count('#cA', Object.keys(online).length);
    count('#cL', Object.keys(logins).length);
    $$('.dot[data-d]').forEach((d) => d.classList.toggle('on', !!online[d.dataset.d]));
  }
  render();

  /* ---------- form login ---------- */
  const pw = $('#pw'), emLogin = $('#emLogin'), err = $('#err');
  let autoFilled = '';
  function syncEmailUi() {
    $('#clearEmail').hidden = !emLogin.value;
    const ok = validEmail(emLogin.value.trim());
    $('#emailCheck').hidden = !ok;
    $('#emailHint').textContent = ok ? 'Email valid · siap login' : (emLogin.value ? 'Masukkan email akun yang valid.' : 'Gunakan email akun workspace ini.');
    const vl = $('#verifyLink');
    if (vl) vl.setAttribute('href', '/verify-email?' + (ok ? 'email=' + encodeURIComponent(emLogin.value.trim().toLowerCase()) + '&' : '') + 'workspace=' + (who || 'fathur'));
  }
  function prefillEmail(k) {
    const saved = store.get('fz-email-' + k) || '';
    if (!emLogin.value || emLogin.value === autoFilled) { emLogin.value = saved; autoFilled = saved; }
    syncEmailUi();
  }
  function renderSessionOpen() {
    const on = !!(who && sessionActive[who]);
    $('#sessionOpen').hidden = !on;
    if (on) $('#sessionOpenT').textContent = 'Sesi ' + P[who].n + ' masih aktif di perangkat ini.';
  }
  function renderResetProfile() {
    const box = $('#resetProfile'); if (!box) return;
    box.innerHTML = 'Reset akses untuk profil:<span class="mini-pf" role="group" aria-label="Pilih profil">' +
      ['fathur', 'mazet'].map((k) => `<button type="button" data-k="${k}" aria-pressed="${who === k}">${P[k].n}</button>`).join('') + '</span>';
    box.querySelectorAll('button').forEach((b) => (b.onclick = () => selectProfile(b.dataset.k, false)));
  }
  function q(k) {
    const T = {
      fathur: ['Satu tugas kecil selesai lebih baik dari sepuluh rencana besar.', 'Tinggal satu centang lagi. Ayo!', 'Istirahat 5 menit juga bagian dari belajar.'],
      mazet: ['Kuliah terasa ringan kalau dicicil dari sekarang.', 'Satu sesi fokus 25 menit bisa mengubah harimu.', 'Jadwal rapi, tinggal dijalani pelan-pelan.'],
      x: ['Mulai dari yang paling kecil, nanti ikut lancar.', 'Pilih profil dulu, lalu mulai hari ini.'],
    }[k || 'x'];
    const e = $('#quote'); e.classList.add('x');
    later(() => { e.innerHTML = '<b>' + ({ fathur: '📘', mazet: '🎧' }[k] || '🌤️') + '</b><span>' + T[Math.floor(Math.random() * T.length)] + '</span>'; e.classList.remove('x'); }, 220);
  }
  function syncProfile(k, focus = false) {
    who = k; bodyEl.dataset.p = k;
    $('#identityHint').textContent = 'Masuk sebagai ' + P[k].n + ' · ' + (k === 'fathur' ? 'workspace belajar pribadi' : 'workspace kolaborasi');
    $$('.p').forEach((x) => { const on = x.dataset.k === k; x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; });
    $('#hi').textContent = greet() + ', ' + P[k].n;
    $('#subHi').textContent = 'Masukkan password untuk membuka workspace ' + P[k].n + '.';
    $('#lbl').textContent = 'Masuk sebagai ' + P[k].n;
    $('#emailMeta').textContent = 'Masukkan email akun';
    prefillEmail(k); renderSessionOpen(); renderResetProfile();
    $('#securityMode').textContent = authMode();
    q(k); applyTheme();
    if (focus) (emLogin.value ? pw : emLogin).focus();
  }
  function selectProfile(k, focus) {
    syncProfile(k, focus);
    if (!RM) $('.box')?.animate?.([{ transform: 'perspective(1200px) scale(.992)' }, { transform: 'perspective(1200px) scale(1)' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
    syncSceneCopy();
  }
  $$('.p').forEach((b) => {
    b.onclick = () => selectProfile(b.dataset.k, true);
    b.onkeydown = (e) => { if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); selectProfile(b.dataset.k === 'fathur' ? 'mazet' : 'fathur', true); } };
    b.addEventListener('pointermove', (ev) => { if (RM) return; const r = b.getBoundingClientRect(); const dx = (ev.clientX - r.left) / r.width - .5, dy = (ev.clientY - r.top) / r.height - .5; b.style.transform = `perspective(700px) rotateX(${dy * -4}deg) rotateY(${dx * 4}deg) translateY(-2px)`; });
    b.addEventListener('pointerleave', () => (b.style.transform = ''));
  });
  syncProfile(who || 'fathur', false);

  const shake = (el = $('#f')) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  function fail(m, verify) {
    err.textContent = m;
    if (verify) {
      const a = document.createElement('a');
      a.className = 'errlink'; a.dataset.nav = ''; a.textContent = 'Kirim ulang email verifikasi';
      a.href = '/verify-email?email=' + encodeURIComponent(emLogin.value.trim().toLowerCase()) + '&workspace=' + (who || 'fathur');
      err.append(' ', a);
    }
    err.hidden = false;
    pw.setAttribute('aria-invalid', /password/i.test(m));
    shake();
    const go = $('#go'); go.classList.remove('invalid-flash'); void go.offsetWidth; go.classList.add('invalid-flash');
  }
  const passStrength = (v) => { let s = 0; if (v.length >= 8) s++; if (/[A-Z]/.test(v)) s++; if (/[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++; return Math.min(s, 5); };
  pw.oninput = () => {
    const n = pw.value.length, score = passStrength(pw.value);
    $('#mt').style.width = Math.min(n / 8, 1) * 100 + '%';
    $('#mt').style.background = score >= 4 ? 'var(--ok)' : score >= 2 ? 'var(--wa)' : 'var(--er)';
    pw.removeAttribute('aria-invalid'); err.hidden = true;
    $('#hT').className = score >= 3 ? 'g' : '';
    $('#hT').textContent = !n ? 'Belum diisi' : score < 3 ? 'Perkuat dengan huruf besar, angka, dan simbol' : score < 5 ? 'Password cukup kuat' : 'Password kuat';
  };
  ['keydown', 'keyup'].forEach((e) => pw.addEventListener(e, (ev) => ($('#caps').hidden = !(ev.getModifierState && ev.getModifierState('CapsLock')))));
  $('#eye').onclick = (e) => { const show = pw.type === 'password'; pw.type = show ? 'text' : 'password'; e.currentTarget.setAttribute('aria-pressed', show); e.currentTarget.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password'); };
  emLogin.addEventListener('input', () => { autoFilled = ''; syncEmailUi(); });
  $('#clearEmail').onclick = () => { emLogin.value = ''; autoFilled = ''; syncEmailUi(); emLogin.focus(); };

  const view = (v) => ['vLogin', 'vForgot', 'vOk'].forEach((x) => ($('#' + x).hidden = x !== v));
  $('#toForgot').onclick = () => {
    view('vForgot');
    if (emLogin.value && !$('#em').value) $('#em').value = emLogin.value.trim();
    renderResetProfile(); $('#em').focus();
  };
  $('#back').onclick = () => { if (o.initialView === 'forgot') o.navigate('/login'); else { view('vLogin'); pw.focus(); } };

  /* pembatas percobaan di sisi klien (rate-limit sungguhan tetap di server Supabase) */
  let fails = 0, lockUntil = 0;
  const throttled = () => Date.now() < lockUntil;
  let redirectTimer = 0;

  async function submitLogin(e) {
    e.preventDefault();
    if (throttled()) return fail('Terlalu banyak percobaan. Coba lagi dalam ' + Math.ceil((lockUntil - Date.now()) / 1000) + ' detik.');
    if (!who) return fail('Pilih profil Fathur atau Mazet dulu.');
    const email = emLogin.value.trim().toLowerCase();
    if (!validEmail(email)) return fail('Masukkan email akun yang valid.');
    if (!pw.value) return fail('Isi password dulu.');
    if (pw.value.length < 8) return fail('Password minimal 8 karakter.');
    if (!navigator.onLine) return fail('Kamu sedang offline. Sambungkan internet untuk masuk.');
    if (typeof o.login !== 'function') return fail('Layanan login belum siap. Muat ulang halaman.');
    const go = $('#go'), target = who;
    go.setAttribute('aria-busy', 'true'); $('#lbl').textContent = 'Memverifikasi ' + P[target].n + '...';
    go.insertAdjacentHTML('afterbegin', '<i class="spin"></i>');
    try {
      const remember = $('#rem').checked;
      await o.login(email, pw.value, remember, target);
      if (!alive) return;
      fails = 0; online[target] = true; logins[target] = true; store.set(todayKey, JSON.stringify(logins));
      if (remember) { store.set('fz-last', target); store.set('fz-email-' + target, email); } else { store.del('fz-last'); store.del('fz-email-' + target); }
      render(); finishLogin(email, target);
    } catch (ex) {
      if (!alive) return;
      const verify = ex && ex.name === 'EmailNotVerifiedError';
      if (!verify) { fails++; if (fails >= 5) { lockUntil = Date.now() + 20000; fails = 0; return fail('Percobaan terlalu banyak. Form dikunci sementara 20 detik.'); } }
      fail(o.formatError(ex) || 'Login gagal. Periksa email dan password.', verify);
    } finally {
      if (alive) { go.removeAttribute('aria-busy'); go.querySelector('.spin')?.remove(); $('#lbl').textContent = 'Masuk sebagai ' + P[who].n; }
    }
  }
  $('#f').onsubmit = submitLogin;

  function boom(em) {
    if (RM) return;
    const c = $('#go').getBoundingClientRect(), palette = ['#6366f1', '#22d3ee', '#a855f7', '#34d399', '#f472b6', '#ffb454'];
    for (let i = 0; i < 40; i++) {
      const e = document.createElement('i'); e.className = 'conf';
      e.style.left = c.left + c.width / 2 + 'px'; e.style.top = c.top + c.height / 2 + 'px';
      if (em && i % 4 === 0) e.textContent = em[i % em.length];
      else e.style.cssText += `width:7px;height:11px;border-radius:3px;background:${palette[i % palette.length]}`;
      e.style.setProperty('--x', Math.random() * 500 - 250 + 'px'); e.style.setProperty('--y', Math.random() * -340 - 40 + 'px');
      bodyEl.appendChild(e); later(() => e.remove(), 1500);
    }
  }

  function finishLogin(email, target) {
    boom(['🎉', '✨', '📚', '⭐']);
    const p = P[target];
    $('#okAv').style.background = p.g; $('#okAv').textContent = p.i;
    $('#okH').textContent = greet() + ', ' + p.n + '!';
    $('#okS').textContent = (email ? email + ' · ' : '') + 'Login berhasil pada ' + $('#clock').textContent + ' WIB. ' + ($('#rem').checked ? 'Perangkat ini diingat.' : 'Perangkat ini tidak diingat.');
    $('#open').textContent = 'Buka workspace'; $('#open').setAttribute('href', '/');
    view('vOk'); pw.value = ''; $('#mt').style.width = '0'; $('#hT').textContent = 'Belum diisi'; $('#open').focus();
    redirectTimer = later(() => o.onSuccess(target), RM ? 600 : 1700);
  }
  $('#open').onclick = (e) => { e.preventDefault(); clearTimeout(redirectTimer); o.onSuccess(who); };
  $('#out').onclick = async () => {
    clearTimeout(redirectTimer);
    const k = who;
    try { await o.signOut(); } catch {}
    if (!alive) return;
    if (k) { delete online[k]; delete sessionActive[k]; }
    render(); toast('Sesi ' + P[k].n + ' ditutup'); view('vLogin'); renderSessionOpen(); pw.focus();
  };
  $('#sessionOpenBtn').onclick = () => { if (who) o.openWorkspace(who); };

  /* ---------- lupa password ---------- */
  $('#ff').onsubmit = async (e) => {
    e.preventDefault();
    const em = $('#em').value.trim(), fe = $('#ferr'), fo = $('#fok');
    fe.hidden = fo.hidden = true;
    if (!validEmail(em)) { fe.textContent = 'Format email belum benar. Contoh: nama@email.com'; fe.hidden = false; $('#em').classList.add('shake'); later(() => $('#em').classList.remove('shake'), 450); return; }
    if (!who) { fe.textContent = 'Pilih profil Fathur atau Mazet dulu.'; fe.hidden = false; return; }
    if (!navigator.onLine) { fe.textContent = 'Kamu sedang offline. Sambungkan internet untuk mengirim tautan.'; fe.hidden = false; return; }
    const b = $('#fgo'); b.setAttribute('aria-busy', true); b.querySelector('span').textContent = 'Mengirim tautan...';
    try {
      if (typeof o.resetPassword !== 'function') throw new Error('Layanan reset belum siap. Muat ulang halaman.');
      await o.resetPassword(em, who);
      if (!alive) return;
      fo.textContent = 'Jika email itu terdaftar di workspace ' + P[who].n + ', tautan reset sudah dikirim. Cek inbox dan spam.'; fo.hidden = false;
      $('#em').classList.add('success-flash'); later(() => $('#em').classList.remove('success-flash'), 700);
    } catch (ex) {
      if (!alive) return;
      fe.textContent = o.formatError(ex) || 'Tidak dapat memproses reset password.'; fe.hidden = false;
    } finally {
      if (alive) { b.removeAttribute('aria-busy'); b.querySelector('span').textContent = 'Kirim tautan reset'; }
    }
  };

  /* ---------- tautan internal (SPA) ---------- */
  listen(sh, 'click', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a[data-nav]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); o.navigate(a.getAttribute('href'));
  });

  /* ---------- dialog bantuan ---------- */
  const overlay = $('#overlay'), dTitle = $('#dialogTitle'), dSub = $('#dialogSub'), dBody = $('#dialogBody');
  function openDialog(title, sub, html) { dTitle.textContent = title; dSub.textContent = sub || ''; dBody.innerHTML = html; overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); $('#closeDialog').focus(); }
  function closeDialog() { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
  $('#closeDialog').onclick = closeDialog;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(); });
  $('#openShortcuts').onclick = () => openDialog('Pintasan cepat', 'Semua shortcut berjalan langsung dari halaman login.', `<div class="dgrid"><div class="ditem"><b><span class="key">Alt 1</span> Fathur</b><span>Pilih profil Fathur dan fokus ke form.</span></div><div class="ditem"><b><span class="key">Alt 2</span> Mazet</b><span>Pilih profil Mazet dan fokus ke form.</span></div><div class="ditem"><b><span class="key">Enter</span> Masuk</b><span>Kirim form ketika field siap.</span></div><div class="ditem"><b><span class="key">Esc</span> Tutup</b><span>Menutup panel bantuan yang sedang terbuka.</span></div></div>`);
  $('#openSecurity').onclick = () => openDialog('Keamanan login', 'Lapisan perlindungan yang aktif di aplikasi.', `<div class="dgrid"><div class="ditem"><b>🔐 Supabase Auth</b><span>Login memakai email dan password yang diverifikasi server. Email harus terverifikasi.</span></div><div class="ditem"><b>🗄️ Database terpisah</b><span>Fathur dan Mazet punya project database masing-masing dengan sesi terpisah.</span></div><div class="ditem"><b>🧱 Row Level Security</b><span>Akses data dibatasi per akun langsung di database.</span></div><div class="ditem"><b>⏳ Pembatas percobaan</b><span>Form dikunci sementara setelah 5 kali gagal. Batas sungguhan tetap dijaga server.</span></div></div>`);
  $('#openThemeInfo').onclick = () => openDialog('Suasana otomatis', 'Tampilan login mengikuti waktu WIB.', `<div class="dgrid"><div class="ditem"><b>🌅 06:00–10:59 · Pagi</b><span>Cerah dan hangat dengan aksen lembut.</span></div><div class="ditem"><b>☀️ 11:00–14:59 · Siang</b><span>Terang, bersih, dan ringan.</span></div><div class="ditem"><b>🌇 15:00–18:59 · Sore</b><span>Gradasi orange hangat.</span></div><div class="ditem"><b>🌙 19:00–05:59 · Malam</b><span>Gelap dengan bintang dan glow halus.</span></div></div>`);
  listen(window, 'keydown', (e) => {
    if (e.key === 'Escape') closeDialog();
    if (e.altKey && e.key === '1') { e.preventDefault(); selectProfile('fathur', true); }
    if (e.altKey && e.key === '2') { e.preventDefault(); selectProfile('mazet', true); }
  });
  $('#fillLast').onclick = () => {
    const last = store.get('fz-last');
    if (last && isP(last)) { selectProfile(last, true); toast('Profil terakhir dipilih: ' + P[last].n); } else toast('Belum ada login terakhir di perangkat ini.');
  };
  $('#focusPw').onclick = () => pw.focus();

  /* ---------- emoji melayang & paralaks ---------- */
  if (!RM) ['📚', '✏️', '⏱️', '💡', '📝', '🎯', '☕', '✨'].forEach((e, i) => {
    const f = document.createElement('span'); f.className = 'fl'; f.textContent = e; f.setAttribute('aria-hidden', 'true');
    f.style.left = 6 + i * 11 + '%'; f.style.animationDuration = 14 + i * 1.7 + 's'; f.style.animationDelay = -i * 2.5 + 's';
    $('.show').appendChild(f);
  });
  if (!RM && matchMedia('(hover:hover)').matches) listen(window, 'mousemove', (e) => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    $$('.orb').forEach((orb, i) => (orb.style.translate = `${x * (18 + i * 11)}px ${y * (18 + i * 11)}px`));
    const pn = $('.pane').getBoundingClientRect();
    $('.pane').style.setProperty('--mx', e.clientX - pn.left + 'px'); $('.pane').style.setProperty('--my', e.clientY - pn.top + 'px');
    $('.box').style.transform = `perspective(1200px) rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg)`;
  });
  let lc = 0;
  $('.brand').onclick = () => { if (++lc >= 5) { lc = 0; boom(['🎓', '💙', '💜', '🚀']); toast('FAZET · Fathur × Mazet'); } };
  q(who); every(() => q(who), 9000);

  /* ---------- panel kiri: ringkasan, scroll di mana saja ---------- */
  (function leftRail() {
    const panel = $('.show'); if (!panel) return;
    const desktop = () => matchMedia('(min-width:1101px)').matches;
    if (!panel.querySelector('.left-overview')) {
      const hero = panel.querySelector(':scope > .tabs');
      const wrap = document.createElement('div'); wrap.className = 'left-overview';
      wrap.innerHTML = `<article class="overview-card"><div class="overline">Workspace rhythm</div><h3>Kerja pelan, tapi tetap jalan.</h3><p>Semua yang penting dibuat dekat: tugas, jadwal, catatan, dan waktu fokus.</p><div class="mini-line"><span>Fokus hari ini</span><b>62%</b></div><div class="mini-progress"><i></i></div></article><article class="overview-card"><div class="overline">Sekarang</div><h3 id="leftMood">Tenang.</h3><p id="leftMoodText">Antarmuka menyesuaikan suasana waktumu.</p><div class="mini-line"><span id="leftClock">--:--</span><span>WIB</span></div></article>`;
      panel.insertBefore(wrap, hero);
      const grid = document.createElement('div'); grid.className = 'left-grid';
      grid.innerHTML = `<div class="left-item"><b>Fokus</b><span>Sesi pendek tanpa distraksi.</span></div><div class="left-item"><b>Ritme</b><span>Jadwal dan deadline lebih jelas.</span></div><div class="left-item"><b>Rapi</b><span>Catatan tersimpan teratur.</span></div>`;
      panel.insertBefore(grid, hero);
      const note = document.createElement('div'); note.className = 'reading-note';
      note.innerHTML = `<div>✦</div><div><strong>Dirancang untuk dipakai setiap hari</strong><p>Bukan untuk ramai-ramai. Cukup jelas, nyaman, dan cepat dipahami.</p></div>`;
      panel.insertBefore(note, hero);
      const clockEl = $('#leftClock'), moodEl = $('#leftMood'), moodText = $('#leftMoodText');
      const updateMood = () => {
        const h = hourWIB();
        clockEl.textContent = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).replace('.', ':');
        if (h < 11) { moodEl.textContent = 'Pelan & segar'; moodText.textContent = 'Mulai dari hal yang paling ringan.'; }
        else if (h < 15) { moodEl.textContent = 'Terang & fokus'; moodText.textContent = 'Waktu yang enak untuk menyelesaikan inti.'; }
        else if (h < 19) { moodEl.textContent = 'Hangat & santai'; moodText.textContent = 'Rapikan sisa pekerjaan sebelum malam.'; }
        else { moodEl.textContent = 'Tenang & gelap'; moodText.textContent = 'Waktunya fokus tanpa terlalu banyak suara.'; }
      };
      updateMood(); every(updateMood, 30000);
    }
    /* roda mouse di mana saja menggulung panel kiri (desktop) */
    listen(window, 'wheel', (e) => {
      if (!desktop() || overlay.classList.contains('open')) return;
      const delta = Math.abs(e.deltaY) > 0 ? e.deltaY : e.deltaX; if (delta === 0) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (path.includes(panel)) return; /* biarkan scroll native di panel */
      e.preventDefault(); panel.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
    }, { passive: false });
    listen(window, 'keydown', (e) => {
      if (!desktop() || !['PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return;
      const a = sh.activeElement;
      if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable)) return;
      e.preventDefault();
      const step = Math.max(240, panel.clientHeight * .82);
      if (e.key === 'PageDown') panel.scrollBy({ top: step, behavior: 'smooth' });
      if (e.key === 'PageUp') panel.scrollBy({ top: -step, behavior: 'smooth' });
      if (e.key === 'Home') panel.scrollTo({ top: 0, behavior: 'smooth' });
      if (e.key === 'End') panel.scrollTo({ top: panel.scrollHeight, behavior: 'smooth' });
    });
    /* penanda "masih bisa digulir" */
    const upd = () => { panel.classList.toggle('can-scroll-top', panel.scrollTop > 8); panel.classList.toggle('can-scroll-bottom', panel.scrollTop + panel.clientHeight < panel.scrollHeight - 8); };
    upd(); panel.addEventListener('scroll', upd, { passive: true }); listen(window, 'resize', upd);
  })();

  /* ---------- tampilan awal ---------- */
  if (o.initialView === 'forgot') { view('vForgot'); renderResetProfile(); }

  return {
    destroy() {
      alive = false;
      timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
      timers.clear();
      disposers.forEach((d) => d());
      if (meta && metaOrig != null) meta.content = metaOrig;
      sh.innerHTML = '';
    },
  };
}

export default mountFazetLogin;
