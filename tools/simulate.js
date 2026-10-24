// Headless runner for the life engine.
//   node tools/simulate.js calibrate [lives]          -> checks the model against its sources (PASS/FAIL)
//   node tools/simulate.js experience [lives]         -> length, variety and repetition per life
//   node tools/simulate.js transcript [seed] [n] [zh|en|both] -> prints n full lives as plain text
// Choices are made by each option's `auto` weight, the same way companion lives are played.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const scenarioFile = process.env.SCENARIO || 'scenarios/turn65.js';
const ctx = { Math, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'engine.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, scenarioFile), 'utf8'), ctx);
const sc = ctx.SCENARIO;

const tx = (t, lang) => (t && typeof t === 'object' ? t[lang] : t || '');
const band = (a) => (a < 75 ? 0 : a < 85 ? 1 : 2);
const BANDS = ['65-74', '75-84', '85+'];

function live(seed, gentle = false) {
  const life = new ctx.Life(sc, ctx.makeRng(seed), { gentle });
  const years = [];
  while (!life.dead) {
    const s = life.s;
    years.push({ age: s.age, sex: s.sex, widowed: s.marital === 'widowed' || !!s.flags.widowed, flags: { ...s.flags } });
    life.liveYear(life.rng.pick(sc.focuses).id, true);
  }
  return { life, years };
}

function calibrate(n) {
  // Targets and tolerances live in the scenario (sc.calibrate), shared with the method page.
  const lives = [];
  for (let i = 0; i < n; i++) {
    const { life, years } = live((i + 1) * 2654435761, process.env.GENTLE === '1');
    lives.push({ sex: life.s.sex, ageAtDeath: life.s.age, years });
  }
  const rows = sc.calibrate(lives);
  const f = (r, v) => (typeof v !== 'number' ? v.en : r.fmt === 'yrs' ? v.toFixed(2) : `${(100 * v).toFixed(1)}%`);
  console.log(`${n} lives${process.env.GENTLE === '1' ? ' in gentle mode' : ''} (tolerances fixed before any tuning)
`);
  for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label.en.padEnd(40)} ${f(r, r.sim).padStart(7)}   target ${f(r, r.lo)} to ${f(r, r.hi)}`);
  const fails = rows.filter((r) => !r.ok).length;
  console.log(`
${fails ? `${fails} FAIL` : 'ALL PASS'}`);
  return fails;
}

function experience(n) {
  const words = [], chars = [], years = [], facts = [], choices = [], distinct = [], heavy = [], lines = [], minZh = [], minEn = [];
  let maxRepeat = 0, maxRepeatId = '';
  const seen = {};
  for (let i = 0; i < n; i++) {
    const { life } = live((i + 7) * 40503);
    let w = 0, c = 0, f = 0, ch = 0, h = 0;
    for (const e of life.record) {
      w += tx(e.text, 'en').split(/\s+/).length; c += tx(e.text, 'zh').length;
      if (e.fact) { f++; w += tx(e.fact, 'en').split(/\s+/).length; c += tx(e.fact, 'zh').length; }
      if (e.choice && e.choice.options.length > 1) ch++;
      if (e.heavy) h++;
    }
    for (const [k, v] of Object.entries(life.counts)) { if (v > maxRepeat) { maxRepeat = v; maxRepeatId = k; } seen[k] = (seen[k] || 0) + 1; }
    // Minutes at 1x, timed as the screens time autoplay: a 3 s beat per year plus reading time
    // (4.5 Chinese characters or 3 English words a second); choices and pauses come on top.
    const byYear = {};
    for (const e of life.record) { const y = byYear[e.age] || (byYear[e.age] = { c: 0, w: 0 }); for (const t of [e.text, e.fact]) if (t) { y.c += tx(t, 'zh').replace(/\s/g, '').length; y.w += tx(t, 'en').split(/\s+/).filter(Boolean).length; } }
    const ys = Object.values(byYear);
    minZh.push(Math.round(ys.reduce((a, y) => a + 3 + y.c / 4.5, 0) / 6) / 10); minEn.push(Math.round(ys.reduce((a, y) => a + 3 + y.w / 3, 0) / 6) / 10);
    lines.push(life.record.filter((e) => !e.follow).length);
    words.push(w); chars.push(c); years.push(life.s.age - 64); facts.push(f); choices.push(ch); heavy.push(h);
    distinct.push(Object.keys(life.counts).length);
  }
  const q = (a, p) => [...a].sort((x, y) => x - y)[Math.floor(p * (a.length - 1))];
  const row = (label, a) => console.log(`${label.padEnd(30)} median ${String(q(a, 0.5)).padStart(5)}   p10 ${String(q(a, 0.1)).padStart(5)}   p90 ${String(q(a, 0.9)).padStart(5)}`);
  console.log(`${n} lives\n`);
  row('years lived (screens)', years);
  row('English words read', words);
  row('Chinese characters read', chars);
  row('lines in the record', lines);
  row('minutes at 1x, Chinese (reading)', minZh);
  row('minutes at 1x, English (reading)', minEn);
  row('fact boxes', facts);
  row('choices made by the player', choices);
  row('heavy moments', heavy);
  row('distinct events', distinct);
  console.log(`most repeated event in one life: ${maxRepeatId} x${maxRepeat}`);
  console.log('\nshare of lives with each event:');
  for (const [k, v] of Object.entries(seen).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(16)} ${(100 * v / n).toFixed(1)}%`);
}

function transcript(seed, n, lang) {
  const langs = lang === 'both' ? ['zh', 'en'] : [lang];
  for (let i = 0; i < n; i++) {
    const { life } = live(seed + i * 7919);
    for (const L of langs) {
      console.log(`\n=== Life ${i + 1} [${L}]: ${tx(life.s.name, L)} (${life.s.sex}, ${life.s.marital}, ${life.s.start}, ${life.s.housing}) ===`);
      for (const e of life.record) {
        const pre = e.follow ? '      ' : `[${e.age}] `;
        console.log(pre + tx(e.text, L) + (e.chosen ? `  (chose: ${tx(e.chosen, L)})` : ''));
        if (e.fact) console.log(`      FACT: ${tx(e.fact, L)}`);
        if (e.help) console.log(`      HELP: ${tx(e.help, L)}`);
        if (sc.pauses[e.age] && e.kind === undefined && !e.follow && e === life.record.find((r) => r.age === e.age && !r.follow && r.kind === undefined)) console.log(`      PAUSE: ${tx(sc.pauses[e.age], L)}`);
      }
      console.log('      NOT CHOSEN: ' + sc.notChosen(life.s).map((t) => tx(t, L)).join(' '));
      for (const line of sc.epilogue(life.s)) console.log(`      ${tx(line, L)}`);
    }
  }
}

const [mode = 'calibrate', a, b, c] = process.argv.slice(2);
if (mode === 'transcript') transcript(Number(a) || 1, Number(b) || 3, c || 'en');
else if (mode === 'experience') experience(Number(a) || 500);
else process.exitCode = calibrate(Number(a) || 20000) ? 1 : 0;
