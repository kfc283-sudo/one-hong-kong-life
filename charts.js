// Small, dependency-free charts in inline SVG/HTML. Data comes from the scenario; nothing here is
// typed in by hand. Single-series charts: one hue (--chart), recessive grid, text in ink tokens,
// a hover/keyboard readout, and a table view for screen readers and print.
window.Charts = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs = {}, ...kids) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    for (const k of kids) if (k != null) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  };
  const h = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else n.setAttribute(k, v); }
    for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : String(k));
    return n;
  };
  const pct = (x) => `${(100 * x).toFixed(1)}%`;

  // Horizontal bar list: one row per category, value printed at the end of each bar.
  // `max` lets several lists share one scale, so bars can be compared across them.
  function barList(rows, caption, max = Math.max(...rows.map((r) => r.share))) {
    return h('table', { class: 'barlist' },
      h('caption', { class: 'sr' }, caption),
      h('tbody', {}, rows.map((r) => h('tr', {},
        h('th', { scope: 'row' }, r.label),
        h('td', { class: 'bar', 'aria-hidden': 'true' }, h('span', { style: `width:${(r.share / max) * 100}%` })),
        h('td', { class: 'num' }, pct(r.share))))));
  }

  // Survival curve: of 100 people at 65, how many are alive at each age. `mark` is this life.
  // `o.narrow` draws a taller, narrower chart so its text stays readable on a phone.
  function survival(points, o) {
    const [W, H, L] = o.narrow ? [360, 250, 32] : [640, 230, 40];
    const R = 16, T = 16, B = 34;
    const x = (a) => L + ((a - 65) / 40) * (W - L - R);
    const y = (v) => T + (1 - v / 100) * (H - T - B);
    const at = (a) => points.find((p) => p.age === a) || points[points.length - 1];
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.age).toFixed(1)},${y(p.alive).toFixed(1)}`).join('');
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'survival', role: 'img', 'aria-label': o.alt, tabindex: '0' });
    for (const v of [25, 50, 75, 100]) {
      svg.append(sv('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }), sv('text', { x: L - 6, y: y(v) + 4, class: 'tick', 'text-anchor': 'end' }, v));
    }
    for (let a = 65; a <= 105; a += 10) svg.append(sv('text', { x: x(a), y: H - 12, class: 'tick', 'text-anchor': 'middle' }, a));
    svg.append(sv('line', { x1: L, x2: W - R, y1: y(0), y2: y(0), class: 'axis' }));
    svg.append(sv('path', { d: `${line}L${x(105)},${y(0)}L${x(65)},${y(0)}Z`, class: 'area' }), sv('path', { d: line, class: 'curve' }));
    // This life's label: up and to the right of the point, or to the left in the right half.
    let box = null;
    if (o.mark) {
      const p = at(o.mark.age), px = x(p.age), py = y(p.alive);
      const flip = px > L + (W - L - R) * 0.55, w = o.mark.label.length * 7.5;
      const lx = flip ? px - 10 : px + 10, ly = Math.max(T + 12, py - 10);
      box = { x0: flip ? lx - w : lx, x1: flip ? lx : lx + w, y0: ly - 13, y1: ly + 3 };
      o.markLabel = sv('text', { x: lx, y: ly, class: 'label', 'text-anchor': flip ? 'end' : 'start' }, o.mark.label);
      o.markDot = sv('circle', { cx: px, cy: py, r: 5.5, class: 'me' });
    }
    // Where half are still living: a quiet reference, labelled once, at the top unless this
    // life's label is there, then at the foot of the line.
    const half = points.find((p) => p.alive <= 50);
    if (half) {
      const hx = x(half.age), text = o.halfLabel(half.age), w = text.length * 6.5;
      const top = { x0: hx + 5, x1: hx + 5 + w, y0: T, y1: T + 14 };
      const clash = box && box.x0 < top.x1 && box.x1 > top.x0 && box.y0 < top.y1 && box.y1 > top.y0;
      const ny = clash ? y(0) - 6 : T + 11;
      svg.append(sv('line', { x1: hx, x2: hx, y1: clash ? y(50) : T + 16, y2: y(0), class: 'ref' }), sv('text', { x: hx + 5, y: ny, class: 'note' }, text));
    }
    for (const c of o.others || []) svg.append(sv('circle', { cx: x(c.age), cy: y(at(c.age).alive), r: 3.5, class: 'other' }, sv('title', {}, c.label)));
    if (o.mark) svg.append(o.markDot, o.markLabel);
    // Hover and keyboard readout.
    const cross = sv('line', { y1: T, y2: y(0), class: 'cross', visibility: 'hidden' });
    const dot = sv('circle', { r: 4, class: 'crossdot', visibility: 'hidden' });
    const tip = sv('text', { class: 'tip', visibility: 'hidden' });
    svg.append(cross, dot, tip);
    let cur = o.mark ? o.mark.age : 85;
    const show = (a) => {
      cur = Math.max(65, Math.min(105, a));
      const p = at(cur), px = x(cur);
      for (const n of [cross, dot, tip]) n.setAttribute('visibility', 'visible');
      cross.setAttribute('x1', px); cross.setAttribute('x2', px);
      dot.setAttribute('cx', px); dot.setAttribute('cy', y(p.alive));
      tip.textContent = o.tipLabel(cur, Math.round(p.alive));
      const flip = px > W - (o.narrow ? 130 : 170);
      tip.setAttribute('x', flip ? px - 8 : px + 8); tip.setAttribute('text-anchor', flip ? 'end' : 'start');
      tip.setAttribute('y', Math.max(T + 12, y(p.alive) - 12));
    };
    const hide = () => { for (const n of [cross, dot, tip]) n.setAttribute('visibility', 'hidden'); };
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      show(Math.round(65 + (((e.clientX - r.left) / r.width) * W - L) / (W - L - R) * 40));
    });
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('focus', () => show(cur));
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { show(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show(cur - 1); e.preventDefault(); }
    });
    const table = h('details', { class: 'tableview' }, h('summary', {}, o.tableLabel),
      h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, o.colAge), h('th', {}, o.colAlive))),
        h('tbody', {}, points.filter((p) => p.age % 5 === 0).map((p) => h('tr', {}, h('td', {}, p.age), h('td', {}, Math.round(p.alive)))))));
    return h('figure', { class: 'chart' }, svg, table);
  }

  return { barList, survival };
})();
