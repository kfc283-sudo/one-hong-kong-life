// Life engine. It knows nothing about any topic: a scenario file supplies the starting draw,
// the events, the focuses, the pauses and the mortality curve, and this file runs the years.
// Text in a scenario can be a plain string or a { zh, en } pair; the screens pick the language.

window.makeRng = function makeRng(seed) {
  let a = seed >>> 0;
  const rng = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.pick = (arr) => arr[Math.floor(rng() * arr.length)];
  rng.weightedIndex = (weights) => {
    const total = weights.reduce((x, y) => x + y, 0);
    let r = rng() * total;
    for (let i = 0; i < weights.length; i++) if ((r -= weights[i]) < 0) return i;
    return weights.length - 1;
  };
  rng.weighted = (arr, w) => arr[rng.weightedIndex(arr.map(w))];
  return rng;
};

window.Life = class Life {
  // options.gentle: events marked `heavy` still happen at their real rates (so every life follows
  // the same statistics), but are told with the entry's shorter `soft` line, without detail.
  constructor(scenario, rng, options = {}) {
    this.sc = scenario;
    this.rng = rng;
    this.gentle = !!options.gentle;
    this.s = scenario.draw(rng);
    this.record = [{ age: this.s.age, text: scenario.describe(this.s), kind: 'start' }];
    this.counts = {};
    this.lastSeen = {};
    this.queue = [];
    this.pending = null; // a choice waiting for the player
    this.dead = false;
    this.dying = false; // decided at the start of each year, so events can stay out of a final year
    this.seenHelp = new Set(); // each help number is shown once per life

  }

  clamp() {
    for (const k of Object.keys(this.s.stats)) this.s.stats[k] = Math.max(0, Math.min(100, Math.round(this.s.stats[k])));
  }

  eligible(ev) {
    const n = this.counts[ev.id] || 0;
    if (ev.once && n > 0) return false;
    if (ev.rep !== undefined && n >= ev.rep) return false;
    if (ev.notBeforeDeath && this.dying) return false; // e.g. low mood never sits just before a death
    if (ev.gap && this.lastSeen[ev.id] !== undefined && this.s.age - this.lastSeen[ev.id] < ev.gap) return false;
    return ev.when(this.s);
  }

  // Live one year. With auto=true, choices are made by their `auto` weights (used for the
  // companion lives, auto-play and the headless tools). Otherwise the first choice met stops the year.
  liveYear(focusId, auto) {
    if (this.dead || this.pending) return;
    const s = this.s;
    const focus = this.sc.focuses.find((f) => f.id === focusId && (!f.ok || f.ok(s))) || this.sc.focuses[0];
    focus.apply(s);
    if (this.sc.yearly) this.sc.yearly(s);
    this.dying = this.rng() < this.sc.mortality(s) || s.age >= this.sc.maxAge;

    const hits = [];
    for (const ev of this.sc.events) {
      if (!this.eligible(ev)) continue;
      if (this.rng() < ev.p(s)) hits.push(ev);
    }
    // Keep a year readable: every event with a statistic behind it, plus one everyday moment, or
    // two in a year with no sourced event. A year is never left empty while some moment fits. A
    // moment seen in the last few years is much less likely to be picked again.
    const sourced = hits.filter((e) => !e.daily);
    const recent = (e) => (this.lastSeen[e.id] !== undefined && s.age - this.lastSeen[e.id] < 6 ? 0.15 : 1);
    let pool = hits.filter((e) => e.daily), weight = recent;
    if (!pool.length && !sourced.length) { pool = this.sc.events.filter((e) => e.daily && this.eligible(e)); weight = (e) => e.p(s) * recent(e); }
    const picked = [];
    const cap = this.sc.dailyCap ? this.sc.dailyCap(s) : 2;
    while (picked.length < cap && pool.length) {
      const e = this.rng.weighted(pool, weight);
      picked.push(e);
      pool = pool.filter((x) => x !== e);
    }
    this.queue = sourced.concat(picked);
    this.runQueue(auto);
  }

  runQueue(auto) {
    const s = this.s;
    while (this.queue.length) {
      const ev = this.queue.shift();
      if (!this.eligible(ev)) continue; // an earlier event this year may have changed things
      this.counts[ev.id] = (this.counts[ev.id] || 0) + 1;
      this.lastSeen[ev.id] = s.age;
      const entry = ev.run(s, this.rng);
      if (!entry) continue;
      entry.age = s.age;
      entry.id = ev.id;
      if (ev.heavy) entry.heavy = true;
      if (this.gentle && entry.soft) entry.text = entry.soft;
      delete entry.soft;
      if (ev.daily) entry.daily = true;
      this.onceHelp(entry);
      this.record.push(entry);
      if (entry.choice) {
        const opts = entry.choice.options.filter((o) => !o.ok || o.ok(s));
        entry.choice.options = opts;
        if (auto || opts.length === 1) this.applyChoice(entry, this.rng.weighted(opts, (o) => o.auto || 1));
        else { this.pending = entry; this.clamp(); return; }
      }
    }
    this.clamp();
    this.endYear();
  }

  applyChoice(entry, option) {
    entry.chosen = option.label;
    const result = option.apply(this.s, this.rng);
    if (result) {
      const r = result.text ? result : { text: result };
      const e = { age: this.s.age, text: r.text, help: r.help, follow: true };
      this.onceHelp(e);
      this.record.push(e);
    }
    this.clamp();
  }

  onceHelp(entry) {
    if (!entry.help) return;
    const key = (entry.help.en || '').replace(/\D/g, '');
    if (this.seenHelp.has(key)) delete entry.help;
    else this.seenHelp.add(key);
  }

  // Called by the screens when the player answers a pending choice.
  choose(entry, option) {
    this.applyChoice(entry, option);
    if (this.pending === entry) {
      this.pending = null;
      this.runQueue(false);
    }
  }

  endYear() {
    const s = this.s;
    if (this.dying) {
      this.dead = true;
      s.alive = false;
      this.record.push({ age: s.age, text: this.sc.deathLine(s, this.rng), kind: 'death', help: this.sc.deathHelp });
      return;
    }
    s.age += 1;
  }

  autoLive() {
    while (!this.dead) this.liveYear(this.rng.pick(this.sc.focuses).id, true);
    return this;
  }
};
