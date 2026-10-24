// Pixel scenes. A small canvas (200 x 72) drawn in code and scaled up with crisp pixels.
// All art here is original and procedural: no sprites or images from anywhere else.
// The scenario decides WHICH scene a moment gets (scenario.scene); this file only draws.
// Drawing conventions: every kind of home is drawn with the same care; no medical
// detail, no ambulances, no logos or signage text; heavy moments get quiet scenes.
window.Scenes = (() => {
  const W = 200, H = 72;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- helpers
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const P = (g, x, y, c) => R(g, x, y, 1, 1, c);
  function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function sprite(g, rows, x, y, pal) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const c = pal[rows[j][i]];
      if (c) P(g, x + i, y + j, c);
    }
  }

  // ---------------------------------------------------------------- people
  // H hair, S skin, E eyes, T top, P trousers or skirt, K shoes, A apron or uniform detail.
  const FIG = {
    man: ['...HHH...', '..HHHHH..', '..HSSSH..', '..SESES..', '..SSSSS..', '...SSS...', '..TTTTT..', '.TTTTTTT.', '.TTTTTTT.', '.TTTTTTT.', '.TTTTTTT.', '.STTTTTS.', '..PPPPP..', '..PPPPP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..KK.KK..', '.KKK.KKK.'],
    woman: ['...HHH...', '..HHHHH..', '.HHSSSHH.', '.HSESESH.', '.HSSSSSH.', '..HSSSH..', '..TTTTT..', '.TTTTTTT.', '.TTTTTTT.', '.TTTTTTT.', '.TTTTTTT.', '.STTTTTS.', '..TTTTT..', '..PPPPP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..KK.KK..', '.KKK.KKK.'],
    carer: ['...HHH...', '..HHHHH..', '.HHSSSHH.', '.HSESESH.', '..SSSSS..', '...SSS...', '..TAAAT..', '.TTTATTT.', '.TTTATTT.', '.TTTTTTT.', '.TTTTTTT.', '.STTTTTS.', '..TTTTT..', '..PPPPP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..KK.KK..', '.KKK.KKK.'],
    helper: ['...HHH...', '..HHHHH..', '.HHSSSHH.', '.HSESESH.', '.HSSSSSH.', '...SSS...', '..TTTTT..', '.TAAAAAT.', '.TAAAAAT.', '.TAAAAAT.', '.TAAAAAT.', '.SAAAAAS.', '..AAAAA..', '..PPPPP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..PP.PP..', '..KK.KK..', '.KKK.KKK.'],
    child: ['..HHH..', '.HHHHH.', '.SESES.', '.SSSSS.', '..SSS..', '.TTTTT.', 'TTTTTTT', 'STTTTTS', '.TTTTT.', '.PP.PP.', '.PP.PP.', '.PP.PP.', '.KK.KK.'],
  };
  const SKIN = ['#f1cba8', '#e6b48d', '#cf9670', '#a8704c', '#7a4e33'];
  const TOPS = ['#5f7fa3', '#9b5a4a', '#5f8a6a', '#b48a3c', '#7b6a9b', '#4f7b80', '#a8687d', '#6d7480'];
  const PANTS = ['#3d4250', '#5a4b3e', '#46505c', '#6b5e52'];

  function person(g, p, x, y, frame) {
    const r = rnd(hash(p.id || p.role));
    const kind = p.role === 'carer' ? 'carer' : p.role === 'helper' ? 'helper' : p.role === 'child' ? 'child' : p.sex === 'F' ? 'woman' : 'man';
    const rows = FIG[kind];
    const pal = {
      H: p.hair || (p.role === 'elder' || p.role === 'spouse' ? ['#d9d6cf', '#bdb9b1', '#e9e7e2'][Math.floor(r() * 3)] : ['#2b2523', '#3b2f2a', '#1f1c1b'][Math.floor(r() * 3)]),
      S: p.skin || SKIN[Math.floor(r() * 2)],
      E: '#2a2420',
      T: p.top || (kind === 'carer' ? '#8fb7cf' : TOPS[Math.floor(r() * TOPS.length)]),
      P: kind === 'carer' ? '#6f93ab' : PANTS[Math.floor(r() * PANTS.length)],
      K: '#2e2a27',
      A: kind === 'helper' ? '#e7dccb' : '#ffffff',
    };
    const bob = frame % 2 && p.move !== 'still' ? -1 : 0;
    const top = y - rows.length + bob;
    sprite(g, rows, x, top, pal);
    if (p.move === 'taichi' && frame % 4 < 2) { R(g, x - 1, top + 7, 1, 2, pal.S); R(g, x + 9, top + 7, 1, 2, pal.S); }
    if (p.hold === 'phone') R(g, x + 7, top + 9, 2, 3, '#33363b');
    if (p.hold === 'cane') { R(g, x + 9, top + 10, 1, 10, '#6b5440'); P(g, x + 8, top + 10, '#6b5440'); }
  }

  function crowd(g, people, cx, ground, frame, gap = 13) {
    const n = people.length;
    let x = Math.round(cx - ((n - 1) * gap) / 2) - 4;
    for (const p of people) { person(g, p, x, ground, frame + (hash(p.id || p.role) % 2)); x += gap; }
  }

  // ---------------------------------------------------------------- skies and weather
  const SKY = {
    day: ['#a9d3e3', '#c3e1e8', '#dcecea'],
    hot: ['#9fd0ea', '#cfe6ea', '#f3ecd2'],
    rain: ['#6f7c86', '#7f8b93', '#909aa0'],
    dusk: ['#e9b893', '#f1cfa9', '#f6e3c6'],
    night: ['#1d2742', '#26324f', '#2f3c5b'],
  };
  function sky(g, w, t) {
    const c = SKY[w] || SKY.day;
    R(g, 0, 0, W, 20, c[0]); R(g, 0, 20, W, 16, c[1]); R(g, 0, 36, W, 36, c[2]);
    if (w === 'night') { const r = rnd(7); for (let i = 0; i < 26; i++) P(g, r() * W, r() * 34, i % 3 ? '#cfd6e8' : '#fff6c9'); R(g, 168, 6, 7, 7, '#f3edd2'); R(g, 170, 6, 5, 2, '#26324f'); }
    if (w === 'hot' || w === 'day') { R(g, 176, 6, 8, 8, w === 'hot' ? '#f6d36b' : '#f8e7a3'); R(g, 175, 8, 10, 4, w === 'hot' ? '#f6d36b' : '#f8e7a3'); }
    if (w !== 'night' && w !== 'rain') clouds(g, t);
  }
  function clouds(g, t) {
    const set = [[10, 8, 22], [80, 14, 16], [130, 5, 26]];
    for (const [x0, y, w] of set) {
      const x = ((x0 + t * 0.6) % (W + 40)) - 30;
      R(g, x, y, w, 3, '#f7fbfb'); R(g, x + 4, y - 2, w - 9, 2, '#f7fbfb'); R(g, x + 2, y + 3, w - 4, 1, '#e6f0f1');
    }
  }
  function rain(g, t) {
    const r = rnd(3);
    for (let i = 0; i < 70; i++) {
      const x = (r() * W + t * 1.5) % W, y = (r() * H + t * 6) % H;
      R(g, x, y, 1, 3, 'rgba(225,235,245,.55)');
    }
  }
  function lanterns(g, t, y = 4) {
    for (let i = 0; i < 6; i++) {
      const x = 18 + i * 32 + (i % 2 ? Math.round(Math.sin(t / 6 + i)) : 0);
      R(g, x + 2, y, 1, 3, '#5a3a2a'); R(g, x, y + 3, 5, 6, '#c8392b'); R(g, x + 1, y + 2, 3, 1, '#e3b04b'); R(g, x + 1, y + 9, 3, 1, '#e3b04b'); R(g, x + 2, y + 10, 1, 2, '#e3b04b');
    }
  }

  // ---------------------------------------------------------------- outdoor backdrops
  function skyline(g, base, col) {
    const r = rnd(11);
    let x = 0;
    while (x < W) { const w = 6 + Math.floor(r() * 10), h = 8 + Math.floor(r() * 22); R(g, x, base - h, w, h, col); x += w + 1; }
  }
  function windows(g, x, y, w, h, gapX, gapY, c, lit, seed) {
    const r = rnd(seed);
    for (let j = y; j < y + h - 1; j += gapY) for (let i = x; i < x + w - 1; i += gapX) R(g, i, j, 2, 2, r() < 0.12 ? lit : c);
  }
  function pavement(g, y, col = '#d6cdbb', line = '#c7bda9') {
    R(g, 0, y, W, H - y, col);
    for (let x = 0; x < W; x += 8) R(g, x, y, 1, H - y, line);
    R(g, 0, y, W, 1, line);
  }
  function tree(g, x, y, c = '#5e8f5a') {
    R(g, x + 3, y, 2, 8, '#6b5440'); R(g, x, y - 8, 8, 8, c); R(g, x + 1, y - 10, 6, 2, c); R(g, x + 1, y - 7, 2, 2, '#77a873');
  }

  const BLOCKS = {
    prh: (g, night) => {
      skyline(g, 50, '#c4d3d9');
      [[6, 10, 50, '#e8c6a3'], [64, 6, 54, '#bcd8c3'], [126, 12, 58, '#efd896']].forEach(([x, y, w, c], k) => {
        R(g, x, y, w, 56 - y, c); R(g, x, y, w, 2, '#8e7f6c');
        windows(g, x + 3, y + 4, w - 6, 50 - y, 4, 4, night ? '#41506a' : '#62707c', '#f5e29b', 20 + k);
        R(g, x + w / 2 - 1, y + 2, 2, 54 - y, 'rgba(255,255,255,.18)');
      });
    },
    hos: (g, night) => {
      skyline(g, 50, '#c8d2d6');
      [[10, 8, 46], [72, 4, 52], [136, 10, 50]].forEach(([x, y, w], k) => {
        R(g, x, y, w, 56 - y, '#efe5cf'); R(g, x, y, w, 3, '#b0573f');
        for (let j = y + 6; j < 54; j += 6) R(g, x, j, w, 1, '#d9c8a8');
        windows(g, x + 4, y + 6, w - 8, 48 - y, 5, 6, night ? '#41506a' : '#5f6f7a', '#f5e29b', 40 + k);
      });
    },
    private: (g, night) => {
      skyline(g, 52, '#c2cfd8');
      [[8, 2, 34], [48, 10, 30], [86, 0, 40], [134, 8, 30], [170, 14, 26]].forEach(([x, y, w], k) => {
        R(g, x, y, w, 56 - y, k % 2 ? '#9db6c6' : '#b5c7d2');
        for (let j = y + 3; j < 54; j += 4) R(g, x, j, w, 1, k % 2 ? '#c9d8e1' : '#d6e1e8');
        windows(g, x + 2, y + 4, w - 4, 50 - y, 3, 4, night ? '#3c4a63' : '#7f97a8', '#f5e29b', 60 + k);
      });
      R(g, 0, 50, W, 6, '#d8cfc0'); for (let x = 6; x < W; x += 28) { R(g, x, 50, 16, 2, '#4f7b80'); R(g, x, 52, 16, 4, '#efe7d8'); }
    },
    other: (g, night) => {
      R(g, 0, 26, W, 30, '#8fb38a'); R(g, 20, 20, 70, 10, '#86ab82'); R(g, 110, 18, 80, 12, '#7ea47a');
      [[14, 24, 34], [62, 22, 36], [112, 26, 34], [158, 23, 34]].forEach(([x, y, w], k) => {
        R(g, x, y, w, 56 - y, '#ece3cf'); R(g, x - 1, y - 1, w + 2, 2, '#b9ad96');
        R(g, x + w - 8, y - 5, 6, 4, '#7d8a90');
        windows(g, x + 4, y + 5, w - 8, 52 - y, 7, 9, night ? '#41506a' : '#6d7c86', '#f5e29b', 80 + k);
      });
    },
  };

  const OUTDOOR = {
    estate(g, t, sp) { (BLOCKS[sp.housing] || BLOCKS.prh)(g, sp.weather === 'night'); pavement(g, 56); tree(g, 40, 58); tree(g, 156, 58, '#6a9a62'); R(g, 90, 60, 22, 2, '#8a6d4f'); R(g, 91, 62, 2, 4, '#6b5440'); R(g, 109, 62, 2, 4, '#6b5440'); },
    park(g, t) {
      skyline(g, 44, '#c4d3d9'); R(g, 0, 44, W, 12, '#9cc08f'); pavement(g, 56, '#d9cfb8', '#cbbfa5');
      R(g, 140, 26, 44, 3, '#a7442f'); R(g, 136, 29, 52, 3, '#b8553c'); R(g, 144, 32, 2, 24, '#7a3b2b'); R(g, 178, 32, 2, 24, '#7a3b2b'); R(g, 142, 23, 40, 3, '#c4663f');
      tree(g, 14, 56); tree(g, 32, 54, '#6a9a62'); tree(g, 112, 56, '#5a8a58');
    },
    market(g, t) {
      skyline(g, 40, '#c8d2d6'); R(g, 0, 20, W, 36, '#e2d6bf');
      const aw = [['#c8392b', '#f3ece1'], ['#3f7f5f', '#f3ece1'], ['#d7962f', '#f3ece1'], ['#3c6a9e', '#f3ece1']];
      for (let k = 0; k < 4; k++) {
        const x = 6 + k * 49;
        for (let i = 0; i < 44; i += 4) R(g, x + i, 26, 4, 5, aw[k][(i / 4) % 2]);
        R(g, x + 2, 31, 1, 25, '#7a6a58'); R(g, x + 41, 31, 1, 25, '#7a6a58');
        R(g, x + 2, 44, 40, 8, '#8a6d4f');
        const r = rnd(k + 5); for (let i = 0; i < 9; i++) R(g, x + 4 + i * 4, 41, 3, 3, ['#d9532c', '#6aa84f', '#f1c232', '#e69138'][Math.floor(r() * 4)]);
        R(g, x + 20, 32, 3, 3, Math.floor(t / 4) % 2 ? '#f6e7a1' : '#f2d77a');
      }
      pavement(g, 56, '#cfc6b4', '#c0b6a2');
    },
    street(g, t) {
      skyline(g, 40, '#c4d3d9'); R(g, 0, 20, W, 30, '#d9cdb5');
      for (let x = 4; x < W; x += 24) { R(g, x, 24, 18, 8, ['#c8392b', '#3c6a9e', '#3f7f5f', '#b48a3c'][(x / 24) % 4 | 0]); windows(g, x + 2, 36, 14, 12, 4, 5, '#6d7c86', '#f5e29b', x); }
      R(g, 0, 50, W, 10, '#6e6e6e'); for (let x = 0; x < W; x += 12) R(g, x, 55, 6, 1, '#e6e1d6');
      const bx = reduced() ? 120 : ((t * 1.2) % (W + 60)) - 50;
      R(g, bx, 31, 48, 22, '#3f8a7a'); R(g, bx, 31, 48, 3, '#2f6c60'); R(g, bx, 42, 48, 1, '#f0e8d8');
      for (let i = 2; i < 46; i += 6) { R(g, bx + i, 35, 5, 5, '#cfe3ea'); R(g, bx + i, 45, 5, 4, '#cfe3ea'); }
      R(g, bx + 6, 52, 6, 3, '#222'); R(g, bx + 36, 52, 6, 3, '#222');
      pavement(g, 60, '#d6cdbb', '#c7bda9');
    },
    school(g, t) {
      skyline(g, 40, '#c4d3d9'); R(g, 20, 14, 160, 42, '#efe1c2'); R(g, 20, 14, 160, 3, '#3f7f5f');
      windows(g, 26, 20, 148, 30, 8, 9, '#7f97a8', '#cfe3ea', 5); R(g, 94, 8, 12, 8, '#efe1c2'); R(g, 97, 9, 6, 6, '#fff'); R(g, 99, 10, 1, 3, '#333'); R(g, 99, 12, 3, 1, '#333');
      R(g, 0, 50, W, 6, '#9a8a73'); for (let x = 0; x < W; x += 4) R(g, x, 46, 1, 4, '#6f6355');
      pavement(g, 56);
    },
    harbour(g, t) {
      skyline(g, 36, '#9fb2c2'); R(g, 0, 36, W, 16, '#6f9fbf');
      for (let i = 0; i < 24; i++) { const x = (i * 37 + t * 0.5) % W; R(g, x, 38 + (i % 5) * 3, 6, 1, '#a9cbe0'); }
      R(g, 0, 52, W, 2, '#8a8f94'); for (let x = 0; x < W; x += 6) R(g, x, 48, 1, 4, '#8a8f94'); R(g, 0, 48, W, 1, '#8a8f94');
      pavement(g, 54, '#d8cdb7', '#c9bea7');
      for (const x of [30, 110, 180]) { R(g, x, 30, 1, 24, '#4a4a4a'); R(g, x - 2, 29, 5, 2, sp_lamp(t)); }
    },
    village(g, t) {
      R(g, 0, 22, W, 34, '#a9c79a'); R(g, 0, 30, W, 26, '#c5d79a'); for (let x = 0; x < W; x += 10) R(g, x, 40, 6, 1, '#9fbf6f');
      R(g, 120, 16, 50, 40, '#4f7d4a'); R(g, 112, 22, 66, 18, '#5a8a52'); R(g, 140, 34, 8, 22, '#6b5440'); R(g, 134, 44, 4, 12, '#6b5440');
      R(g, 30, 22, 44, 4, '#a33b2b'); R(g, 28, 26, 48, 2, '#7a3b2b'); R(g, 34, 28, 4, 28, '#8a7a66'); R(g, 66, 28, 4, 28, '#8a7a66'); R(g, 40, 24, 24, 1, '#e3b04b');
      pavement(g, 56, '#cdbf9f', '#bfb08f');
    },
  };
  function sp_lamp(t) { return Math.floor(t / 10) % 2 ? '#f6e7a1' : '#f2d77a'; }

  // ---------------------------------------------------------------- indoor rooms
  function room(g, wall, floor, view, sp, t) {
    R(g, 0, 0, W, 56, wall); R(g, 0, 56, W, 16, floor); R(g, 0, 55, W, 1, 'rgba(0,0,0,.12)');
    for (let y = 4; y < 50; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < W; x += 6) P(g, x, y, 'rgba(0,0,0,.035)');
    R(g, 0, 52, W, 4, 'rgba(0,0,0,.07)'); R(g, 0, 52, W, 1, 'rgba(255,255,255,.25)');
    R(g, 96, 0, 8, 2, '#d8cbb3'); R(g, 98, 2, 4, 2, sp.weather === 'night' ? '#ffe9a8' : '#efe6d3');
    for (let x = 0; x < W; x += 10) R(g, x, 56, 1, 16, 'rgba(0,0,0,.06)');
    if (view) {
      const [wx, wy, ww, wh] = view;
      const c = SKY[sp.weather] || SKY.day;
      R(g, wx - 2, wy - 2, ww + 4, wh + 4, '#8d7a64'); R(g, wx, wy, ww, wh, c[1]);
      g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
      if (sp.weather === 'night') { R(g, wx + ww - 9, wy + 3, 4, 4, '#f3edd2'); }
      const r = rnd(hash(sp.housing || 'v'));
      for (let x = wx; x < wx + ww; x += 7) { const h = 6 + Math.floor(r() * (wh - 6)); R(g, x, wy + wh - h, 6, h, sp.weather === 'night' ? '#3b4866' : '#b8c8d0'); }
      if (sp.weather === 'rain') rain(g, t);
      g.restore();
      R(g, wx + ww / 2 - 1, wy, 2, wh, '#8d7a64'); R(g, wx, wy + wh / 2 - 1, ww, 1, '#8d7a64');
    }
  }
  function steam(g, x, y, t) { if (reduced()) return; for (let i = 0; i < 3; i++) { const k = (t + i * 5) % 15; R(g, x + Math.round(Math.sin((t + i * 7) / 3)), y - k, 1, 1, `rgba(255,255,255,${0.7 - k / 22})`); } }
  function table(g, x, y, w, cloth = '#f3ece1') { R(g, x, y, w, 3, cloth); R(g, x + 2, y + 3, 2, 9, '#6b5440'); R(g, x + w - 4, y + 3, 2, 9, '#6b5440'); }
  function chair(g, x, y, c = '#8a5a3c') { R(g, x, y, 8, 2, c); R(g, x, y - 8, 2, 8, c); R(g, x, y + 2, 1, 6, c); R(g, x + 7, y + 2, 1, 6, c); }
  function shelf(g, x, y) {
    R(g, x, y, 30, 2, '#8a6d4f'); const c = ['#a33b2b', '#3c6a9e', '#d7962f', '#3f7f5f', '#7b6a9b'];
    for (let i = 0; i < 6; i++) R(g, x + 2 + i * 3, y - 6 + (i % 3 === 1 ? 1 : 0), 2, 6 - (i % 3 === 1 ? 1 : 0), c[i % 5]);
    R(g, x + 21, y - 7, 7, 7, '#c9b48f'); R(g, x + 22, y - 6, 5, 5, '#f3ece1'); P(g, x + 23, y - 4, '#5f7fa3'); P(g, x + 25, y - 4, '#a8687d'); P(g, x + 24, y - 5, '#2b2523');
  }
  function rug(g, x, y, w, c = '#b0573f') { R(g, x, y, w, 4, c); R(g, x + 1, y + 1, w - 2, 2, 'rgba(255,255,255,.18)'); for (let i = x + 2; i < x + w - 2; i += 4) P(g, i, y + 2, 'rgba(0,0,0,.15)'); }
  function plant(g, x, y) { R(g, x, y - 4, 6, 4, '#a0522d'); R(g, x - 1, y - 12, 8, 8, '#5e8f5a'); R(g, x + 2, y - 15, 3, 3, '#77a873'); }
  function calendar(g, x, y, mark) { R(g, x, y, 10, 12, '#fffdf8'); R(g, x, y, 10, 3, '#c8392b'); for (let j = 5; j < 12; j += 2) for (let i = 1; i < 10; i += 2) P(g, x + i, y + j, '#b8b0a3'); if (mark) { R(g, x + 4, y + 6, 3, 3, 'rgba(200,57,43,.0)'); g.strokeStyle = '#c8392b'; g.strokeRect(x + 3.5, y + 5.5, 4, 3); } }
  function clock(g, x, y, t) { R(g, x, y, 9, 9, '#fffdf8'); R(g, x - 1, y + 1, 11, 7, '#fffdf8'); R(g, x + 4, y + 2, 1, 3, '#333'); const k = Math.floor(t / 8) % 4; R(g, x + 4 + [0, 1, 0, -1][k], y + 4 + [-1, 0, 1, 0][k], 1, 1, '#a33b2b'); }
  function lamp(g, x, y, on) {
    R(g, x, y, 1, 22, '#5b4a3a'); R(g, x - 4, y - 5, 9, 5, '#f0d9a8');
    if (on) { const gr = g.createRadialGradient(x, y - 2, 1, x, y - 2, 26); gr.addColorStop(0, 'rgba(255,214,140,.30)'); gr.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gr; g.fillRect(x - 26, y - 28, 52, 52); }
  }
  function radio(g, x, y, t) { R(g, x, y, 14, 8, '#8a5a3c'); R(g, x + 2, y + 2, 5, 4, '#d9cbb3'); R(g, x + 9, y + 3, 3, 3, '#3b3b3b'); if (!reduced()) { const k = t % 16; P(g, x + 14 + Math.floor(k / 3), y - 2 - Math.floor(k / 4), '#6a5acd'); P(g, x + 15 + Math.floor(k / 3), y - 3 - Math.floor(k / 4), '#6a5acd'); } }
  function sofa(g, x, y, c) { R(g, x, y - 10, 40, 6, c); R(g, x, y - 4, 40, 6, c); R(g, x - 3, y - 8, 4, 10, c); R(g, x + 39, y - 8, 4, 10, c); R(g, x, y - 4, 40, 1, 'rgba(0,0,0,.12)'); }
  function bed(g, x, y) { R(g, x, y - 8, 46, 4, '#e9eef0'); R(g, x, y - 4, 46, 3, '#9fb8c9'); R(g, x, y - 12, 4, 12, '#c7cfd3'); R(g, x + 42, y - 9, 4, 9, '#c7cfd3'); R(g, x + 4, y - 10, 9, 3, '#ffffff'); R(g, x + 2, y - 1, 2, 6, '#9aa4a8'); R(g, x + 42, y - 1, 2, 6, '#9aa4a8'); }
  function flowers(g, x, y) { R(g, x, y - 4, 4, 4, '#7fa6d6'); for (let i = 0; i < 3; i++) { R(g, x + i * 2 - 1, y - 8, 2, 2, ['#e06666', '#f1c232', '#c27ba0'][i]); R(g, x + i * 2 - 1 + 1, y - 6, 1, 2, '#5e8f5a'); } }

  const WALL = { prh: '#ece3cf', hos: '#efe5d6', private: '#e7e2d8', other: '#ebe1cc' };
  const INDOOR = {
    home(g, t, sp) {
      room(g, WALL[sp.housing] || '#ece3cf', '#c9ad86', [128, 10, 46, 30], sp, t);
      calendar(g, 20, 12, sp.mark === 'calendar'); clock(g, 46, 10, t); shelf(g, 64, 28);
      rug(g, 24, 62, 46); sofa(g, 140, 60, '#7b8fa3'); table(g, 32, 50, 26); R(g, 38, 47, 3, 3, '#fffdf8'); R(g, 46, 47, 3, 3, '#fffdf8'); steam(g, 39, 46, t);
      plant(g, 190, 60); if (sp.mark === 'rails') { R(g, 6, 34, 1, 18, '#b7b7b7'); R(g, 6, 34, 10, 1, '#b7b7b7'); }
      lamp(g, 124, 34, sp.weather === 'night');
    },
    kitchen(g, t, sp) {
      room(g, '#e9e4d6', '#bfa58a', [120, 8, 40, 24], sp, t);
      R(g, 10, 40, 90, 16, '#d9cfbf'); R(g, 10, 38, 90, 2, '#b8ab96'); R(g, 20, 34, 14, 6, '#4a4a4a'); R(g, 22, 30, 10, 4, '#8a8f94'); steam(g, 26, 29, t);
      R(g, 60, 32, 10, 8, '#f3ece1'); R(g, 61, 30, 8, 2, '#d9532c'); for (let i = 0; i < 4; i++) R(g, 14 + i * 22, 12, 18, 14, '#c9b48f');
      lamp(g, 176, 34, sp.weather === 'night');
    },
    teahouse(g, t, sp) {
      room(g, '#e9d3b8', '#a8774f', [140, 8, 50, 26], sp, t); lanterns(g, t, 2);
      for (const x of [14, 62, 110]) { table(g, x, 50, 30); R(g, x + 6, 46, 6, 4, '#d4a24a'); R(g, x + 16, 46, 6, 4, '#d4a24a'); steam(g, x + 9, 45, t + x); steam(g, x + 19, 45, t + x + 3); }
      R(g, 0, 36, W, 1, '#c99e74');
    },
    clinic(g, t, sp) {
      room(g, '#e6efee', '#c3cfcc', [20, 10, 40, 26], sp, t);
      R(g, 120, 44, 50, 4, '#c9b08f'); R(g, 124, 48, 2, 8, '#8a6d4f'); R(g, 164, 48, 2, 8, '#8a6d4f'); R(g, 150, 38, 10, 6, '#d6e1e8');
      chair(g, 96, 50, '#6f93ab'); plant(g, 186, 60); R(g, 74, 10, 18, 12, '#fffdf8'); R(g, 76, 13, 14, 1, '#cfd6d4'); R(g, 76, 16, 10, 1, '#cfd6d4');
    },
    ward(g, t, sp) {
      room(g, '#e8eef0', '#cfd8db', [140, 8, 44, 28], sp, t);
      R(g, 8, 4, 120, 1, '#b7c2c6'); for (let x = 8; x < 50; x += 4) R(g, x, 5, 3, 40, 'rgba(159,184,201,.35)');
      bed(g, 60, 58); R(g, 112, 46, 12, 10, '#d9cfbf'); flowers(g, 116, 46); chair(g, 22, 52, '#6f93ab');
    },
    carehome(g, t, sp) {
      room(g, '#efe6d3', '#c6ab88', [70, 8, 60, 28], sp, t);
      for (const x of [10, 150]) { R(g, x, 46, 26, 8, '#8f6e9c'); R(g, x, 40, 26, 6, '#a07fae'); R(g, x - 2, 42, 3, 12, '#8f6e9c'); R(g, x + 25, 42, 3, 12, '#8f6e9c'); }
      R(g, 42, 30, 20, 3, '#8a6d4f'); radio(g, 46, 22, t); clock(g, 176, 8, t); plant(g, 136, 60); plant(g, 60, 60);
    },
    centre(g, t, sp) {
      room(g, '#efe6cf', '#c4ab86', [150, 8, 40, 26], sp, t);
      R(g, 12, 8, 64, 28, '#b98f5d'); const r = rnd(4); for (let i = 0; i < 9; i++) R(g, 15 + (i % 5) * 12, 11 + Math.floor(i / 5) * 12, 9, 9, ['#fff6c9', '#cfe3ea', '#f4cccc', '#d9ead3'][Math.floor(r() * 4)]);
      table(g, 90, 48, 44); R(g, 118, 40, 6, 8, '#9aa4a8'); R(g, 98, 45, 3, 3, '#fffdf8'); steam(g, 99, 44, t);
    },
    classroom(g, t, sp) {
      room(g, '#ece5d3', '#bfa27c', [156, 8, 36, 26], sp, t);
      R(g, 14, 8, 90, 30, '#3f5f4f'); R(g, 12, 6, 94, 2, '#8a6d4f'); for (let i = 0; i < 5; i++) R(g, 22 + i * 16, 16 + (i % 2) * 6, 8, 1, '#e8efe6');
      table(g, 30, 50, 40); R(g, 40, 47, 18, 3, '#fffdf8'); R(g, 50, 46, 1, 4, '#2a2420'); table(g, 110, 50, 40);
    },
    hall(g, t, sp) {
      room(g, '#efe1c9', '#b89a74', null, sp, t);
      for (let x = 4; x < W; x += 8) { R(g, x, 6 + (x % 16 ? 1 : 0), 2, 2, Math.floor(t / 5 + x) % 3 ? '#f6e7a1' : '#f2c46b'); }
      R(g, 0, 7, W, 1, '#8a6d4f'); table(g, 20, 48, 160); const r = rnd(9); for (let i = 0; i < 12; i++) R(g, 26 + i * 13, 45, 7, 3, ['#d9532c', '#6aa84f', '#f1c232', '#e69138', '#fffdf8'][Math.floor(r() * 5)]);
    },
    quiet(g, t, sp) {
      room(g, sp.weather === 'night' ? '#2d2a35' : '#efe6d3', sp.weather === 'night' ? '#3b3530' : '#c9ad86', [76, 10, 48, 32], sp, t);
      lamp(g, 150, 34, sp.weather === 'night'); chair(g, 40, 50, '#7a6a58'); plant(g, 178, 60);
      if (sp.mark === 'twocups') { table(g, 140, 50, 20); R(g, 144, 47, 3, 3, '#fffdf8'); R(g, 152, 47, 3, 3, '#fffdf8'); }
      if (sp.weather === 'dusk') { g.fillStyle = 'rgba(255,214,160,.22)'; g.beginPath(); g.moveTo(76, 42); g.lineTo(124, 42); g.lineTo(150, 72); g.lineTo(60, 72); g.fill(); }
    },
  };

  // Where people stand in each room, clear of the furniture.
  const CX = { home: 100, kitchen: 132, teahouse: 100, clinic: 70, ward: 136, carehome: 100, centre: 60, classroom: 100, hall: 100, quiet: 100 };

  // ---------------------------------------------------------------- composition
  function draw(g, sp, t) {
    const frame = Math.floor(t / 6);
    const outdoor = OUTDOOR[sp.place];
    if (outdoor) {
      sky(g, sp.weather, t);
      outdoor(g, t, sp);
      if (sp.festive) lanterns(g, t);
      crowd(g, sp.people || [], sp.cx || 100, sp.ground || 68, frame);
      if (sp.weather === 'rain') rain(g, t);
    } else {
      (INDOOR[sp.place] || INDOOR.home)(g, t, sp);
      if (sp.festive) lanterns(g, t);
      crowd(g, sp.people || [], sp.cx || CX[sp.place] || 100, sp.ground || 66, frame);
    }
  }

  const live = new Set();
  let raf = null, t0 = 0;
  function loop(ts) {
    raf = null;
    const t = Math.floor((ts - t0) / 125); // 8 frames a second
    for (const c of live) {
      if (!c.isConnected) { live.delete(c); continue; }
      const g = c.getContext('2d');
      draw(g, c._spec, reduced() ? 0 : t);
    }
    if (live.size && !reduced()) raf = requestAnimationFrame(loop);
  }

  // Show a scene in a container: a canvas plus a caption. Same spec key = no redraw needed.
  function show(box, spec, lang) {
    if (!box || !spec) return;
    let c = box.querySelector('canvas');
    if (!c) {
      c = document.createElement('canvas');
      c.width = W; c.height = H; c.className = 'pixel';
      const cap = document.createElement('p'); cap.className = 'sceneCap';
      box.replaceChildren(c, cap);
    }
    c.setAttribute('role', 'img');
    c.setAttribute('aria-label', spec.alt ? spec.alt[lang] : '');
    box.querySelector('.sceneCap').textContent = spec.caption ? spec.caption[lang] : '';
    if (c._key !== spec.key) {
      c._key = spec.key; c._spec = spec;
      box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap');
    }
    live.add(c);
    if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(loop); }
  }

  // Draw one still frame onto any 2D context (used for the share card).
  function still(g, spec, x, y, scale) {
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    draw(off.getContext('2d'), spec, 12);
    g.imageSmoothingEnabled = false;
    g.drawImage(off, x, y, W * scale, H * scale);
  }

  return { show, still, W, H, SKIN };
})();
