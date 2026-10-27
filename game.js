(() => {
  'use strict';

  const C = {
    night: '#0B1430',
    ground: '#080F28',
    asphalt: '#141B3D',
    cyan: '#2EE6FF',
    yellow: '#FFE14D',
    pink: '#FF3EA5',
    violet: '#7A3CFF',
    text: '#F2F0FF',
  };

  // ---------- Inhoud (uit content.md) ----------

  // AI-beelden per hoofdstuk (gemaakt met Weave), met een alt-tekst die beschrijft wat erop staat
  const ART = {
    photos: {
      src: 'images/pitstop-1-beeldbewerking.jpg',
      alt: 'Neonillustratie: fotokaders schuiven over een lopende band door een poort en vallen allemaal even groot in een map, zoals bij batch-verwerking.',
    },
    social: {
      src: 'images/pitstop-2-social-media.jpg',
      alt: 'Neonillustratie: een spreadsheet vult met lichtstralen automatisch een post, een story en een banner voor sociale media.',
    },
    generate: {
      src: 'images/pitstop-3-content-generatie.jpg',
      alt: 'Neonillustratie: een AI-sterretje laat nieuwe beelden en een filmstrook ontstaan, omringd door kleurrijke penseelstreken.',
    },
    code: {
      src: 'images/pitstop-4-vibe-coding.jpg',
      alt: 'Neonillustratie: een laptop met codehaakjes op het scherm, een chatballon en een websiteontwerp dat uit het scherm opstijgt.',
    },
    mail: {
      src: 'images/pitstop-5-e-mailmarketing.jpg',
      alt: 'Neonillustratie: e-mails vliegen van een inschrijfformulier naar een stapel inboxen, als een automatische mailflow.',
    },
  };

  // Beelden vooraf laden, zodat ze er meteen staan bij een pitstop
  for (const a of Object.values(ART)) new Image().src = a.src;

  const CHAPTERS = [
    {
      title: 'Beeldbewerking',
      sub: 'acties & batch',
      art: ART.photos,
      text: "Je neemt Photoshop-acties op die een reeks bewerkingen onthouden: resizen, achtergronden uitbreiden met generative fill, een logo plaatsen en exporteren. Met batch-verwerking pas je die actie in één keer toe op een volledige map productfoto's. Zo verwerk je tientallen beelden consistent, zonder ze één voor één te openen.",
    },
    {
      title: 'Social media',
      sub: 'Figma automation',
      art: ART.social,
      text: 'In Figma Buzz bouw je templates voor verschillende formaten, zoals Instagram-posts, stories en display-banners. Via bulk create vul je die templates automatisch met data uit een CSV- of XLSX-bestand: titels, taglines, call-to-actions en afbeeldingen. Eén spreadsheet levert zo een volledige campagne op in alle formaten, met een consistent design.',
    },
    {
      title: 'Content generatie',
      sub: 'Weave & Claude Cowork',
      art: ART.generate,
      text: 'Je genereert beelden en video met AI-tools zoals Weave, en leert hoe je met goede prompts een consistente stijl bewaakt. Met Claude Cowork laat je AI zelfstandig taken uitvoeren op je eigen bestanden: teksten schrijven, documenten opmaken en content plannen. Je ontdekt waar AI je werk versnelt en waar je zelf moet bijsturen.',
    },
    {
      title: 'Vibe coding',
      sub: '& web',
      art: ART.code,
      text: 'Met Claude Code bouw je websites en tools door in gewone taal te beschrijven wat je wil. Je breidt Claude uit met skills, en via de Figma MCP-koppeling laat je Claude ontwerpen genereren in Figma en designs omzetten naar HTML en CSS. Je bouwt zelfs je eigen Figma-plugin. Je websites zet je online met GitHub Pages.',
    },
    {
      title: 'E-mailmarketing',
      sub: '& newsletters',
      art: ART.mail,
      text: 'In MailerLite bouw je inschrijvingsformulieren die je op een website plaatst, ontwerp je e-mailcampagnes en zet je automatisatieflows op: een nieuwe inschrijver krijgt bijvoorbeeld automatisch een reeks welkomstmails. Zo leer je hoe merken hun publiek opbouwen en blijven bereiken.',
    },
  ];

  // ---------- Parcours ----------

  const WORLD = { w: 3400, h: 2500 };
  const ROAD = 200;
  const CURB = 14;
  // Alles wat van de route afhangt; buildTrack() vult dit opnieuw voor elke race
  let PATH, LEN, TOTAL, ROAD_PATH, GATES, FINISH, START;
  const DECOR = [], LAMPS = [];

  // Nieuwe route bij elke race: de wereld is een raster van 4 x 3 vakken en de weg
  // slingert één keer door elk vak (nooit terug naar een vak, dus de weg kruist zichzelf niet).
  // In elk vak ligt een bochtpunt op een willekeurige plek, zo verschilt elke route.
  function makeRoute() {
    const COLS = 4, ROWS = 3, M = 150;
    const cw = (WORLD.w - M * 2) / COLS, ch = (WORLD.h - M * 2) / ROWS;
    const shuffle = (a) => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const seen = new Set();
    const key = (c, r) => c + ',' + r;
    function walk(path) {
      if (path.length === COLS * ROWS) return true;
      const [c, r] = path[path.length - 1];
      for (const [dc, dr] of shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]])) {
        const nc = c + dc, nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || seen.has(key(nc, nr))) continue;
        seen.add(key(nc, nr));
        path.push([nc, nr]);
        if (walk(path)) return true;
        path.pop();
        seen.delete(key(nc, nr));
      }
      return false;
    }
    let cells;
    do {
      seen.clear();
      const start = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
      seen.add(key(...start));
      cells = [start];
    } while (!walk(cells));
    const jitter = () => (Math.random() - 0.5) * 0.36;
    return cells.map(([c, r]) => [M + (c + 0.5 + jitter()) * cw, M + (r + 0.5 + jitter()) * ch]);
  }

  function catmull(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
  }

  function pointAt(frac) {
    const target = frac * TOTAL;
    let lo = 0, hi = LEN.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (LEN[mid] < target) lo = mid + 1; else hi = mid;
    }
    const i = Math.min(Math.max(lo, 1), PATH.length - 1);
    const a = PATH[i - 1], b = PATH[i];
    return { x: b[0], y: b[1], angle: Math.atan2(b[1] - a[1], b[0] - a[0]), i };
  }

  // Jerrycans: verspreid over het parcours, afwisselend links en rechts van de middenlijn
  const CAN_COUNT = 20;
  function makeCans() {
    const cans = [];
    for (let k = 0; k < CAN_COUNT; k++) {
      const p = pointAt(0.04 + (k / CAN_COUNT) * 0.92 + 0.01);
      const side = k % 2 === 0 ? 1 : -1;
      const off = side * (30 + (k % 3) * 22);
      cans.push({
        x: p.x + Math.cos(p.angle + Math.PI / 2) * off,
        y: p.y + Math.sin(p.angle + Math.PI / 2) * off,
        taken: false,
        phase: k * 0.7,
      });
    }
    return cans;
  }

  // Decor naast de weg (vaste willekeur zodat de map altijd gelijk is)
  function rng(seed) {
    return () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  function distToRoad(x, y) {
    let best = Infinity;
    for (let i = 0; i < PATH.length; i += 2) {
      const d = (PATH[i][0] - x) ** 2 + (PATH[i][1] - y) ** 2;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }

  // Nieuwe route maken met alles erop en eraan: weg, poorten, start, finish, decor en lantaarns
  function buildTrack() {
    const control = makeRoute();
    PATH = [];
    const n = control.length, steps = 40;
    for (let i = 0; i < n - 1; i++) {
      const p0 = control[Math.max(i - 1, 0)], p1 = control[i], p2 = control[i + 1], p3 = control[Math.min(i + 2, n - 1)];
      for (let s = 0; s < steps; s++) PATH.push(catmull(p0, p1, p2, p3, s / steps));
    }
    PATH.push(control[n - 1]);

    LEN = [0];
    for (let i = 1; i < PATH.length; i++) {
      LEN.push(LEN[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]));
    }
    TOTAL = LEN[LEN.length - 1];

    ROAD_PATH = new Path2D();
    ROAD_PATH.moveTo(PATH[0][0], PATH[0][1]);
    for (let i = 1; i < PATH.length; i++) ROAD_PATH.lineTo(PATH[i][0], PATH[i][1]);

    GATES = [0.13, 0.3, 0.47, 0.64, 0.8].map(pointAt);
    FINISH = pointAt(0.985);
    START = pointAt(0.012);

    DECOR.length = 0;
    const r = rng(7);
    const kinds = ['rings', 'cone', 'tower', 'tower', 'rings', 'cone', 'palm'];
    let tries = 0;
    while (DECOR.length < 90 && tries < 4000) {
      tries++;
      const x = 80 + r() * (WORLD.w - 160), y = 80 + r() * (WORLD.h - 160);
      const d = distToRoad(x, y);
      if (d < ROAD / 2 + 70 || d > 600) continue;
      DECOR.push({
        x, y,
        kind: kinds[Math.floor(r() * kinds.length)],
        color: [C.cyan, C.pink, C.violet][Math.floor(r() * 3)],
        rot: (r() - 0.5) * 0.6,
        size: 50 + r() * 60,
      });
    }

    // Straatlantaarns langs de weg, afwisselend links en rechts
    LAMPS.length = 0;
    for (let k = 0; k < 40; k++) {
      const p = pointAt(0.02 + (k / 40) * 0.96);
      const side = k % 2 === 0 ? 1 : -1;
      const off = side * (ROAD / 2 + CURB + 34);
      LAMPS.push({ x: p.x + Math.cos(p.angle + Math.PI / 2) * off, y: p.y + Math.sin(p.angle + Math.PI / 2) * off });
    }
  }
  buildTrack();

  // Sterren op de grond: kleine lichtpuntjes in de verte
  const STARS = [];
  (() => {
    const r = rng(42);
    for (let k = 0; k < 260; k++) STARS.push({ x: r() * WORLD.w, y: r() * WORLD.h, s: 1 + r() * 2.5, a: 0.15 + r() * 0.35 });
  })();

  // ---------- DOM ----------

  const $ = (id) => document.getElementById(id);
  const canvas = $('game');
  const ctx = canvas.getContext('2d');
  const mini = $('minimap');
  const mctx = mini.getContext('2d');
  const el = {
    start: $('start'), startBtn: $('start-btn'),
    hud: $('hud'), cans: $('hud-cans'), cansBox: $('hud-cans-box'), cps: $('hud-cps'), hint: $('hud-hint'),
    banner: $('banner'), keysHint: $('keys-hint'),
    side: $('side'), sideBody: $('side-body'), psCount: $('ps-count'), psCans: $('ps-cans'), psArt: $('ps-art'),
    psTitle: $('ps-title'), psSub: $('ps-sub'), psText: $('ps-text'),
    pit: $('pit'), pitCount: $('pit-count'), pitFill: $('pit-fill'), pitBar: $('pit-bar'),
    finish: $('finish'), finCans: $('fin-cans'), finTime: $('fin-time'), finBtn: $('fin-btn'),
  };

  const touchUI = window.matchMedia('(pointer: coarse), (max-width: 900px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 900px)');

  // ---------- Toestand ----------

  let state = 'start';
  let car, cam, cans, done, nextGate, raceTime, bannerTimer, lastWarn;
  let trail = [], sparks = [], rings = [];
  const keys = { up: false, down: false, left: false, right: false };
  const PIT_TIME = 8; // seconden dat de auto stilstaat zodat je het hoofdstuk kan lezen

  function reset() {
    car = { x: START.x, y: START.y, angle: START.angle, speed: 0, near: START.i, pit: 0 };
    cam = { x: car.x, y: car.y };
    cans = makeCans();
    done = [false, false, false, false, false];
    nextGate = 0;
    raceTime = 0;
    lastWarn = -10;
    trail = [];
    sparks = [];
    rings = [];
    for (const k in keys) keys[k] = false;
  }

  // ---------- Invoer ----------

  // Op de letter die je ziet, zodat ZQSD (azerty) en WASD (qwerty) allebei werken
  const KEYMAP = {
    arrowup: 'up', z: 'up', w: 'up', arrowdown: 'down', s: 'down',
    arrowleft: 'left', q: 'left', a: 'left', arrowright: 'right', d: 'right',
  };
  const keyFor = (e) => KEYMAP[(e.key || '').toLowerCase()];

  window.addEventListener('keydown', (e) => {
    if (state === 'start' && (e.key === 'Enter' || e.key === ' ') && e.target === document.body) {
      e.preventDefault();
      startRace();
      return;
    }
    // In het zijpaneel scrollen de pijltjes de tekst, elders sturen ze de auto
    if (e.target instanceof Node && el.side.contains(e.target)) return;
    const k = keyFor(e);
    if (k && state === 'race') {
      keys[k] = true;
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    const k = keyFor(e);
    if (k) keys[k] = false;
  });

  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
    pointer.active = false;
  });

  // De auto volgt de muis (of je vinger op gsm)
  const pointer = { active: false, x: 0, y: 0 };

  canvas.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    // Muis en pen: volgen zonder klikken. Touch: enkel zolang je vinger op het scherm ligt.
    if (e.pointerType !== 'touch') pointer.active = true;
  });
  canvas.addEventListener('pointerdown', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    try { canvas.setPointerCapture(e.pointerId); } catch { /* geen actieve pointer */ }
  });
  canvas.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') pointer.active = false; });
  const release = (e) => { if (e.pointerType === 'touch') pointer.active = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  // Bewegende achtergrond van het startscherm pauzeren of hervatten
  const motionBtn = $('motion-btn');
  motionBtn.addEventListener('click', () => {
    const paused = el.start.classList.toggle('paused');
    motionBtn.setAttribute('aria-pressed', String(paused));
    motionBtn.textContent = paused ? 'Achtergrond hervatten' : 'Achtergrond pauzeren';
  });

  el.startBtn.addEventListener('click', startRace);
  // Opnieuw racen = nieuwe route
  el.finBtn.addEventListener('click', () => { el.finish.hidden = true; buildTrack(); startRace(); });

  // ---------- Schermen ----------

  function startRace() {
    reset();
    state = 'race';
    el.start.hidden = true;
    el.hud.hidden = false;
    canvas.inert = false;
    el.pit.hidden = true;
    el.side.classList.remove('reading');
    showSide(-1);
    updateHud();
    showBanner('Go!', 1100);
    // Focus naar het spel, zodat de pijltjestoetsen meteen werken
    canvas.focus({ preventScroll: true });
  }

  function showBanner(text, ms) {
    el.banner.textContent = text;
    el.banner.classList.remove('show');
    void el.banner.offsetWidth; // animatie opnieuw starten
    el.banner.classList.add('show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { el.banner.classList.remove('show'); }, ms);
  }

  // Pitstop gehaald: de auto tankt even bij en staat stil, zodat je het hoofdstuk in het zijpaneel leest
  function reachPitstop(i) {
    done[i] = true;
    // Volgende = eerste pitstop die je nog niet hebt (je mag ze in elke volgorde nemen)
    nextGate = done.indexOf(false);
    if (nextGate < 0) nextGate = 5;
    showSide(i);
    showBanner('Pitstop!', 1200);
    el.side.classList.remove('flash');
    void el.side.offsetWidth;
    el.side.classList.add('flash', 'reading');
    car.pit = PIT_TIME;
    car.speed = 0;
    trail = [];
    el.pit.hidden = false;
    updatePit();
    el.hint.textContent = `Je auto tankt bij. Lees ondertussen het hoofdstuk ${touchUI.matches ? 'hieronder' : 'rechts'}.`;
    updateHud(false);
  }

  function updatePit() {
    const pct = Math.round((1 - car.pit / PIT_TIME) * 100);
    el.pitCount.textContent = Math.ceil(car.pit);
    el.pitFill.style.width = `${pct}%`;
    el.pitBar.setAttribute('aria-valuenow', pct);
  }

  function endPit() {
    car.pit = 0;
    el.pit.hidden = true;
    el.side.classList.remove('reading');
    showBanner('Go!', 900);
    updateHud();
  }

  function showSide(i) {
    if (i < 0) {
      el.psCount.textContent = 'Pitstop 0/5';
      el.psArt.innerHTML = '';
      el.psTitle.textContent = 'Klaar voor de start';
      el.psSub.textContent = '';
      el.psText.textContent = `Rij door de blauwe neonpoorten. Bij elke pitstop verschijnt hier een hoofdstuk van het vak. De eerste is ${CHAPTERS[0].title}.`;
      return;
    }
    const ch = CHAPTERS[i];
    el.psCount.textContent = `Pitstop ${i + 1}/5`;
    el.psArt.innerHTML = '';
    const img = new Image(960, 536);
    img.src = ch.art.src;
    img.alt = ch.art.alt;
    img.decoding = 'async';
    el.psArt.append(img);
    el.psTitle.textContent = ch.title;
    el.psSub.textContent = ch.sub;
    el.psText.textContent = ch.text;
    el.sideBody.scrollTop = 0;
    // Overgang: neonscan over het paneel, de inhoud licht op
    el.sideBody.classList.remove('enter');
    void el.sideBody.offsetWidth;
    el.sideBody.classList.add('enter');
  }

  function openFinish() {
    state = 'finish';
    for (const k in keys) keys[k] = false;
    pointer.active = false;
    el.hud.hidden = true;
    canvas.inert = true; // achter het finishscherm kan je niet meer focussen
    el.banner.classList.remove('show');
    el.finCans.textContent = canText();
    el.finTime.textContent = `Tijd ${formatTime(raceTime)}`;
    el.finish.hidden = false;
    el.finBtn.focus();
  }

  function canText() {
    const n = cans.filter((c) => c.taken).length;
    return `${String(n).padStart(2, '0')}/${CAN_COUNT}`;
  }

  function cpsHtml() {
    return done.map((d, i) => `<span class="cp${d ? ' done' : i === nextGate ? ' next' : ''}"></span>`).join('');
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  function updateHud(withHint = true) {
    el.cans.textContent = canText();
    el.psCans.textContent = canText();
    el.cps.innerHTML = cpsHtml();
    el.cps.setAttribute('aria-label', `${done.filter(Boolean).length} van 5 pitstops gehaald`);
    if (!withHint) return;
    const skipped = done.some((d, i) => d && i > nextGate);
    if (nextGate < 5 && skipped) {
      el.hint.textContent = `Je mist nog pitstop ${nextGate + 1}, ${CHAPTERS[nextGate].title}. Rij terug door die blauwe poort.`;
    } else if (nextGate < 5) {
      el.hint.textContent = `Rij door de blauwe poort: pitstop ${nextGate + 1}, ${CHAPTERS[nextGate].title}`;
    } else {
      el.hint.textContent = 'Alle pitstops gehaald. Rij naar de finish!';
    }
  }

  // ---------- Effecten ----------

  // Vonken en een lichtring als je een jerrycan pakt
  function burst(x, y) {
    rings.push({ x, y, age: 0 });
    if (reduceMotion.matches) return;
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2 + Math.random() * 0.3;
      const v = 160 + Math.random() * 260;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.45 + Math.random() * 0.3, age: 0 });
    }
    el.cansBox.classList.remove('bump');
    void el.cansBox.offsetWidth;
    el.cansBox.classList.add('bump');
  }

  function updateEffects(dt) {
    for (const s of sparks) {
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 1 - 3 * dt;
      s.vy *= 1 - 3 * dt;
    }
    sparks = sparks.filter((s) => s.age < s.life);
    for (const r of rings) r.age += dt;
    rings = rings.filter((r) => r.age < 0.5);

    // Lichtspoor: de achterlichten laten een roze streep na
    for (const p of trail) p.age += dt;
    trail = trail.filter((p) => p.age < 0.55);
    if (!reduceMotion.matches && Math.abs(car.speed) > 60) {
      const back = -40, side = 14;
      const cos = Math.cos(car.angle), sin = Math.sin(car.angle);
      trail.push({
        lx: car.x + cos * back - sin * -side, ly: car.y + sin * back + cos * -side,
        rx: car.x + cos * back - sin * side, ry: car.y + sin * back + cos * side,
        age: 0,
      });
    }
  }

  // ---------- Spellogica ----------

  const MAX_ROAD = 540, MAX_OFF = 220, ACCEL = 600, BRAKE = 1000, REVERSE = 200, ROLL = 260, TURN = 2.9;

  function nearestOnRoad() {
    // Zoek rond het vorige dichtste punt, dat is snel en volgt de auto mee
    let best = Infinity, bi = car.near;
    const from = Math.max(0, car.near - 60), to = Math.min(PATH.length - 1, car.near + 60);
    for (let i = from; i <= to; i++) {
      const d = (PATH[i][0] - car.x) ** 2 + (PATH[i][1] - car.y) ** 2;
      if (d < best) { best = d; bi = i; }
    }
    // Ver van de weg (afgesneden?): volledige zoektocht
    if (best > (ROAD * 2) ** 2) {
      for (let i = 0; i < PATH.length; i++) {
        const d = (PATH[i][0] - car.x) ** 2 + (PATH[i][1] - car.y) ** 2;
        if (d < best) { best = d; bi = i; }
      }
    }
    car.near = bi;
    return Math.sqrt(best);
  }

  function update(dt) {
    updateEffects(dt);

    // Tijdens een pitstop staat de auto stil en telt de racetijd niet mee
    if (car.pit > 0) {
      car.pit -= dt;
      car.speed = 0;
      if (car.pit <= 0) endPit(); else updatePit();
      followCamera(dt);
      return;
    }

    raceTime += dt;
    const onRoad = nearestOnRoad() <= ROAD / 2 + 6;
    const max = onRoad ? MAX_ROAD : MAX_OFF;

    const usingKeys = keys.up || keys.down || keys.left || keys.right;

    if (pointer.active && !usingKeys) {
      // Muisbesturing: draai naar de muis, rij sneller naarmate de muis verder weg is
      const wx = cam.x + (pointer.x - view.cx) / zoom;
      const wy = cam.y + (pointer.y - view.cy) / zoom;
      const dist = Math.hypot(wx - car.x, wy - car.y);
      let diff = Math.atan2(wy - car.y, wx - car.x) - car.angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const turnRate = TURN * Math.max(0.5, Math.min(1, Math.abs(car.speed) / 220));
      car.angle += Math.max(-turnRate * dt, Math.min(turnRate * dt, diff));
      // Afstand in schermpixels, zodat het op een klein gsm-scherm even vlot rijdt
      const screenDist = dist * zoom;
      let target = Math.max(0, Math.min(1, (screenDist - 40) / 170)) * max;
      if (Math.abs(diff) > 1.4) target *= 0.35;
      if (car.speed < target) car.speed = Math.min(target, car.speed + ACCEL * dt);
      else car.speed = Math.max(target, car.speed - BRAKE * dt);
    } else {
      if (keys.up) car.speed += ACCEL * dt;
      else if (keys.down) car.speed -= (car.speed > 0 ? BRAKE : ACCEL * 0.6) * dt;
      else car.speed -= Math.sign(car.speed) * Math.min(Math.abs(car.speed), ROLL * dt);

      const steer = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      const grip = Math.max(-1, Math.min(1, car.speed / 220));
      car.angle += steer * TURN * dt * grip;
    }

    if (car.speed > max) car.speed = Math.max(max, car.speed - 900 * dt);
    if (car.speed < -REVERSE) car.speed = -REVERSE;

    car.x += Math.cos(car.angle) * car.speed * dt;
    car.y += Math.sin(car.angle) * car.speed * dt;

    // Binnen de wereld blijven
    const m = 40;
    if (car.x < m || car.x > WORLD.w - m || car.y < m || car.y > WORLD.h - m) {
      car.x = Math.min(WORLD.w - m, Math.max(m, car.x));
      car.y = Math.min(WORLD.h - m, Math.max(m, car.y));
      car.speed *= 0.3;
    }

    // Jerrycans
    let picked = false;
    for (const c of cans) {
      if (!c.taken && Math.hypot(c.x - car.x, c.y - car.y) < 40) {
        c.taken = true;
        picked = true;
        burst(c.x, c.y);
      }
    }
    if (picked) updateHud();

    // Pitstops en finish: tellen zodra je er langs de weg voorbij rijdt, ook als je op de rand rijdt
    // Royaal: ook wie een bocht afsnijdt over het gras, krijgt de pitstop
    const prevNear = car.near;
    const nearRoad = nearestOnRoad() <= ROAD / 2 + 300;
    const step = car.near - prevNear;
    const passed = (idx) => nearRoad && (
      (step > 0 && step < 120 && prevNear < idx && car.near >= idx) || Math.abs(car.near - idx) <= 2
    );
    const close = (p) => Math.hypot(p.x - car.x, p.y - car.y) < ROAD / 2 + 70;
    GATES.forEach((g, i) => { if (!done[i] && (passed(g.i) || close(g))) reachPitstop(i); });

    if (passed(FINISH.i) || (nearRoad && car.near > FINISH.i)) {
      const missing = done.map((d, i) => (d ? null : i + 1)).filter(Boolean);
      if (missing.length === 0) {
        openFinish();
        return;
      }
      if (raceTime - lastWarn > 3) {
        lastWarn = raceTime;
        showBanner(missing.length === 1 ? 'Nog 1 pitstop' : `Nog ${missing.length} pitstops`, 1600);
      }
    }

    followCamera(dt);
  }

  // Camera volgt de auto, iets vooruit in de rijrichting
  function followCamera(dt) {
    const look = 0.35;
    const tx = car.x + Math.cos(car.angle) * car.speed * look;
    const ty = car.y + Math.sin(car.angle) * car.speed * look;
    const ease = 1 - Math.pow(0.0015, dt);
    cam.x += (tx - cam.x) * ease;
    cam.y += (ty - cam.y) * ease;
  }

  // ---------- Tekenen ----------

  let vw = 0, vh = 0, dpr = 1, zoom = 1;
  const view = { cx: 0, cy: 0 };
  const bounds = { l: 0, t: 0, r: 0, b: 0 };

  // Positie van het zijpaneel, enkel opnieuw gemeten als het van grootte verandert (niet elke frame)
  let sideRect = null;
  new ResizeObserver(() => { sideRect = el.side.getBoundingClientRect(); }).observe(el.side);

  // Het midden van het vrije speelveld, naast (desktop) of boven (gsm) het zijpaneel
  function updateView() {
    view.cx = vw / 2;
    view.cy = vh / 2;
    if (el.hud.hidden || !sideRect) return;
    if (sideRect.top > vh * 0.4) view.cy = sideRect.top / 2;
    else view.cx = sideRect.left / 2;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    zoom = Math.max(0.55, Math.min(1, Math.min(vw, vh * 1.4) / 1100));
    sideRect = el.side.getBoundingClientRect();
  }
  window.addEventListener('resize', resize);

  // Enkel tekenen wat in beeld is
  const inView = (x, y, m) => x > bounds.l - m && x < bounds.r + m && y > bounds.t - m && y < bounds.b + m;

  function drawGround() {
    ctx.fillStyle = C.ground;
    ctx.fillRect(-WORLD.w, -WORLD.h, WORLD.w * 3, WORLD.h * 3);
    for (const s of STARS) {
      if (!inView(s.x, s.y, 4)) continue;
      ctx.fillStyle = `rgba(180,188,224,${s.a})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    // Rand van de wereld: een violette neonlijn
    ctx.strokeStyle = 'rgba(122,60,255,0.6)';
    ctx.lineWidth = 4;
    ctx.setLineDash([24, 16]);
    ctx.strokeRect(0, 0, WORLD.w, WORLD.h);
    ctx.setLineDash([]);
  }

  // Weg met neonbuizen langs beide kanten
  function drawRoad() {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round'; // afgeronde uiteinden aan het begin en einde van de weg
    const edge = ROAD + CURB * 2;
    ctx.strokeStyle = 'rgba(255,62,165,0.07)';
    ctx.lineWidth = edge + 70;
    ctx.stroke(ROAD_PATH);
    ctx.strokeStyle = 'rgba(255,62,165,0.16)';
    ctx.lineWidth = edge + 30;
    ctx.stroke(ROAD_PATH);
    ctx.strokeStyle = C.pink;
    ctx.lineWidth = edge;
    ctx.stroke(ROAD_PATH);
    ctx.strokeStyle = '#FFC2E2';
    ctx.lineWidth = edge - 8;
    ctx.stroke(ROAD_PATH);
    ctx.strokeStyle = C.pink;
    ctx.lineWidth = edge - 14;
    ctx.stroke(ROAD_PATH);
    ctx.strokeStyle = C.asphalt;
    ctx.lineWidth = ROAD;
    ctx.stroke(ROAD_PATH);
    // Middenlijn in cyaan
    ctx.lineCap = 'butt';
    ctx.setLineDash([30, 24]);
    ctx.strokeStyle = 'rgba(46,230,255,0.22)';
    ctx.lineWidth = 12;
    ctx.stroke(ROAD_PATH);
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 3;
    ctx.stroke(ROAD_PATH);
    ctx.setLineDash([]);
  }

  // Lichtcirkels van de straatlantaarns (na de weg, zodat ze over het asfalt vallen)
  function drawLamps() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const l of LAMPS) {
      if (!inView(l.x, l.y, 160)) continue;
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 150);
      g.addColorStop(0, 'rgba(255,225,77,0.2)');
      g.addColorStop(1, 'rgba(255,225,77,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 150, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    for (const l of LAMPS) {
      if (!inView(l.x, l.y, 20)) continue;
      ctx.fillStyle = '#1E2654';
      ctx.beginPath(); ctx.arc(l.x, l.y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFF4B8';
      ctx.beginPath(); ctx.arc(l.x, l.y, 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawChecker(p, label) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle + Math.PI / 2);
    const sq = 20, w = ROAD + CURB * 2;
    for (let r = 0; r < 2; r++) {
      for (let k = 0; k * sq < w; k++) {
        ctx.fillStyle = (k + r) % 2 ? C.asphalt : C.text;
        ctx.fillRect(-w / 2 + k * sq, -sq + r * sq, sq, sq);
      }
    }
    ctx.restore();
    if (label) uprightLabel(label, p.x, p.y - 48, 26, C.text, C.cyan);
  }

  // Tekst altijd rechtop, hoe de weg ook draait (anders staat ze soms op haar kop)
  function uprightLabel(text, x, y, size, color, glow) {
    ctx.save();
    ctx.font = `${size}px "Tilt Neon", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = glow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // Poort als neonboog: cyaan pulseert (nog te doen), geel brandt rustig (gehaald)
  function drawGate(g, i, t) {
    const isDone = done[i];
    const col = isDone ? C.yellow : C.cyan;
    const rgb = isDone ? '255,225,77' : '46,230,255';
    const pulse = isDone || reduceMotion.matches ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4 + i);
    const half = ROAD / 2 + 22;
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle + Math.PI / 2);
    // Lichtband over de weg
    ctx.fillStyle = `rgba(${rgb},${0.06 + pulse * 0.08})`;
    ctx.fillRect(-half, -40, half * 2, 52);
    // Gloeiende balk
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(${rgb},${0.12 + pulse * 0.14})`;
    ctx.lineWidth = 30 + pulse * 10;
    ctx.beginPath(); ctx.moveTo(-half, -14); ctx.lineTo(half, -14); ctx.stroke();
    ctx.strokeStyle = `rgba(${rgb},0.45)`;
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    ctx.stroke();
    // Palen
    for (const x of [-half, half]) {
      ctx.fillStyle = `rgba(${rgb},0.3)`;
      ctx.beginPath(); ctx.arc(x, -14, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, -14, 10, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    uprightLabel(isDone ? `Pitstop ${i + 1} ok` : `Pitstop ${i + 1}`, g.x, g.y - 70, 24, isDone ? C.yellow : '#E6FCFF', col);
  }

  function drawCan(c, t) {
    const bob = reduceMotion.matches ? 0 : Math.sin(t * 3 + c.phase) * 3;
    ctx.save();
    ctx.translate(c.x, c.y + bob);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 38);
    g.addColorStop(0, 'rgba(255,225,77,0.35)');
    g.addColorStop(1, 'rgba(255,225,77,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(Math.sin(c.phase) * 0.3);
    ctx.fillStyle = C.yellow;
    ctx.fillRect(-5, -22, 12, 6);
    ctx.fillStyle = 'rgba(255,225,77,0.22)';
    ctx.strokeStyle = C.yellow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-13, -16, 26, 32, 4);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, -6); ctx.lineTo(6, 6);
    ctx.moveTo(6, -6); ctx.lineTo(-6, 6);
    ctx.stroke();
    ctx.restore();
  }

  function drawDecor(d) {
    if (!inView(d.x, d.y, 120)) return;
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);
    ctx.lineWidth = 3;
    if (d.kind === 'rings') {
      ctx.strokeStyle = 'rgba(46,230,255,0.75)';
      for (const [ox, oy] of [[0, 0], [30, 10], [14, -24]]) {
        ctx.beginPath(); ctx.arc(ox, oy, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox, oy, 6, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (d.kind === 'cone') {
      ctx.strokeStyle = C.yellow;
      ctx.fillStyle = 'rgba(255,225,77,0.15)';
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(16, 14); ctx.lineTo(-16, 14); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (d.kind === 'palm') {
      // Synthwave-palmboom van bovenaf: bladeren als neonlijnen
      ctx.strokeStyle = C.cyan;
      ctx.lineCap = 'round';
      const r = d.size * 0.55;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(Math.cos(a + 0.4) * r * 0.6, Math.sin(a + 0.4) * r * 0.6, Math.cos(a) * r, Math.sin(a) * r);
        ctx.stroke();
      }
      ctx.fillStyle = C.pink;
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      // Gebouw: donker blok met neonrand en verlichte ramen
      const w = d.size, h = d.size / 1.5;
      ctx.fillStyle = '#121A3E';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = d.color;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = 'rgba(255,225,77,0.55)';
      for (let x = -w / 2 + 10; x < w / 2 - 8; x += 16) {
        for (let y = -h / 2 + 10; y < h / 2 - 8; y += 16) {
          if ((x * 7 + y * 13 + d.size) % 3 < 1.2) ctx.fillRect(x, y, 6, 6);
        }
      }
    }
    ctx.restore();
  }

  // Lichtspoor achter de auto, vervaagt met de tijd
  function drawTrail() {
    if (trail.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const side of ['l', 'r']) {
      for (let k = 1; k < trail.length; k++) {
        const a = trail[k - 1], b = trail[k];
        const life = 1 - b.age / 0.55;
        ctx.strokeStyle = `rgba(255,62,165,${life * 0.35})`;
        ctx.lineWidth = 16 * life + 2;
        ctx.beginPath();
        ctx.moveTo(a[side + 'x'], a[side + 'y']);
        ctx.lineTo(b[side + 'x'], b[side + 'y']);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,200,230,${life * 0.8})`;
        ctx.lineWidth = 3 * life + 1;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawEffects() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const r of rings) {
      const k = r.age / 0.5;
      ctx.strokeStyle = `rgba(255,225,77,${1 - k})`;
      ctx.lineWidth = 6 * (1 - k) + 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, reduceMotion.matches ? 40 : 20 + k * 70, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineCap = 'round';
    for (const s of sparks) {
      const k = 1 - s.age / s.life;
      ctx.strokeStyle = `rgba(255,${200 + Math.round(55 * k)},${120 + Math.round(100 * k)},${k})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCar() {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle + Math.PI / 2);
    // Koplampen: lichtkegel voor de auto
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const beam = ctx.createLinearGradient(0, -44, 0, -300);
    beam.addColorStop(0, 'rgba(255,244,200,0.3)');
    beam.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-14, -44); ctx.lineTo(-90, -300); ctx.lineTo(90, -300); ctx.lineTo(14, -44);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Wielen
    ctx.fillStyle = '#05081A';
    for (const [x, y] of [[-26, -34], [16, -34], [-26, 16], [16, 16]]) ctx.fillRect(x, y, 10, 18);
    // Carrosserie met roze neonrand
    ctx.shadowColor = C.pink;
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#2A1250';
    ctx.strokeStyle = C.pink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-20, -44, 40, 88, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    // Voorruit
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-13, -30, 26, 11, 3);
    ctx.stroke();
    // Racer met helm
    ctx.fillStyle = C.yellow;
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#05081A';
    ctx.fillRect(-6, -4, 12, 4);
    // Koplampen en achterlichten
    ctx.fillStyle = '#FFF4B8';
    ctx.fillRect(-15, -45, 8, 4);
    ctx.fillRect(7, -45, 8, 4);
    ctx.fillStyle = C.pink;
    ctx.fillRect(-18, 40, 10, 4);
    ctx.fillRect(8, 40, 10, 4);
    ctx.restore();
  }

  // Doelwit waar de muis staat: daar rijdt de auto naartoe
  function drawTarget(t) {
    const x = cam.x + (pointer.x - view.cx) / zoom;
    const y = cam.y + (pointer.y - view.cy) / zoom;
    const r = 16 + (reduceMotion.matches ? 0 : Math.sin(t * 6) * 2);
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(46,230,255,0.3)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r - 8, 0); ctx.lineTo(-r + 6, 0);
    ctx.moveTo(r - 6, 0); ctx.lineTo(r + 8, 0);
    ctx.moveTo(0, -r - 8); ctx.lineTo(0, -r + 6);
    ctx.moveTo(0, r - 6); ctx.lineTo(0, r + 8);
    ctx.stroke();
    ctx.restore();
  }

  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * (view.cx - cam.x * zoom), dpr * (view.cy - cam.y * zoom));
    bounds.l = cam.x - view.cx / zoom;
    bounds.t = cam.y - view.cy / zoom;
    bounds.r = bounds.l + vw / zoom;
    bounds.b = bounds.t + vh / zoom;
    drawGround();
    for (const d of DECOR) drawDecor(d);
    drawRoad();
    drawLamps();
    drawChecker(START, 'Start');
    drawChecker(FINISH, 'Finish');
    GATES.forEach((g, i) => drawGate(g, i, t));
    for (const c of cans) if (!c.taken && inView(c.x, c.y, 40)) drawCan(c, t);
    drawTrail();
    drawCar();
    drawEffects();
    if (state === 'race' && pointer.active) drawTarget(t);
    drawVignette();
    drawMinimap();
  }

  // Donkere randen rond het beeld, zodat het midden oplicht
  function drawVignette() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createRadialGradient(view.cx, view.cy, Math.min(vw, vh) * 0.3, view.cx, view.cy, Math.max(vw, vh) * 0.8);
    g.addColorStop(0, 'rgba(5,8,26,0)');
    g.addColorStop(1, 'rgba(5,8,26,0.65)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);
  }

  // Minimap: het hele parcours in klein
  const mm = (() => {
    const pad = 14;
    const s = Math.min((mini.width - pad * 2) / WORLD.w, (mini.height - pad * 2) / WORLD.h);
    return { s, ox: (mini.width - WORLD.w * s) / 2, oy: (mini.height - WORLD.h * s) / 2 };
  })();

  function drawMinimap() {
    if (el.hud.hidden || narrow.matches) return; // op gsm is de minimap verborgen
    mctx.clearRect(0, 0, mini.width, mini.height);
    mctx.save();
    mctx.translate(mm.ox, mm.oy);
    mctx.scale(mm.s, mm.s);
    mctx.lineJoin = 'round';
    mctx.lineCap = 'round';
    mctx.strokeStyle = 'rgba(255,62,165,0.35)';
    mctx.lineWidth = 12 / mm.s;
    mctx.stroke(ROAD_PATH);
    mctx.strokeStyle = C.pink;
    mctx.lineWidth = 3 / mm.s;
    mctx.stroke(ROAD_PATH);
    GATES.forEach((g, i) => {
      mctx.fillStyle = done[i] ? C.yellow : C.cyan;
      mctx.beginPath();
      mctx.arc(g.x, g.y, 5 / mm.s, 0, Math.PI * 2);
      mctx.fill();
    });
    mctx.fillStyle = 'rgba(255,255,255,0.35)';
    mctx.beginPath();
    mctx.arc(car.x, car.y, 11 / mm.s, 0, Math.PI * 2);
    mctx.fill();
    mctx.fillStyle = '#FFFFFF';
    mctx.beginPath();
    mctx.arc(car.x, car.y, 5 / mm.s, 0, Math.PI * 2);
    mctx.fill();
    mctx.restore();
  }

  // ---------- Lus ----------

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    updateView();
    if (state === 'race') update(dt);
    draw(now / 1000);
    requestAnimationFrame(frame);
  }

  // Testhaak voor de Playwright-tests: enkel actief met ?test in de URL
  if (new URLSearchParams(location.search).has('test')) {
    window.__race = {
      get car() { return car; }, get cans() { return cans; }, get done() { return done; },
      get state() { return state; }, get gates() { return GATES; }, get finish() { return FINISH; },
      get trail() { return trail.length; }, get sparks() { return sparks.length; },
    };
  }

  if (touchUI.matches) el.keysHint.textContent = 'Houd je vinger op het scherm: de auto rijdt ernaartoe.';
  reset();
  resize();
  // Wacht tot het neon-lettertype geladen is, zodat de canvas-tekst klopt
  (document.fonts ? document.fonts.load('24px "Tilt Neon"') : Promise.resolve()).finally(() => {
    requestAnimationFrame(frame);
  });
})();
