// Checks that every line fits the life it appears in: no partner after widowhood, no
// grandchild before there is one, no outings in long-term care, and so on.
//   node tools/lint.js [lives]   -> prints each kind of slip with an example; exits 1 if any
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { Math, console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'engine.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, process.env.SCENARIO || 'scenarios/turn65.js'), 'utf8'), ctx);
const sc = ctx.SCENARIO;

// Snapshot the state each event leaves behind, so its text can be checked against it.
for (const ev of sc.events) {
  const run = ev.run;
  ev.run = (s, rng) => {
    const e = run(s, rng);
    if (e) e.st = { alone: s.arrangement === 'alone', away: !!s.childAway, spouse: s.spouse, widowed: !!s.flags.widowed, inHome: !!s.flags.inHome, ltc: !!s.flags.ltc, dementia: !!s.flags.dementia, hasChild: s.hasChild, age: s.age, hurt: s.flags.hurtAge !== undefined && s.age - s.flags.hurtAge <= 1, hip: !!s.flags.hip, stroke: s.flags.strokeAge !== undefined, gkAge: s.gkAge, chinese: s.chinese };
    return e;
  };
}

const OUTINGS = ['hike', 'market', 'teahouse', 'park', 'outing', 'yum_cha', 'faith', 'dumplings', 'learn', 'help_out', 'tai_chi', 'hometown', 'grandkid', 'cook', 'work_day'];
const HOME_IDS = ['home_visit', 'home_give', 'family_visit', 'typhoon', 'friend', 'remember', 'interpreter', 'dem_moment', 'phone', 'gk_adult', 'first_gk', 'care_home', 'hospital', 'widowed', 'low_mood', 'death'];
const PARTNER_OK = ['widowed', 'after_loss', 'remember'];
const STRENUOUS = /bag of rice|MacLehose|swam a few lengths|every weekday/i;
const rules = [
  ['partner mentioned with no living partner', (e) => /your partner|you and your partner/i.test(e.en) && !e.st.spouse && !PARTNER_OK.includes(e.id)],
  ['grandchild mentioned with no grandchild', (e) => /grand(son|daughter|child)/i.test(e.en) && e.st.gkAge === null],
  ['son or daughter mentioned with no child', (e) => /your (son|daughter)\b/i.test(e.en) && !e.st.hasChild],
  ['outing in long-term care', (e) => e.st.ltc && OUTINGS.includes(e.id)],
  ['life at home while in a care home', (e) => e.st.inHome && e.daily && !HOME_IDS.includes(e.id)],
  ['teaching, learning or helping with dementia', (e) => e.st.dementia && ['learn', 'help_out', 'cook', 'phone', 'volunteer', 'academy', 'home_give'].includes(e.id)],
  ['Chinese festival in a non-Chinese life', (e) => !e.st.chinese && /Lunar New Year|Cantonese opera|Ching Ming|Dragon Boat|solstice|couplets/i.test(e.en) && e.id !== 'home_visit'],
  ['in-person family moment with the child far away', (e) => e.st.away && ['yum_cha', 'cook', 'child_near', 'outing', 'grandkid', 'gk_baby', 'gk_teen', 'phone', 'family_visit', 'quarrel'].includes(e.id)],
  ['door left unanswered for days in a shared household', (e) => /lying at your door for days/.test(e.en) && !e.st.alone],
  ['strenuous moment at 80 or older', (e) => STRENUOUS.test(e.en) && e.st.age >= 80],
  ['strenuous moment after an injury, a broken hip or a stroke', (e) => STRENUOUS.test(e.en) && (e.st.hurt || e.st.hip || e.st.stroke)],
  ['physical moment within a year of an injury', (e) => (e.id === 'tai_chi' || /home village|nature trail/i.test(e.en)) && e.st.hurt],
  ['school-age moment at the wrong grandchild age', (e) => e.id === 'grandkid' && (e.st.gkAge < 4 || e.st.gkAge > 12)],
];

const n = Number(process.argv[2]) || 3000;
const hits = new Map();
for (let i = 0; i < n; i++) {
  const life = new ctx.Life(sc, ctx.makeRng((i + 11) * 7919), {});
  while (!life.dead) life.liveYear(life.rng.pick(sc.focuses).id, true);
  for (const e of life.record) {
    if (!e.st) continue;
    const x = { id: e.id, daily: e.daily, st: e.st, en: typeof e.text === 'object' ? e.text.en : e.text };
    for (const [name, bad] of rules) if (bad(x)) { const h = hits.get(name) || { count: 0, ex: x }; h.count++; hits.set(name, h); }
  }
}
for (const [name, h] of hits) console.log(`FAIL  ${name}: ${h.count}  e.g. [${h.ex.id}] ${h.ex.en}`);
console.log(hits.size ? `\n${hits.size} kind(s) of slip in ${n} lives` : `${n} lives: every line fits its life`);
process.exitCode = hits.size ? 1 : 0;
