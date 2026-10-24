// Screens and rendering. Reads window.SCENARIO; all topic content lives there.
// Every visible string is a { zh, en } pair; Traditional Chinese is the default.
(() => {
  const sc = window.SCENARIO;
  const app = document.getElementById('app');
  const dlg = document.getElementById('dlg');
  const COLORS = { health: 'var(--health)', money: 'var(--money)', people: 'var(--people)', spirits: 'var(--spirits)' };

  // Per-viewer conveniences only; the page works the same without storage.
  const store = {
    get: (k) => { try { return localStorage.getItem('ohkl.' + k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem('ohkl.' + k, v); } catch (e) { /* private mode */ } },
  };
  // Link options: ?lang=en|zh opens in that language; ?seed=N replays one life exactly (the game
  // decides every choice, so the same seed and version give the same life); ?capture hides the
  // controls for clean screenshots and shows only the latest year; ?capture=N opens straight on
  // the year lived at age N. Nothing the reader writes is ever put in a link.
  const params = new URLSearchParams(location.search);
  const urlLang = ['zh', 'en'].includes(params.get('lang')) ? params.get('lang') : null;
  const urlSeed = /^\d{1,9}$/.test(params.get('seed') || '') ? Number(params.get('seed')) : null;
  const capture = params.has('capture');
  const capAge = /^\d{2,3}$/.test(params.get('capture') || '') ? Number(params.get('capture')) : null;
  if (capture) document.documentElement.classList.add('capture');
  let lang = urlLang || (store.get('lang') === 'en' ? 'en' : 'zh');
  let gentle = store.get('gentle') === '1';
  let me, companions, focus, autoTimer, reflections, screen, yearStart, returnTo, countdown, cdAbort, dlgKind;
  // Play controls: play/pause with speed, a "decide for me" mode and
  // the reflection pauses as a toggle. During play, a choice or pause never stalls the life: it
  // waits a few seconds, then the game decides (by the same weights the companions use) and goes on.
  let speed = 1;
  let decide = urlSeed !== null || store.get('decide') === '1';
  let pausesOn = store.get('pauses') !== '0';
  // During play each year stays on screen long enough to read: a short beat, plus reading time for
  // what the year added (about 6 Chinese characters or 3 English words a second), divided by the speed.
  const BEAT_MS = 3000;

  // Set at launch. REPO: the public repository, linked from the footer. COUNTER: a GoatCounter
  // count endpoint (https://<code>.goatcounter.com/count). With it set, the page sends two plain
  // totals, a life started and a life finished: no cookies, no script, nothing about the reader,
  // and nothing from replay links, capture mode or a local copy. The totals are not shown on the page.
  const REPO = 'https://github.com/kfc283-sudo/one-hong-kong-life';
  const AUTHOR = 'Paulo Chak'; // "made by", shown on the method page
  const AUTHOR_URL = 'https://www.linkedin.com/in/paulo-chak/';
  const COUNTER = '';
  const counting = !!COUNTER && urlSeed === null && !capture && !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  function count(name) {
    if (!counting) return;
    try { navigator.sendBeacon(`${COUNTER}?p=${encodeURIComponent(`/event/${name}`)}&t=${name}&e=true&rnd=${Math.random().toString(36).slice(2)}`); } catch (e) { /* counting never gets in the way */ }
  }

  const T = (zh, en) => ({ zh, en });
  const t = (x) => (x && typeof x === 'object' && 'zh' in x ? x[lang] : x);
  const UI = {
    kicker: T('以公開統計數字建成的人生模擬', 'A life simulation built on public statistics'),
    start: T('踏入65歲', 'Turn 65'),
    gentle: T('溫和模式：喪偶、認知障礙症等較沉重的時刻，會寫得簡短一些', 'Gentle mode: heavier moments, such as losing a partner or dementia, are told more briefly'),
    note: T('疾病、離別和死亡會按真實比率出現，但不會詳細描寫。你在這裡寫下的字不會離開這個頁面。', 'Illness, loss and death happen at their real rates but are never shown in detail. Nothing you type leaves this page.'),
    method: T('數據和方法', 'About the numbers'),
    today: T('今天', 'Today'),
    whereFrom: T('這段人生是怎樣設定的', 'How this life was set up'),
    sameDay: T('同一天踏入65歲的人', 'Turning 65 on the same day'),
    sameDayNote: T('他們的人生按同一套數字展開，與你的並行。', 'Their lives follow the same statistics, alongside yours.'),
    begin: T('開始', 'Begin'),
    liveYear: T('過這一年', 'Live this year'),
    oneYear: T('過一年', 'One year'),
    play: T('▶ 播放', '▶ Play'),
    pauseBtn: T('❚❚ 暫停', '❚❚ Pause'),
    speed: T('速度', 'Speed'),
    controls: T('播放控制', 'Playback controls'),
    nextChoice: T('下一個選擇 ⏭', 'Next choice ⏭'),
    toEnd: T('直接到結局', 'Skip to the end'),
    decideForMe: T('由遊戲代我決定', 'Decide for me'),
    pausesToggle: T('停下來想一想', 'Stop to reflect'),
    playHint: T('按「播放」，歲月就會流過；在幾個時刻，由你作決定。', 'Press Play and the years go by. At a few moments, you decide.'),
    focusNote: T('你的重點只會稍為改變機會，不會決定發生甚麼。', 'Your focus nudges the odds a little. It never decides what happens.'),
    focusOff: T('灰色的選項，在人生這個階段已不適用。', 'Greyed-out options no longer fit this stage of life.'),
    decidedForYou: T('由遊戲代為決定：', 'decided for you: '),
    letGameDecide: T('之後都由遊戲代我決定', 'Let the game decide from now on'),
    autoIn: (n) => T(`${n}秒後由遊戲代為決定；按任何鍵，就會停下來等你`, `The game will decide in ${n}s. Press any key and it will wait for you`),
    goOnIn: (n) => T(`${n}秒後繼續；你一開始寫，就會停下來等你`, `Carrying on in ${n}s. Start typing and it will wait for you`),
    focusOn: T('這一年，你最想', 'This year, focus on'),
    howThings: T('現在的狀況', 'How things are'),
    sameBirthday: T('同一天生日', 'Same birthday'),
    record: T('人生紀錄', 'Life record'),
    youChose: T('你選擇了：', 'you chose: '),
    age: T('歲', ''),
    diedAt: (a) => T(`${a}歲離世`, `died at ${a}`),
    pause: T('停一停', 'A pause'),
    pauseHint: T('想寫一句就寫吧，只會留在這個頁面。', 'Write a line if you like. It stays on this page.'),
    carryOn: T('繼續', 'Carry on'),
    lived: T('一段人生', 'A life, lived'),
    notChosen: T('你沒有選擇、或只選擇了一部分的', 'What you did not choose, or chose only in part'),
    quietHelp: T('如果這段人生令你想起某個人，不妨今天打個電話給對方。想找人傾訴，精神健康支援熱線 18111 二十四小時有人接聽。', 'If this life brought someone to mind, perhaps call them today. If you would like to talk to someone, the 18111 mental health support hotline is answered 24 hours a day.'),
    others: T('同一天生日的其他人', 'The others who shared your birthday'),
    wrote: T('你寫下的', 'What you wrote'),
    wholeLife: T('整段人生，逐年細看', 'The whole life, year by year'),
    figure: T('背後的數字和出處', 'The figure behind it, and its source'),
    wholeLifeNote: (n) => T(`${n}件事，連同數字的出處`, `${n} moments, with the sources behind the figures`),
    atAge: (a) => T(`${a}歲時：`, `At ${a}: `),
    share: T('分享這段人生', 'Share this life'),
    saveCard: T('下載圖片', 'Save image'),
    copy: T('複製文字', 'Copy text'),
    copied: T('已複製。', 'Copied.'),
    sources: T('數字從哪裡來', 'Where the numbers come from'),
    usedSources: (n, m) => T(`這段人生用上了${m}個出處之中的${n}個。`, `This life drew on ${n} of the ${m} sources behind the simulation.`),
    again: T('再活一次', 'Live another life'),
    back: T('回到開始', 'Back to start'),
    helpLabel: T('支援', 'Support'),
    language: T('English', '中文'),
    languageName: T('Switch to English', '轉為中文'),
    methodTitle: T('數據和方法', 'About the numbers'),
    frameTitle: T('一個前提', 'One assumption above all'),
    assumeTitle: T('本作品的估計', 'What this piece estimates'),
    leftOutTitle: T('沒有包括的', 'What is left out'),
    creditTitle: T('關於這個作品', 'About this piece'),
    allSources: T('全部出處', 'All sources'),
    close: T('返回', 'Back'),
    cardTitle: T('65歲，在香港', 'Turning 65 in Hong Kong'),
    cardSame: T('同一天生日的人：', 'Same birthday:'),
    rollLabel: T('回看這段人生', 'Looking back on this life'),
    rollSkip: T('跳過', 'Skip'),
    rollHint: T('按一下看下一幕', 'Tap for the next scene'),
    rollSame: T('同一天踏入65歲的人', 'Turned 65 on the same day'),
    rollLived: (n, a) => T(`${n}：65–${a}`, `${n}: 65–${a}`),
    whoTitle: T('香港65歲或以上的長者', 'People aged 65 and over in Hong Kong'),
    whoNote: T('2021年人口普查，住在家庭住戶的長者。這裡的每段人生，都按這些比例設定。', '2021 census, older people living in households. Every life here is set up in these proportions.'),
    livesWith: T('與誰同住', 'Who they live with'),
    homes: T('住在哪類房屋', 'The homes they live in'),
    curveTitle: (sex) => T(`100位踏入65歲的${sex === 'F' ? '女性' : '男性'}，到了各個年齡，仍有多少人在世`, `Of 100 ${sex === 'F' ? 'women' : 'men'} turning 65, how many are still living at each age`),
    curveNote: T('按2023年香港生命表計算。把滑鼠移到圖上，或用方向鍵，可看每個年齡的數字。', 'From the 2023 Hong Kong life table. Hover over the chart, or use the arrow keys, to read each age.'),
    halfLabel: (a) => T(`約一半人活到${a}歲`, `About half reach ${a}`),
    tipLabel: (a, n) => T(`${a}歲：100人中約${n}人在世`, `At ${a}: about ${n} of 100 living`),
    curveAlt: (sex, name, age, n) => T(`曲線圖：100位踏入65歲的${sex === 'F' ? '女性' : '男性'}，隨年齡增長在世人數逐漸減少。${name}活到${age}歲；在這個年齡，100人中約有${n}人仍在世。`, `Line chart: of 100 ${sex === 'F' ? 'women' : 'men'} turning 65, the number still living falls with age. ${name} lived to ${age}; at that age about ${n} of 100 are still living.`),
    tableView: T('以表格顯示', 'Show as a table'),
    colAge: T('年齡', 'Age'),
    colAlive: T('100人中仍在世', 'Still living, of 100'),
    calTitle: T('模擬結果與公開數字對照', 'Simulated against the published figures'),
    calNote: (n) => T(`「模擬」一欄，是剛才在你的瀏覽器中模擬${n.toLocaleString()}段人生得出的。調校前已定下容許範圍：平均離世年齡上下0.5歲，其餘上下2至6個百分點。`, `The simulated column comes from ${n.toLocaleString()} lives run in your browser just now. Tolerances were fixed before any tuning: half a year for average age at death, 2 to 6 percentage points for the rest.`),
    calRunning: T('正在模擬……', 'Running the simulation…'),
    colMeasure: T('項目', 'Measure'),
    colPublished: T('公開數字', 'Published'),
    colSimulated: T('模擬', 'Simulated'),
    footer: T('獨立的個人項目，與任何機構無關。數字來自香港政府公開資料，以本作品自己的文字複述。', 'An independent personal project, not affiliated with any organisation. Figures come from Hong Kong Government publications, restated in this piece’s own words.'),
    todayTitle: T('估算：平均一天裡，香港到這個時候', 'An estimate: on an average day in Hong Kong, by this time'),
    turned65: T('人踏入65歲', 'people turn 65'),
    bornToday: T('個嬰兒出生', 'babies are born'),
    every65: (m) => T(`平均約每${m}分鐘，就有一人踏入65歲`, `On average, someone turns 65 about every ${m} minutes`),
    shareOver65: (n) => T(`香港每${n}個人之中，約有1個是65歲或以上（2026年年中臨時數字）。`, `About 1 in ${n} people in Hong Kong are 65 or over (mid-2026, provisional).`),
    todayNote: T('以上兩個數字是本作品的估算：把官方全年數字平均分到每一天、每一刻，並非實時統計，也不是今天真正發生的數目。', 'The two numbers above are this piece’s estimate: official yearly totals spread evenly over every day and minute. They are not a live count, and not what actually happened today.'),
    github: T('GitHub 上的程式碼和資料來源', 'Code and sources on GitHub'),
    countNote: T('本頁只記下兩個總數：有多少段人生開始了、多少段走到了結局。不用 cookie，也不會記下任何關於你的資料。', 'This page keeps two plain totals: how many lives are started and how many reach their end. It sets no cookies and records nothing about you.'),
    madeBy: T('製作：', 'Made by'),
    versionNote: (v) => T(`內容版本 ${v}`, `Content version ${v}`),
    heroAlt: T('像素插圖：黃昏時分，兩位長者在海旁散步。', 'Pixel picture: two older people walking by the waterfront at dusk.'),
  };

  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) n.append(k.nodeType ? k : String(t(k)));
    return n;
  };
  const sourceLink = (key) => {
    const s = sc.sources[key];
    return s ? el('a', { href: s.url, target: '_blank', rel: 'noopener' }, t(s.label)) : null;
  };
  const srcKeys = (e) => (e.src ? [].concat(e.src) : []);
  const ageText = (a) => (lang === 'zh' ? `${a}歲` : String(a));

  function footer() {
    let f = document.getElementById('foot');
    if (!f) { f = document.createElement('footer'); f.id = 'foot'; document.body.append(f); }
    f.replaceChildren(el('span', {}, t(UI.footer)), ' · ', el('button', { class: 'link', onclick: methodPage }, t(UI.method)),
      ...(REPO ? [' · ', el('a', { href: REPO, rel: 'noopener' }, t(UI.github))] : []));
  }

  function topBar() {
    setTimeout(footer, 0);
    return el('div', { class: 'topbar' },
      el('button', { class: 'link', onclick: () => go(intro) }, t(sc.title)),
      el('div', { class: 'row' },
        el('button', { class: 'link', onclick: methodPage }, t(UI.method)),
        el('button', { class: 'link', 'aria-label': t(UI.languageName), lang: lang === 'zh' ? 'en' : 'zh', onclick: switchLang }, t(UI.language))));
  }

  function switchLang() {
    lang = lang === 'zh' ? 'en' : 'zh';
    store.set('lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant-HK' : 'en';
    document.title = t(sc.title);
    if (screen) screen();
  }

  function go(fn) { screen = fn; app.dataset.screen = fn.name; stopAuto(); fn(); window.scrollTo(0, 0); }

  function intro() {
    screen = intro;
    const box = el('input', { type: 'checkbox', id: 'gentle', ...(gentle ? { checked: '' } : {}), onchange: (e) => { gentle = e.target.checked; store.set('gentle', gentle ? '1' : '0'); } });
    app.replaceChildren(topBar(),
      el('section', { class: 'hero' }, el('div', { class: 'heroText' },
        el('p', { class: 'kicker' }, t(UI.kicker)),
        el('h1', {}, t(sc.title)),
        el('p', { class: 'lede' }, t(sc.tagline)),
        el('p', { class: 'muted narrow' }, t(sc.intro)),
        el('div', { class: 'row', style: 'margin-top:20px' }, el('button', { class: 'primary big', onclick: begin }, t(UI.start))),
        el('label', { class: 'check', for: 'gentle' }, box, el('span', {}, t(UI.gentle))),
        el('p', { class: 'muted small narrow' }, t(UI.note)),
        todayPanel()),
        el('div', { id: 'heroScene', class: 'scene hero-scene' })),
      whoChart());
    if (window.Scenes) window.Scenes.show(document.getElementById('heroScene'), {
      key: 'hero', place: 'harbour', weather: 'dusk', cx: 120,
      people: [{ id: 'hero-a', role: 'elder', sex: 'F' }, { id: 'hero-b', role: 'elder', sex: 'M', hold: 'cane' }],
      caption: T('', ''), alt: UI.heroAlt,
    }, lang);
  }

  // Gently changing figures at Hong Kong's own scale:
  // counted from midnight Hong Kong time, from official yearly totals.
  let todayTimer;
  function todayPanel() {
    const d = sc.today;
    if (!d) return null;
    const n65 = el('strong', { class: 'tnum' }), nBorn = el('strong', { class: 'tnum' });
    const bar = el('span');
    const tick = (first) => {
      if (!first && !n65.isConnected) { clearInterval(todayTimer); return; } // left the opening screen
      const secs = ((Date.now() / 1000) + 8 * 3600) % 86400; // seconds since midnight in Hong Kong
      const sofar = (perYear) => (perYear / 365.25) * (secs / 86400);
      const a = sofar(d.turning65.perYear);
      n65.textContent = Math.floor(a).toLocaleString('en');
      nBorn.textContent = Math.floor(sofar(d.births.perYear)).toLocaleString('en');
      bar.style.width = `${((a % 1) * 100).toFixed(1)}%`;
    };
    clearInterval(todayTimer);
    todayTimer = setInterval(() => tick(false), 1000);
    const panel = el('div', { class: 'today' },
      el('p', { class: 'kicker' }, t(UI.todayTitle)),
      el('div', { class: 'tpair' },
        el('div', {}, n65, el('span', { class: 'small muted' }, t(UI.turned65))),
        el('div', {}, nBorn, el('span', { class: 'small muted' }, t(UI.bornToday)))),
      el('div', { class: 'tnext small muted' }, t(UI.every65((525960 / d.turning65.perYear).toFixed(1))), el('div', { class: 'cdbar', 'aria-hidden': 'true' }, bar)),
      el('p', { class: 'small' }, t(UI.shareOver65(Math.round(1 / d.shareOver65)))),
      el('p', { class: 'src small' }, t(UI.todayNote), ' ', sourceLink(d.turning65.src), ' · ', sourceLink(d.births.src)));
    tick(true);
    return panel;
  }

  function whoChart() {
    const hh = sc.households;
    const top = Math.max(...hh.arrangement.map((r) => r.share), ...hh.housing.map((r) => r.share));
    return el('section', { class: 'card who' },
      el('h2', {}, t(UI.whoTitle)),
      el('p', { class: 'muted small' }, t(UI.whoNote)),
      el('div', { class: 'two' },
        el('div', {}, el('h3', {}, t(UI.livesWith)), Charts.barList(hh.arrangement.map((r) => ({ label: t(r.label), share: r.share })), t(UI.livesWith), top)),
        el('div', {}, el('h3', {}, t(UI.homes)), Charts.barList(hh.housing.map((r) => ({ label: t(r.label), share: r.share })), t(UI.homes), top))),
      el('p', { class: 'src small' }, sourceLink(hh.src)));
  }

  function begin() {
    const seed = urlSeed ?? (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    me = new Life(sc, makeRng(seed), { gentle });
    companions = [1, 2, 3].map((i) => new Life(sc, makeRng(seed + i * 7919), { gentle }));
    focus = sc.focuses[0].id;
    reflections = [];
    me.scenes = {};
    count('life-started');
    go(birth);
  }

  function birth() {
    const s = me.s;
    app.replaceChildren(topBar(),
      el('p', { class: 'kicker' }, t(UI.today)),
      el('h1', {}, t(s.name)),
      el('p', { class: 'lede narrow' }, t(me.record[0].text)),
      el('div', { class: 'card narrow' },
        el('h2', {}, t(UI.whereFrom)),
        el('p', {}, t(sc.drawNote)),
        el('div', { class: 'fact' }, sourceLink('census_older'))),
      el('div', { class: 'card narrow' },
        el('h2', {}, t(UI.sameDay)),
        el('ul', { class: 'companions' }, companions.map((c) => el('li', {}, el('strong', {}, t(c.s.name)), ' · ', t(sc.summary(c.s))))),
        el('p', { class: 'muted small' }, t(UI.sameDayNote))),
      el('div', { class: 'row', style: 'margin-top:18px' }, el('button', { class: 'primary big', onclick: () => go(play) }, t(UI.begin))));
  }

  function play() {
    app.replaceChildren(topBar(),
      el('div', { class: 'playhead' },
        el('div', {}, el('div', { class: 'kicker' }, t(me.s.name)), el('div', { class: 'ageNum', id: 'age', 'aria-live': 'polite' })),
        el('div', { id: 'controls', class: 'controls', role: 'toolbar', 'aria-label': t(UI.controls) }),
        el('div', { id: 'yearbar', class: 'yearbar', 'aria-hidden': 'true' }, el('span'))),
      el('div', { class: 'grid' },
        el('div', { class: 'side' },
          el('div', { class: 'card' }, el('h2', {}, t(UI.focusOn)), el('p', { class: 'muted small' }, t(UI.focusNote)), el('div', { id: 'focus', class: 'row', role: 'group', 'aria-label': t(UI.focusOn) }), el('p', { id: 'focusOff', class: 'muted small', hidden: '' }, t(UI.focusOff))),
          el('div', { class: 'card' }, el('h2', {}, t(UI.howThings)), el('div', { id: 'stats' })),
          el('div', { class: 'card' }, el('h2', {}, t(UI.sameBirthday)), el('ul', { id: 'comp', class: 'companions' }))),
        el('div', { class: 'maincol' },
          el('div', { id: 'scene', class: 'scene' }),
          el('div', { class: 'card' }, el('h2', {}, t(UI.record)), el('ul', { id: 'rec', class: 'record', 'aria-live': 'polite' })))));
    render();
  }

  function renderControls() {
    const box = document.getElementById('controls');
    if (!box) return;
    box.replaceChildren(
      el('button', { id: 'next', class: 'primary', 'aria-pressed': String(!!autoTimer), onclick: togglePlay }, t(autoTimer ? UI.pauseBtn : UI.play)),
      el('div', { class: 'seg', role: 'group', 'aria-label': t(UI.speed) },
        [1, 2, 4].map((v) => el('button', { 'aria-pressed': String(speed === v), 'aria-label': `${t(UI.speed)} ${v}×`, onclick: () => setSpeed(v) }, `${v}×`))),
      el('button', { onclick: () => { stopAuto(); step(); } }, t(UI.oneYear)),
      el('button', { onclick: () => runUntil('choice') }, t(UI.nextChoice)),
      el('button', { onclick: () => runUntil('end') }, t(UI.toEnd)),
      el('button', { class: 'toggle', 'aria-pressed': String(decide), onclick: () => { decide = !decide; store.set('decide', decide ? '1' : '0'); renderControls(); } }, t(UI.decideForMe)),
      el('button', { class: 'toggle', 'aria-pressed': String(pausesOn), onclick: () => { pausesOn = !pausesOn; store.set('pauses', pausesOn ? '1' : '0'); renderControls(); } }, t(UI.pausesToggle)),
      ...(me.s.age === 65 && !autoTimer ? [el('p', { class: 'hint muted small' }, t(UI.playHint))] : []));
  }

  function render() {
    const s = me.s;
    renderControls();
    // In capture mode a year with a sourced fact shows that moment alone, with its own scene.
    let view = me.record, from = 0;
    if (capture && yearStart) {
      from = yearStart;
      const k = me.record.findIndex((e, i) => i >= yearStart && e.fact);
      if (k >= 0) { let j = k + 1; while (me.record[j] && me.record[j].follow) j++; view = me.record.slice(0, j); from = k; }
    }
    if (window.Scenes) window.Scenes.show(document.getElementById('scene'), sc.scene(s, view, lang), lang);
    document.getElementById('age').textContent = ageText(capAge ?? s.age);
    document.getElementById('focusOff').hidden = sc.focuses.every((x) => !x.ok || x.ok(s));
    document.getElementById('focus').replaceChildren(...sc.focuses.map((x) => {
      const ok = !x.ok || x.ok(s);
      if (!ok && focus === x.id) focus = sc.focuses[0].id;
      return el('button', { 'aria-pressed': String(focus === x.id), ...(ok ? {} : { disabled: '' }), onclick: () => { focus = x.id; render(); } }, t(x.label));
    }));
    document.getElementById('stats').replaceChildren(...Object.entries(sc.statLabels).map(([k, label]) =>
      el('div', { class: 'stat' },
        el('div', { class: 'row', style: 'justify-content:space-between' }, el('span', {}, t(label)), el('span', { class: 'muted' }, s.stats[k])),
        el('div', { class: 'bar', role: 'meter', 'aria-label': t(label), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(s.stats[k]) },
          el('span', { style: `width:${s.stats[k]}%;background:${COLORS[k]}` })))));
    document.getElementById('comp').replaceChildren(...companions.map((c) =>
      el('li', {}, el('strong', {}, t(c.s.name)), ' · ', c.dead ? el('span', { class: 'muted' }, t(UI.diedAt(c.s.age))) : `${ageText(c.s.age)}, ${t(sc.status(c.s))}`)));
    const rec = document.getElementById('rec');
    rec.replaceChildren(...view.slice(from).map((e, i) => entryView(e, !capture && i + from >= yearStart)).reverse());
  }

  // `inTimeline`: no age label (the year heads the group) and the fact box folds away.
  function entryView(e, fresh, inTimeline) {
    const cls = [e.follow ? 'follow' : '', e.kind === 'death' ? 'death' : '', fresh ? 'fresh' : ''].join(' ').trim();
    const fact = e.fact ? el('div', { class: 'fact' }, t(e.fact), ' ',
      el('span', { class: 'src' }, srcKeys(e).flatMap((k, i) => (i ? [' · ', sourceLink(k)] : [sourceLink(k)])))) : null;
    return el('li', { class: cls },
      e.follow || inTimeline ? null : el('span', { class: 'age' }, ageText(e.age)),
      t(e.text),
      e.chosen ? el('span', { class: 'muted' }, ` (${t(e.autoChosen ? UI.decidedForYou : UI.youChose)}${t(e.chosen)})`) : null,
      fact && inTimeline ? el('details', { class: 'factd' }, el('summary', {}, t(UI.figure)), fact) : fact,
      e.help ? el('div', { class: 'help' }, el('span', { class: 'helpTag' }, t(UI.helpLabel)), ' ', t(e.help)) : null);
  }

  function step() {
    if (me.dead || dlg.open) return;
    yearStart = me.record.length;
    me.liveYear(focus, false);
    settle();
  }

  // Resolve any choice this year raised, then finish the year.
  function settle() {
    while (me.pending) {
      if (!decide) { render(); return askChoice(me.pending, !!autoTimer); }
      autoChoose(me.pending);
    }
    afterYear();
  }

  function autoChoose(entry) {
    entry.autoChosen = true;
    me.choose(entry, me.rng.weighted(entry.choice.options, (o) => o.auto || 1));
  }

  // Companions catch up to the player's age once the player's year is settled.
  function catchUp() {
    for (const c of companions) while (!c.dead && c.s.age < me.s.age) c.liveYear(c.rng.pick(sc.focuses).id, true);
  }

  const pauseDue = () => pausesOn && sc.pauses[me.s.age] && !reflections.some((r) => r.age === me.s.age);

  // Keep each year's picture for the timeline on the ending screen.
  function snapYear() {
    if (!me.scenes) return;
    const lived = me.record.filter((e) => e.kind !== 'death');
    me.scenes[me.dead ? me.s.age : me.s.age - 1] = sc.scene(me.s, lived, lang);
    // Each moment's own picture, for the closing roll.
    lived.forEach((e, i) => { if (!e.pic && !e.follow) e.pic = sc.scene(me.s, lived.slice(0, i + 1), lang); });
  }

  function afterYear() {
    catchUp();
    snapYear();
    render();
    if (me.dead) { stopAuto(); return setTimeout(() => go(ending), 900); }
    if (pauseDue()) askPause(me.s.age, sc.pauses[me.s.age], !!autoTimer);
  }

  // Skip ahead: to the next choice (or pause), or straight to the end with the game deciding.
  function runUntil(mode) {
    stopAuto();
    if (me.dead || dlg.open) return;
    yearStart = me.record.length;
    for (let i = 0; i < 60 && !me.dead; i++) {
      me.liveYear(focus, false);
      if (me.pending && mode === 'choice' && !decide) { render(); return askChoice(me.pending, false); }
      while (me.pending) autoChoose(me.pending);
      catchUp();
      snapYear();
      if (me.dead) break;
      if (mode === 'choice' && pauseDue()) { render(); return askPause(me.s.age, sc.pauses[me.s.age], false); }
    }
    render();
    if (me.dead) setTimeout(() => go(ending), 600);
  }

  // A visible countdown that ends in `done`; any click or keypress inside the dialog stops it.
  function startCountdown(secs, label, done) {
    clearCountdown();
    const line = el('p', { class: 'countdown muted small', role: 'status' });
    const bar = el('div', { class: 'cdbar' }, el('span'));
    const end = Date.now() + secs * 1000;
    const tick = () => {
      const left = Math.max(0, end - Date.now());
      line.textContent = t(label(Math.ceil(left / 1000)));
      bar.firstChild.style.width = `${(left / (secs * 1000)) * 100}%`;
      if (left <= 0) { clearCountdown(); done(); }
    };
    countdown = setInterval(tick, 100);
    tick();
    const stop = () => { clearCountdown(); line.remove(); bar.remove(); };
    cdAbort = new AbortController();
    dlg.addEventListener('keydown', stop, { signal: cdAbort.signal });
    dlg.addEventListener('input', stop, { signal: cdAbort.signal });
    return [line, bar];
  }
  function clearCountdown() { clearInterval(countdown); countdown = null; if (cdAbort) { cdAbort.abort(); cdAbort = null; } }

  function closeDlg() { clearCountdown(); if (dlg.open) dlg.close(); }

  function askChoice(entry, timed) {
    dlgKind = 'choice'; seenTo = me.record.length;
    const pick = (o) => { closeDlg(); me.choose(entry, o); settle(); };
    const letGame = () => { decide = true; store.set('decide', '1'); closeDlg(); autoChoose(entry); settle(); };
    const timer = timed ? startCountdown(Math.max(12, 25 / speed), UI.autoIn, () => { closeDlg(); autoChoose(entry); settle(); }) : [];
    dlg.replaceChildren(...[
      el('p', { class: 'kicker' }, lang === 'zh' ? ageText(me.s.age) : `Age ${me.s.age}`),
      el('p', {}, t(entry.text)),
      entry.fact ? el('div', { class: 'fact' }, t(entry.fact)) : null,
      entry.help ? el('div', { class: 'help' }, t(entry.help)) : null,
      el('h2', { style: 'margin-top:14px' }, t(entry.choice.prompt)),
      el('div', { class: 'choices' }, entry.choice.options.map((o) => el('button', { onclick: () => pick(o) }, t(o.label)))),
      ...timer,
      el('button', { class: 'link', onclick: letGame }, t(UI.letGameDecide)),
    ].filter(Boolean));
    if (!dlg.open) dlg.showModal();
  }

  function askPause(age, q, timed) {
    dlgKind = 'pause'; seenTo = me.record.length;
    const ta = el('textarea', { 'aria-label': t(q), placeholder: t(UI.pauseHint), spellcheck: 'false', autocomplete: 'off' });
    const done = () => { reflections.push({ age, q, a: ta.value.trim() }); closeDlg(); };
    const timer = timed ? startCountdown(Math.max(15, 30 / speed), UI.goOnIn, done) : [];
    dlg.replaceChildren(
      el('p', { class: 'kicker' }, t(UI.pause)),
      el('h2', {}, t(q)),
      ta,
      ...timer,
      el('div', { class: 'row', style: 'margin-top:10px' }, el('button', { class: 'primary', onclick: done }, t(UI.carryOn))));
    if (!dlg.open) dlg.showModal();
  }

  // Escape carries on from a pause; a choice needs an answer (or the game's).
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    if (dlgKind === 'pause') dlg.querySelector('.row button.primary')?.click();
  });

  function yearMs(from = yearStart || 0) {
    const text = me.record.slice(from).map((e) => `${t(e.text) || ''} ${e.fact ? t(e.fact) : ''}`).join(' ');
    const secs = lang === 'zh' ? text.replace(/\s/g, '').length / 4.5 : text.split(/\s+/).filter(Boolean).length / 3;
    return (BEAT_MS + secs * 1000) / speed;
  }
  // After a dialog closes, only the text added since it opened (a choice's outcome) still needs
  // reading time; the rest was read in or behind the dialog.
  let waited = false, seenTo = 0;
  // `bar` false: waiting on a dialog, so the progress line stays empty.
  function schedule(ms = yearMs(), bar = true) {
    clearTimeout(autoTimer); autoTimer = setTimeout(playTick, ms);
    const line = document.querySelector('#yearbar span');
    if (!line) return;
    line.getAnimations().forEach((a) => a.cancel());
    if (bar) line.animate([{ width: '0%' }, { width: '100%' }], { duration: ms, fill: 'forwards' });
  }
  function playTick() {
    if (!autoTimer || me.dead) return;
    if (dlg.open) { waited = true; return schedule(500, false); }
    if (waited) { waited = false; return schedule(yearMs(seenTo)); }
    step();
    if (autoTimer && !me.dead && !dlg.open) schedule(); else if (autoTimer && dlg.open) { waited = true; schedule(500, false); }
  }
  function togglePlay() {
    if (autoTimer) return stopAuto();
    autoTimer = -1; // playing; the first year starts now
    renderControls();
    step();
    if (autoTimer) { waited = dlg.open; if (dlg.open) schedule(500, false); else schedule(); }
  }
  function setSpeed(v) {
    speed = v;
    if (autoTimer && autoTimer !== -1) schedule();
    renderControls();
  }
  function stopAuto() {
    clearTimeout(autoTimer); autoTimer = null;
    document.querySelector('#yearbar span')?.getAnimations().forEach((a) => a.cancel());
    renderControls();
  }

  function ending() {
    if (!me.counted) { me.counted = true; count('life-finished'); }
    for (const c of companions) c.autoLive();
    const s = me.s;
    const death = me.record.find((e) => e.kind === 'death');
    const used = new Set(me.record.flatMap(srcKeys));
    const shareText = () => [
      `${t(UI.cardTitle)} · ${t(s.name)} · 65–${s.age}`,
      t(sc.summary(s)),
      `${t(UI.cardSame)} ${companions.map((c) => `${t(c.s.name)} (${c.s.age})`).join(lang === 'zh' ? '、' : ', ')}`,
    ].join('\n');
    app.replaceChildren(...[topBar(),
      el('p', { class: 'kicker' }, t(UI.lived)),
      el('h1', {}, `${t(s.name)}${lang === 'zh' ? '　' : ', '}65–${s.age}`),
      death ? el('p', { class: 'lede narrow' }, t(death.text)) : null,
      death && death.help ? el('div', { class: 'help narrow' }, t(death.help)) : null,
      ...sc.epilogue(s).map((l) => el('p', { class: 'narrow' }, t(l))),
      el('div', { class: 'card narrow' }, el('h2', {}, t(UI.notChosen)), el('ul', { class: 'plain' }, sc.notChosen(s).map((l) => el('li', {}, t(l))))),
      timeline(),
      curveCard(s),
      el('div', { class: 'help narrow' }, t(UI.quietHelp)),
      el('div', { class: 'card narrow' },
        el('h2', {}, t(UI.others)),
        el('ul', { class: 'companions' }, companions.map((c) => el('li', {}, el('strong', {}, t(c.s.name)), ' · ', `65–${c.s.age}`, ' · ', t(sc.summary(c.s)))))),
      reflections.some((r) => r.a) ? el('div', { class: 'card narrow' },
        el('h2', {}, t(UI.wrote)), ...reflections.filter((r) => r.a).map((r) => el('p', {}, el('span', { class: 'muted' }, t(UI.atAge(r.age))), r.a))) : null,
      el('div', { class: 'card narrow' },
        el('h2', {}, t(UI.share)),
        el('canvas', { id: 'card', width: '1200', height: '630', role: 'img', 'aria-label': shareText() }),
        el('div', { class: 'row', style: 'margin-top:10px' },
          el('button', { class: 'primary', onclick: saveCard }, t(UI.saveCard)),
          el('button', { onclick: () => navigator.clipboard && navigator.clipboard.writeText(shareText()).then(() => { document.getElementById('copied').textContent = t(UI.copied); }) }, t(UI.copy)),
          el('span', { id: 'copied', class: 'muted', role: 'status' }))),
      el('div', { class: 'card narrow' },
        el('h2', {}, t(UI.sources)),
        el('p', { class: 'muted' }, t(UI.usedSources(used.size, Object.keys(sc.sources).length))),
        el('ul', { class: 'sources' }, [...used].map((k) => el('li', {}, sourceLink(k)))),
        el('button', { class: 'link', onclick: methodPage }, t(UI.method))),
      el('div', { class: 'row' }, el('button', { class: 'primary big', onclick: begin }, t(UI.again)), el('button', { onclick: () => go(intro) }, t(UI.back))),
    ].filter(Boolean));
    drawCard();
    if (!capture && !me.rolled) { me.rolled = true; roll(); }
  }

  // The closing roll: when a life ends, its key moments return one picture at a time, then the
  // people born the same day, before the ending page. Any tap moves on; Skip or Escape ends it.
  function roll() {
    const s = me.s, all = me.record.filter((e) => !e.follow && e.kind !== 'start' && e.kind !== 'death' && e.pic);
    // Heavy moments and choices first, then moments spread evenly across the years, at most two a
    // year and never the same line twice; about ten in all.
    const picks = new Set(), texts = new Set(), perAge = {};
    const add = (e) => {
      if (!e || picks.has(e) || texts.has(t(e.text)) || (perAge[e.age] || 0) >= 2) return;
      picks.add(e); texts.add(t(e.text)); perAge[e.age] = (perAge[e.age] || 0) + 1;
    };
    all.filter((e) => e.heavy || e.choice).slice(0, 5).forEach(add);
    const spread = (list, n) => { for (let k = 0; k < n; k++) add(list[Math.round((k + 0.5) / n * (list.length - 1))]); };
    spread(all.filter((e) => !e.daily), 4);
    spread(all.filter((e) => e.daily), 3);
    const death = me.record.find((e) => e.kind === 'death');
    const slides = [
      { pic: me.record[0].pic, title: t(s.name), text: t(sc.summary(s)) },
      ...me.record.filter((e) => picks.has(e)).map((e) => ({ pic: e.pic, age: e.age, text: t(e.text) })),
      ...(death ? [{ pic: sc.scene(s, me.record, lang), age: s.age, text: t(death.text) }] : []),
      { pic: me.record[0].pic, title: t(UI.rollSame), lines: companions.map((c) => t(UI.rollLived(t(c.s.name), c.s.age))) },
    ];
    const stage = el('div', { class: 'rslide' });
    const skip = el('button', { class: 'rskip' }, t(UI.rollSkip));
    const box = el('div', { class: 'roll', role: 'dialog', 'aria-modal': 'true', 'aria-label': t(UI.rollLabel) }, stage, skip, el('p', { class: 'rhint' }, t(UI.rollHint)));
    let i = -1, timer = null;
    const reading = (x) => (lang === 'zh' ? x.replace(/\s/g, '').length / 4.5 : x.split(/\s+/).length / 3);
    const finish = () => { clearTimeout(timer); document.removeEventListener('keydown', onKey); box.remove(); document.body.style.overflow = ''; document.querySelector('h1')?.focus?.(); };
    const next = () => {
      clearTimeout(timer);
      if (++i >= slides.length) return finish();
      const sl = slides[i], pic = el('div', { class: 'rpic' });
      stage.replaceChildren(pic,
        sl.title ? el('p', { class: 'rtitle' }, sl.title) : el('p', { class: 'rage' }, ageText(sl.age)),
        ...(sl.text ? [el('p', { class: 'rtext' }, sl.text)] : []),
        ...(sl.lines ? [el('ul', { class: 'rlines' }, sl.lines.map((l) => el('li', {}, l)))] : []));
      if (window.Scenes && sl.pic) window.Scenes.show(pic, sl.pic, lang);
      stage.classList.remove('in'); void stage.offsetWidth; stage.classList.add('in');
      timer = setTimeout(next, 3500 + reading(sl.text || (sl.lines || []).join(' ')) * 1000);
    };
    const onKey = (e) => { if (e.key === 'Escape') finish(); else if ([' ', 'Enter', 'ArrowRight'].includes(e.key) && e.target === document.body) { e.preventDefault(); next(); } };
    skip.addEventListener('click', (e) => { e.stopPropagation(); finish(); });
    box.addEventListener('click', next);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    document.body.append(box);
    skip.focus();
    next();
  }

  // The life again, one row a year: that year's picture beside what happened, oldest first,
  // for anyone who let the years play past.
  function timeline() {
    const years = [];
    for (const e of me.record) {
      const y = years[years.length - 1];
      if (y && y.age === e.age) y.entries.push(e); else years.push({ age: e.age, entries: [e] });
    }
    // On a wide screen one large picture stays beside the list and follows the year being read,
    // as on the play screen; on a phone each year carries its own picture.
    const wide = window.matchMedia('(min-width: 900px)').matches;
    const pics = window.Scenes && me.scenes ? me.scenes : {};
    const big = el('div', { class: 'scene' }), bigAge = el('p', { class: 'tlage' });
    const show = (age) => { if (pics[age]) { window.Scenes.show(big, pics[age], lang); bigAge.textContent = ageText(age); } };
    const rows = years.map((y) => {
      const pic = el('div', { class: 'yscene' });
      if (!wide && pics[y.age]) window.Scenes.show(pic, pics[y.age], lang);
      return el('li', { class: 'yrow', 'data-age': String(y.age) }, el('h3', { class: 'yage' }, ageText(y.age)), wide ? null : pic,
        el('ul', { class: 'record' }, y.entries.map((e) => entryView(e, false, true))));
    });
    if (wide) {
      show(years[0].age);
      rows[0].classList.add('on');
      const io = new IntersectionObserver((seen) => {
        for (const x of seen) {
          if (!x.isIntersecting) continue;
          rows.forEach((r) => r.classList.toggle('on', r === x.target));
          show(Number(x.target.dataset.age));
        }
      }, { rootMargin: '-40% 0px -55% 0px' });
      rows.forEach((r) => io.observe(r));
    }
    return el('section', { class: 'card story' },
      el('h2', {}, t(UI.wholeLife)),
      el('p', { class: 'muted small' }, t(UI.wholeLifeNote(me.record.filter((e) => !e.follow).length))),
      el('div', { class: wide ? 'tl wide' : 'tl' },
        wide ? el('div', { class: 'tlpic', 'aria-hidden': 'true' }, big, bigAge) : null,
        el('ol', { class: 'years' }, rows)));
  }

  function curveCard(s) {
    const pts = sc.survival(s.sex);
    const at = (a) => Math.round((pts.find((p) => p.age === a) || pts[pts.length - 1]).alive);
    return el('div', { class: 'card narrow' },
      el('h2', {}, t(UI.curveTitle(s.sex))),
      Charts.survival(pts, {
        mark: { age: s.age, label: `${t(s.name)}, ${s.age}` },
        alt: t(UI.curveAlt(s.sex, t(s.name), s.age, at(s.age))),
        halfLabel: (a) => t(UI.halfLabel(a)), tipLabel: (a, n) => t(UI.tipLabel(a, n)),
        tableLabel: t(UI.tableView), colAge: t(UI.colAge), colAlive: t(UI.colAlive),
        narrow: window.matchMedia('(max-width: 600px)').matches,
      }),
      el('p', { class: 'muted small' }, t(UI.curveNote), ' ', sourceLink('lifetable')));
  }

  // The share card never names a cause of death or any illness.
  function drawCard() {
    const cv = document.getElementById('card');
    if (!cv || !cv.getContext) return;
    const g = cv.getContext('2d');
    const s = me.s;
    const serif = lang === 'zh' ? '"Noto Serif TC", "PMingLiU", serif' : 'Georgia, serif';
    const sans = lang === 'zh' ? '"Noto Sans TC", "Microsoft JhengHei", sans-serif' : '"Segoe UI", system-ui, sans-serif';
    g.fillStyle = '#f6f2ea'; g.fillRect(0, 0, 1200, 630);
    g.fillStyle = '#a33b2b'; g.fillRect(0, 0, 18, 630);
    // A calm picture on the right: the waterfront at dusk. Never an illness or a hospital.
    if (window.Scenes) {
      const fig = (id, sex) => ({ id, role: 'elder', sex, skin: window.Scenes.SKIN[s.chinese ? t(s.name).length % 2 : 2] });
      const people = [fig(`me-${s.name.en}`, s.sex)];
      if (s.marital === 'married' || s.flags.widowed) people.push(fig(`sp-${s.name.en}`, s.sex === 'M' ? 'F' : 'M'));
      window.Scenes.still(g, { key: 'card', place: 'harbour', weather: 'dusk', people, cx: 100 }, 590, 70, 3);
      g.strokeStyle = '#e3dccd'; g.lineWidth = 2; g.strokeRect(590, 70, 600, 216);
    }
    g.fillStyle = '#6f675b'; g.font = `26px ${sans}`; g.fillText(t(UI.cardTitle), 70, 92);
    g.fillStyle = '#23201b'; g.font = `bold 56px ${serif}`; g.fillText(t(s.name), 70, 180, 500);
    g.font = `56px ${serif}`; g.fillText(`65 – ${s.age}`, 70, 268);
    g.font = `26px ${sans}`; g.fillStyle = '#23201b';
    wrap(g, t(sc.summary(s)), 70, 340, 490, 36);
    g.fillStyle = '#6f675b'; g.font = `24px ${sans}`;
    g.fillText(t(UI.cardSame), 590, 340);
    g.fillStyle = '#23201b'; g.font = `26px ${sans}`;
    companions.forEach((c, i) => g.fillText(`${t(c.s.name)}  65 – ${c.s.age}`, 590, 384 + i * 40));
    g.fillStyle = '#6f675b'; g.font = `22px ${sans}`;
    g.fillText(t(UI.kicker), 70, 590);
  }
  function wrap(g, text, x, y, w, lh) {
    const units = lang === 'zh' ? [...text] : text.split(' ');
    let line = '';
    for (const u of units) {
      const test = line ? (lang === 'zh' ? line + u : `${line} ${u}`) : u;
      if (g.measureText(test).width > w && line) { g.fillText(line, x, y); y += lh; line = u; } else line = test;
    }
    if (line) g.fillText(line, x, y);
  }
  function saveCard() {
    const cv = document.getElementById('card');
    const a = el('a', { href: cv.toDataURL('image/png'), download: 'one-hong-kong-life.png' });
    document.body.append(a); a.click(); a.remove();
  }

  function methodPage() {
    if (screen !== methodPage) returnTo = screen;
    screen = methodPage;
    app.dataset.screen = 'methodPage';
    stopAuto();
    const m = sc.method;
    const section = (title, ...kids) => el('div', { class: 'card narrow' }, el('h2', {}, t(title)), ...kids);
    app.replaceChildren(topBar(),
      el('h1', {}, t(UI.methodTitle)),
      section(T('數字', 'The numbers'), el('p', {}, t(m.data))),
      section(UI.frameTitle, el('p', {}, t(m.frame))),
      section(UI.calTitle, el('div', { id: 'calib' }, el('p', { class: 'muted' }, t(UI.calRunning)))),
      section(UI.assumeTitle, el('ul', { class: 'plain' }, m.assumptions.map((a) => el('li', {}, t(a))))),
      section(UI.leftOutTitle, el('p', {}, t(m.leftOut))),
      section(UI.allSources, el('ul', { class: 'sources' }, Object.keys(sc.sources).map((k) => el('li', {}, sourceLink(k))))),
      section(UI.creditTitle, ...m.credits.map((c) => el('div', { class: 'credit' }, el('h3', {}, t(c.title)), el('p', {}, t(c.text)))),
        COUNTER ? el('p', { class: 'muted small' }, t(UI.countNote)) : null,
        AUTHOR ? el('p', {}, t(UI.madeBy), ' ', el('a', { href: AUTHOR_URL, rel: 'noopener' }, AUTHOR)) : null,
        el('p', { class: 'muted small' }, t(UI.versionNote(sc.version)), REPO ? [' · ', el('a', { href: REPO, rel: 'noopener' }, t(UI.github))] : null)),
      el('button', { class: 'primary', onclick: () => go(returnTo || intro) }, t(UI.close)));
    window.scrollTo(0, 0);
    setTimeout(calibTable, 30);
  }

  // The same calibration the build tools run, on fixed seeds, in the reader's browser.
  let calibCache = null;
  const CALIB_N = 3000;
  function calibTable() {
    const box = document.getElementById('calib');
    if (!box) return;
    if (!calibCache) {
      const lives = [];
      for (let i = 0; i < CALIB_N; i++) {
        const L = new Life(sc, makeRng((i + 1) * 2654435761), {});
        const years = [];
        while (!L.dead) {
          const s = L.s;
          years.push({ age: s.age, sex: s.sex, widowed: s.marital === 'widowed' || !!s.flags.widowed, flags: { ...s.flags } });
          L.liveYear(L.rng.pick(sc.focuses).id, true);
        }
        lives.push({ sex: L.s.sex, ageAtDeath: L.s.age, years });
      }
      calibCache = sc.calibrate(lives);
    }
    const f = (r, v) => (typeof v !== 'number' ? t(v) : r.fmt === 'yrs' ? v.toFixed(1) : `${(100 * v).toFixed(1)}%`);
    box.replaceChildren(
      el('p', { class: 'muted small' }, t(UI.calNote(CALIB_N))),
      el('div', { class: 'tablewrap' }, el('table', { class: 'calib' },
        el('thead', {}, el('tr', {}, el('th', {}, t(UI.colMeasure)), el('th', {}, t(UI.colPublished)), el('th', {}, t(UI.colSimulated)))),
        el('tbody', {}, calibCache.map((r) => el('tr', {}, el('th', { scope: 'row' }, t(r.label), ' ', el('span', { class: 'src' }, sourceLink(r.src))), el('td', {}, f(r, r.official)), el('td', {}, f(r, r.sim))))))));
  }

  document.documentElement.lang = lang === 'zh' ? 'zh-Hant-HK' : 'en';
  document.title = t(sc.title);
  // ?capture=N: live up to and including age N with the game deciding, then show that year.
  function captureAt(age) {
    begin(); go(play);
    while (!me.dead && me.s.age <= age) {
      yearStart = me.record.length;
      me.liveYear(focus, false);
      while (me.pending) autoChoose(me.pending);
      catchUp();
      snapYear();
    }
    render();
  }

  if (capAge !== null) captureAt(capAge); else go(intro);
})();
