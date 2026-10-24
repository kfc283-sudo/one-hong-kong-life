// Scenario: "Turning 65 in Hong Kong" (v1 slice: every event that carries a fact, a choice,
// a heavy moment or a support pairing, plus a first set of everyday moments).
//
// Text is { zh, en }. Every fact names its sources by key (SOURCES). Modelling choices that are
// not published figures are marked ASSUMPTION and listed on the method page.
// Frame: today's rates, allowances and services are held constant for the whole life.

window.SCENARIO = (() => {
  const T = (zh, en) => ({ zh, en });

  const SOURCES = {
    pop_age: { label: T('政府統計處：按性別及年齡劃分的人口（表110-01002，2026年年中臨時數字）', 'C&SD, Population by sex and age (Table 110-01002, mid-2026 provisional)'), url: 'https://www.censtatd.gov.hk/en/web_table.html?id=110-01002' },
    vital: { label: T('政府統計處：生命事件（表115-01011，2025年數字）', 'C&SD, Vital events (Table 115-01011, 2025 figures)'), url: 'https://www.censtatd.gov.hk/en/web_table.html?id=115-01011' },
    census_older: { label: T('政府統計處《2021年人口普查主題性報告：長者》', 'C&SD, 2021 Population Census Thematic Report: Older Persons'), url: 'https://www.census2021.gov.hk/doc/pub/21c-older-persons.pdf' },
    census_alone: { label: T('政府統計處《2021年人口普查主題性報告：單人住戶》', 'C&SD, 2021 Population Census Thematic Report: One-person Households'), url: 'https://www.census2021.gov.hk/doc/pub/21c-One-Person-Households.pdf' },
    cssa: { label: T('立法會財務委員會文件：社會保障金額調整 (2026年2月)', 'LegCo Finance Committee paper on social security rate adjustments (Feb 2026)'), url: 'https://www.legco.gov.hk/yr2026/english/fc/fc/papers/f25-51e.pdf' },
    census_snapshot: { label: T('政府統計處《2021年人口普查：長者》簡報', 'C&SD, 2021 Population Census snapshot: Older Persons'), url: 'https://www.census2021.gov.hk/doc/pub/21C_Articles_Older_Persons.pdf' },
    lifetable: { label: T('政府統計處：香港生命表（表115-01021，2023年數字）', 'C&SD, Hong Kong life tables (Table 115-01021, 2023 figures)'), url: 'https://www.censtatd.gov.hk/en/web_table.html?id=115-01021' },
    ths84: { label: T('政府統計處《主題性住戶統計調查報告書第84號》(2026)', 'C&SD, Thematic Household Survey Report No. 84 (2026)'), url: 'https://www.censtatd.gov.hk/wbr/B1130201/B11302012026XX01/att/en/B11302012026XX01.pdf' },
    ths87: { label: T('政府統計處《主題性住戶統計調查報告書第87號》(2026)', 'C&SD, Thematic Household Survey Report No. 87 (2026)'), url: 'https://www.censtatd.gov.hk/wbr/B1130201/B11302012026XX04/att/en/B11302012026XX04.pdf' },
    phs: { label: T('衞生署《2020-22年度人口健康調查》', 'Department of Health, Population Health Survey 2020-22'), url: 'https://www.chp.gov.hk/files/pdf/dh_phs_2020-22_part_1_report_eng_rectified.pdf' },
    ehs_falls: { label: T('衞生署長者健康服務：預防跌倒', 'Department of Health, Elderly Health Service: Fall Prevention'), url: 'https://www.elderly.gov.hk/english/healthy_ageing/healthy_living/falls.html' },
    injury_survey: { label: T('衞生署《2018年非故意損傷調查報告》', 'Department of Health, Report of Unintentional Injury Survey 2018'), url: 'https://www.chp.gov.hk/files/pdf/report_of_unintentional_injury_survey_2018_en.pdf' },
    cataract: { label: T('立法會答覆：白內障手術 (2024年11月)', 'LegCo reply on cataract surgery (Nov 2024)'), url: 'https://www.info.gov.hk/gia/general/202411/20/P2024112000464.htm' },
    cataract_annex: { label: T('立法會答覆附件：白內障手術數字 (2024年7月)', 'LegCo reply annex on cataract surgery (Jul 2024)'), url: 'https://gia.info.gov.hk/general/202407/03/P2024070300235_463490_1_1719980442261.pdf' },
    dementia_0506: { label: T('衞生署／中文大學 長者認知障礙症患病率研究 (約2005年數據)', 'DH/CUHK study on the prevalence of dementia (data from about 2005)'), url: 'https://www.elderlycommission.gov.hk/wp-content/uploads/2024/03/Study-on-Prevalence-of-dementia.pdf' },
    str63: { label: T('政府統計處《專題報告書第63號：殘疾人士及長期病患者》', 'C&SD, Special Topics Report No. 63: Persons with Disabilities and Chronic Diseases'), url: 'https://www.censtatd.gov.hk/en/data/stat_report/product/C0000055/att/B11301632021XXXXB0100.pdf' },
    swd_cwl: { label: T('社會福利署：資助長者院舍照顧服務輪候冊統計 (2026年9月30日)', 'SWD, waiting list for subsidised residential care for the elderly (30 Sep 2026)'), url: 'https://www.swd.gov.hk/storage/asset/section/1022/en/CWL/LTC%20statistics_HP-EN(202609).pdf' },
    swd_rates: { label: T('社會福利署：公共福利金計劃金額 (2026年2月1日起)', 'SWD, Social Security Allowance rates (from 1 Feb 2026)'), url: 'https://www.swd.gov.hk/en/pubsvc/socsecu/ssallowance/ssa_amt/ssa_amt_all/index.html' },
    oala_limits: { label: T('社會福利署：長者生活津貼入息及資產限額', 'SWD, Old Age Living Allowance income and asset limits'), url: 'https://www.swd.gov.hk/en/pubsvc/socsecu/ssallowance/ssaec/ssaec_oala/ssaec_oala_limit/' },
    hcv: { label: T('長者醫療券計劃', 'Elderly Health Care Voucher Scheme'), url: 'https://www.hcv.gov.hk/en/hcvs/service_area.html' },
    fare: { label: T('政府新聞公報：$2計劃安排 (2026年3月)', 'Government press release on the $2 Scheme (Mar 2026)'), url: 'https://www.info.gov.hk/gia/general/202603/23/P2026032300140.htm' },
    labour: { label: T('立法會答覆：長者勞動人口 (2025年2月) 附件', 'LegCo reply on the elderly labour force (Feb 2025), annex'), url: 'https://gia.info.gov.hk/general/202502/26/P2025022600229_486973_1_1740544551359.pdf' },
    epem: { label: T('勞工處：中高齡就業計劃', 'Labour Department, Employment Programme for the Elderly and Middle-aged'), url: 'https://www1.jobs.gov.hk/0/en/information/epem/' },
    mpf_balances: { label: T('立法會答覆：按年齡劃分的強積金累算權益 (2025年7月)', 'LegCo reply on MPF accrued benefits by age (Jul 2025)'), url: 'https://www.info.gov.hk/gia/general/202507/02/P2025070200351.htm' },
    mpfa: { label: T('積金局文章：強積金結餘 (2025年8月)', 'MPFA article on MPF balances (Aug 2025)'), url: 'https://www.mpfa.org.hk/en/info-centre/publications-articles/mpfa-articles/2025_8_13' },
    ha_fees: { label: T('政府新聞公報：醫管局推行公營醫療收費改革 (2025年12月)', 'Government press release: HA public healthcare fees and charges reform (Dec 2025)'), url: 'https://www.info.gov.hk/gia/general/202512/29/P2025122900406.htm' },
    gd_scheme: { label: T('政府新聞公報：廣東計劃及福建計劃 (2025年9月)', 'Government press release on the Guangdong and Fujian Schemes (Sep 2025)'), url: 'https://www.info.gov.hk/gia/general/202509/25/P2025092500616.htm' },
    carers: { label: T('社會福利署：低收入家庭護老者生活津貼', 'SWD, Living Allowance for Carers of Elderly Persons from Low-income Families'), url: 'https://www.swd.gov.hk/en/pubsvc/elderly/cat_careersupp/allowanceforcarersoftheelderly/' },
    centres: { label: T('立法會答覆：長者中心 (2024年10月)', 'LegCo reply on elderly centres (Oct 2024)'), url: 'https://www.info.gov.hk/gia/general/202410/23/P2024102300354.htm' },
    elder_academy: { label: T('安老事務委員會：長者學苑計劃', 'Elderly Commission, Elder Academy Scheme'), url: 'https://www.elderlycommission.gov.hk/elder-academy/' },
    adaptations: { label: T('立法會答覆：長者友善居住環境 (2026年6月)', 'LegCo reply on an elderly-friendly living environment (Jun 2026)'), url: 'https://www.info.gov.hk/gia/general/202606/03/P2026060300334.htm' },
  };

  // Help lines shown beside heavy moments (checked 2026-10-22 on the providers' own pages and the
  // government's Shall We Talk portal).
  const HELP = {
    talk: T('想找人傾訴？精神健康支援熱線 18111，24小時免費接聽。', 'Want to talk to someone? The 18111 mental health support hotline is free and open 24 hours.'),
    carer: T('照顧者支援專線 182 183，24小時有社工接聽。', 'The carer support hotline 182 183 is answered by social workers, 24 hours a day.'),
    family: T('家人可致電照顧者支援專線 182 183，24小時有社工接聽。', 'Family members can call the carer support hotline 182 183, answered by social workers 24 hours a day.'),
    elder: T('擔心長者安全？社會福利署熱線 2343 2255。', 'Worried about an older person\'s safety? SWD hotline 2343 2255.'),
    scam: T('懷疑受騙？「防騙易」熱線 18222。', 'Think you are being scammed? The Anti-Scam Helpline is 18222.'),
  };

  // Probability of dying between exact age x and x+1, ages 65..99 (C&SD life table 2023).
  // Age 100+ is an open interval in the table; we use 1 - exp(-1/e100).
  const QX = {
    M: [0.00944, 0.01022, 0.01105, 0.01197, 0.01304, 0.01431, 0.01586, 0.01771, 0.0199, 0.02244, 0.02533, 0.02852, 0.032, 0.03574, 0.0397, 0.04388, 0.04827, 0.05287, 0.05766, 0.06264, 0.06813, 0.07416, 0.0808, 0.08811, 0.09616, 0.10503, 0.1148, 0.12557, 0.13743, 0.15049, 0.16487, 0.18069, 0.19809, 0.2172, 0.23816],
    F: [0.00433, 0.00468, 0.00507, 0.00553, 0.00608, 0.00673, 0.00749, 0.00839, 0.00946, 0.01074, 0.01226, 0.01405, 0.01612, 0.0185, 0.02117, 0.02416, 0.02746, 0.03107, 0.03499, 0.0392, 0.0439, 0.04914, 0.05496, 0.06145, 0.06865, 0.07665, 0.08551, 0.09532, 0.10618, 0.11816, 0.13136, 0.1459, 0.16186, 0.17936, 0.1985],
    open: { M: 0.31, F: 0.27 },
  };
  const qx = (sex, age) => (age >= 100 ? QX.open[sex] : QX[sex][Math.max(0, age - 65)]);

  // Prevalence curves: linear between the midpoints of published age bands.
  const curve = (pts) => (a) => {
    if (a <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [a1, p1] = pts[i];
      if (a <= a1) { const [a0, p0] = pts[i - 1]; return p0 + ((p1 - p0) * (a - a0)) / (a1 - a0); }
    }
    return pts[pts.length - 1][1];
  };
  const onset = (prev, a) => Math.max(0, (prev(a + 1) - prev(a)) / (1 - prev(a)));
  // Dementia shortens life (see mortality), so a plain onset rate would leave too few people with
  // dementia among the living. This onset rate is solved so that, after this year's deaths, the
  // share of survivors with dementia matches the published prevalence for the next age.
  const demOnset = (a) => {
    const P = demPrev(a), P1 = demPrev(a + 1);
    const q = qx('F', a) * 0.5 + qx('M', a) * 0.5;
    const pL = Math.max(careShare(a), P), avg = (1 - pL) + (pL - P) * 1.5 + P * 2;
    const sD = 1 - Math.min(0.95, (2 * q) / avg);
    const sN = 1 - (q * ((1 - pL) + (pL - P) * 1.5)) / (1 - P) / avg;
    const x = (P1 * sN) / (sD * (1 - P1) + P1 * sN);
    return Math.min(1, Math.max(0, (x - P) / (1 - P)));
  };
  // Cataract ever diagnosed: 18.3% (65-74), 36.9% (75-84), 47.8% (85+), Population Health Survey 2020-22.
  // ASSUMPTION: 12% at 65, linear between band midpoints, held from 90.
  const catPrev = curve([[65, 0.12], [69.5, 0.183], [79.5, 0.369], [90, 0.478]]);
  // Doctor-diagnosed arthritis: 7.7% (65-74), 12.4% (75-84), 15.5% (85+), same survey. ASSUMPTION: 6% at 65.
  const jointPrev = curve([[65, 0.06], [69.5, 0.077], [79.5, 0.124], [90, 0.155]]);
  // Doctor-diagnosed conditions, same survey, ages 55-64 / 65-74 / 75-84 / 85+:
  // hypertension 26.7 / 45.2 / 59.7 / 64.8%; diabetes 9.2 / 17.1 / 23.5 / 18.3%; coronary heart disease
  // 1.9 / 3.9 / 5.7 / 7.7%; stroke 0.8 / 1.3 / 4.8 / 4.3%; cancer 3.6 / 5.3 / 8.0 / 5.1%.
  // ASSUMPTION: linear between band midpoints. Where the 85+ figure is lower (diabetes, stroke, cancer),
  // that reflects who survives; these conditions do not change the chance of dying here (the life table
  // already includes them on average), so the curve is held at the 75-84 level instead.
  const bpPrev = curve([[59.5, 0.267], [69.5, 0.452], [79.5, 0.597], [90, 0.648]]);
  const dmPrev = curve([[59.5, 0.092], [69.5, 0.171], [79.5, 0.235]]);
  const chdPrev = curve([[59.5, 0.019], [69.5, 0.039], [79.5, 0.057], [90, 0.077]]);
  const strokePrev = curve([[59.5, 0.008], [69.5, 0.013], [79.5, 0.048]]);
  const cancerPrev = curve([[59.5, 0.036], [69.5, 0.053], [79.5, 0.08]]);
  // Dementia by age band, DH/CUHK study (data from about 2005): 2.5% (65-69), 3.5% (70-74), 9.9% (75-79), 19% (80-84), 32.1% (85+).
  // ASSUMPTION: linear between band midpoints, held at 32.1% from 87; nobody starts the game with dementia.
  const demPrev = curve([[65, 0], [67, 0.025], [72, 0.035], [77, 0.099], [82, 0.19], [87, 0.321]]);
  // Long-term care need. ASSUMPTION: a smooth curve fitted to census anchors (16.6% of 60+ at home; over half of 85+).
  const ltcPrev = (a) => Math.min(0.75, 0.03 * Math.pow(1.14, a - 65));
  // Injurious falls among people aged 65+: 4.0% (65-69), 5.2% (70-74), 6.7% (75+), injury survey 2018-19.
  const injFall = (a) => (a < 70 ? 0.04 : a < 75 ? 0.052 : 0.067);
  const ANY_FALL = 0.157; // Elderly Health Centre members, 2023

  // Marital status at 65-74, 2021 Census Table 4.1 (shares).
  const MARITAL = {
    M: { married: 83.7, widowed: 3.9, divorced: 6.5, separated: 0.7, never: 5.3 },
    F: { married: 64.0, widowed: 20.3, divorced: 8.5, separated: 0.7, never: 6.6 },
  };
  // Living arrangement x housing (public rental, subsidised sale, private, other), census Table 7.9 counts.
  const WITH_SPOUSE = [
    { id: 'spouse_kids', n: 458335, housing: [164236, 107596, 181647, 4856] },
    { id: 'spouse', n: 396024, housing: [111484, 81081, 199485, 3974] },
  ];
  const NO_SPOUSE = [
    { id: 'alone', n: 188569, housing: [92460, 25189, 68162, 2758] },
    { id: 'kids', n: 265629, housing: [104906, 58065, 100302, 2356] },
    { id: 'other', n: 73849, housing: [18537, 11083, 42983, 1246] },
  ];
  const HOUSING = ['prh', 'hos', 'private', 'other'];

  const SURNAMES = [['陳', 'Chan'], ['黃', 'Wong'], ['李', 'Lee'], ['張', 'Cheung'], ['劉', 'Lau'], ['何', 'Ho'], ['吳', 'Ng'], ['梁', 'Leung'], ['林', 'Lam'], ['鄧', 'Tang'], ['曾', 'Tsang'], ['葉', 'Yip'], ['周', 'Chow'], ['郭', 'Kwok'], ['馮', 'Fung'], ['麥', 'Mak'], ['蔡', 'Choi'], ['鄭', 'Cheng'], ['謝', 'Tse'], ['羅', 'Law']];
  const GIVEN = {
    M: [['偉文', 'Wai-man'], ['國強', 'Kwok-keung'], ['志明', 'Chi-ming'], ['建華', 'Kin-wah'], ['家輝', 'Ka-fai'], ['永康', 'Wing-hong'], ['耀宗', 'Yiu-chung'], ['錦華', 'Kam-wah'], ['樹培', 'Shu-pui'], ['德明', 'Tak-ming'], ['炳輝', 'Bing-fai'], ['兆麟', 'Siu-lun']],
    F: [['小玲', 'Siu-ling'], ['美玲', 'Mei-ling'], ['麗霞', 'Lai-ha'], ['玉蘭', 'Yuk-lan'], ['素芳', 'So-fong'], ['潔瑩', 'Kit-ying'], ['淑芬', 'Suk-fan'], ['美娟', 'Mei-kuen'], ['月好', 'Yuet-ho'], ['惠芳', 'Wai-fong'], ['寶珠', 'Po-chu'], ['秀英', 'Sau-ying']],
  };
  // Ethnicity: 98.2% of older persons are Chinese (2021 Census); the rest get a name from the
  // larger non-Chinese communities of that generation.
  const OTHER_NAMES = {
    M: ['Rajesh Gurung', 'Muhammad Akbar', 'Ramon Santos', 'Harjit Singh', 'David Harris'],
    F: ['Sita Rai', 'Amina Bibi', 'Maria Reyes', 'Priya Mehta', 'Susan Clarke'],
  };

  // Children and grandchildren are drawn at the start (see draw); family moments need them.
  const family = (s) => s.hasChild;
  // A child may live elsewhere (the Mainland or overseas). In-person moments need a child nearby.
  const near = (s) => s.hasChild && !s.childAway;
  const hasGk = (s) => s.gkAge !== null;
  // Each place carries the child's reason for being there (work, study or marriage).
  // `far`: evening there is morning in Hong Kong.
  const AWAY = [
    { city: T('深圳', 'Shenzhen'), why: T('在深圳的科技公司上班', 'works for a tech firm in Shenzhen'), w: 3 },
    { city: T('杭州', 'Hangzhou'), why: T('在杭州的科技公司上班', 'works for a tech firm in Hangzhou'), w: 2 },
    { city: T('上海', 'Shanghai'), why: T('被公司派駐上海', 'has been posted to Shanghai by the company'), w: 1 },
    { city: T('新加坡', 'Singapore'), why: T('在新加坡的銀行工作', 'works at a bank in Singapore'), w: 2 },
    { city: T('倫敦', 'London'), why: T('在倫敦的銀行工作', 'works at a bank in London'), w: 1, far: true },
    { city: T('溫哥華', 'Vancouver'), why: T('在溫哥華讀完書，留了在那邊工作', 'studied in Vancouver and stayed on to work'), w: 1, far: true },
    { city: T('墨爾本', 'Melbourne'), why: T('和墨爾本的另一半結了婚，在那邊安了家', 'married a partner from Melbourne and made a home there'), w: 1 },
    { city: T('東京', 'Tokyo'), why: T('和日本的另一半結了婚，在東京安了家', 'married a partner from Japan and made a home in Tokyo'), w: 1 },
  ];
  const city = (s) => AWAY[s.awayCity].city;
  const why = (s) => AWAY[s.awayCity].why;
  const pron = (s) => (s.sex === 'M' ? T('他', 'his') : T('她', 'her'));
  const child = (s) => (s.childSex === 'F' ? T('女兒', 'daughter') : T('兒子', 'son'));
  const childPron = (s) => (s.childSex === 'F' ? T('她', 'she') : T('他', 'he'));
  // The grandchild is the tracked child's child: a daughter's children are 外孫 in Chinese.
  const gk = (s) => (s.childSex === 'F'
    ? (s.gkSex === 'F' ? T('外孫女', 'granddaughter') : T('外孫', 'grandson'))
    : (s.gkSex === 'F' ? T('孫女', 'granddaughter') : T('孫仔', 'grandson')));
  const gkPron = (s) => (s.gkSex === 'F' ? T('她', 'her') : T('他', 'him'));
  const partnerPron = (s) => (s.sex === 'M' ? T('她', 'her') : T('他', 'his'));
  const HELPERS = ['Lorna', 'Siti', 'Marites', 'Ani', 'Joy', 'Wati'];

  function draw(rng) {
    // Sex: 421,486 men and about 441,200 women aged 65-74 in 2021 (Table 4.1).
    const sex = rng() < 0.489 ? 'M' : 'F';
    const m = MARITAL[sex];
    const marital = rng.weighted(Object.keys(m), (k) => m[k]);
    const arr = rng.weighted(marital === 'married' ? WITH_SPOUSE : NO_SPOUSE, (x) => x.n);
    const housing = HOUSING[rng.weightedIndex(arr.housing)];
    const owner = housing === 'hos' || (housing === 'private' && rng() < 0.802); // 80.2% owner-occupiers
    const working = rng() < (sex === 'M' ? 0.303 : 0.159); // labour force participation 65-74, 2021
    const born = rng.weighted(['hk', 'mainland', 'elsewhere'], (b) => ({ hk: 43.0, mainland: 52.9, elsewhere: 4.0 }[b]));
    const chinese = rng() < 0.982;
    let name;
    if (chinese) {
      const [sz, se] = rng.pick(SURNAMES);
      const [gz, ge] = rng.pick(GIVEN[sex]);
      name = T(sz + gz, `${se} ${ge}`);
    } else {
      const n = rng.pick(OTHER_NAMES[sex]);
      name = T(n, n);
    }
    // ASSUMPTION: starting "money" by housing and work is a game judgement, not data.
    const money = { prh: 25, hos: 45, private: owner ? 60 : 30, other: 15 }[housing] + (working ? 8 : 0);
    // ASSUMPTION: the husband is 4 years older than the wife (tuned to the census widowed shares).
    const spouseAge = 65 + (sex === 'F' ? 4 : -4);
    const s = {
      name, sex, age: 65, alive: true, marital, arrangement: arr.id, start: arr.id, housing, owner, working, born, chinese,
      spouse: marital === 'married', spouseAge, kidsAtHome: arr.id === 'spouse_kids' || arr.id === 'kids',
      childSex: rng() < 0.5 ? 'F' : 'M', helper: rng.pick(HELPERS),
      stats: { health: 68 + Math.floor(rng() * 15), money, people: arr.id === 'alone' ? 40 : 62, spirits: 62 },
      flags: { cataract: rng() < catPrev(65), joints: rng() < jointPrev(65), chronic: rng() < bpPrev(65), admits: [] },
      seenFacts: [],
      used: {},
    };
    // The other conditions at 65, at the survey's rates.
    for (const [k, prev] of [['dm', dmPrev], ['chd', chdPrev], ['stroke', strokePrev], ['cancer', cancerPrev]]) s.flags[k] = rng() < prev(65);
    // ASSUMPTION, estimated from published C&SD fertility and marriage figures for women born about
    // 1961: anyone living with children has a child; about 88% of the other ever-married have one, the
    // never-married none. About 42% of parents already have a grandchild at 65 (the eldest around 8,
    // most often 4-13); others may become grandparents later (first_gk).
    s.hasChild = s.kidsAtHome || (marital !== 'never' && rng() < 0.88);
    s.gkAge = s.hasChild && rng() < 0.42 ? Math.min(17, Math.floor(rng() * 8 + rng() * 8 + 1)) : null;
    s.gkSex = rng() < 0.5 ? 'F' : 'M';
    // ASSUMPTION: about 1 in 6 of those whose children live apart have their child elsewhere
    // (the Mainland or overseas). No published rate exists; this share is a setting of the game.
    s.childAway = s.hasChild && !s.kidsAtHome && rng() < 0.16;
    s.awayCity = rng.weightedIndex(AWAY.map((x) => x.w));
    // ASSUMPTION: about one life in four is drawn for a hard stretch and about one in five meets one
    // (a hip fracture, money lost to a scam, a long lonely spell, a carer worn down, a long wait for
    // a care home). It stays hard for a while; help eases things rather than settling them. No
    // published rate; disclosed on the method page.
    s.hard = rng() < 0.25;
    return s;
  }

  const HOUSE_LABEL = {
    prh: T('一個公屋單位', 'a public rental flat'),
    hos: T('一個自置的資助出售單位', 'a subsidised-sale flat you own'),
    privateOwn: T('一個自置的私人樓宇單位', 'a private flat you own'),
    privateRent: T('一個租住的私人樓宇單位', 'a rented private flat'),
    other: T('臨時或其他類型的房屋', 'temporary or other housing'),
  };
  const houseLabel = (s) => (s.housing === 'private' ? (s.owner ? HOUSE_LABEL.privateOwn : HOUSE_LABEL.privateRent) : HOUSE_LABEL[s.housing]);
  const ARR_LABEL = {
    spouse_kids: T('與配偶和子女同住', 'living with your spouse and children'),
    spouse: T('與配偶兩人同住', 'living with your spouse'),
    alone: T('獨居', 'living on your own'),
    kids: T('與子女同住', 'living with your children'),
    other: T('與其他親人同住', 'living with other relatives'),
  };
  const BORN = {
    hk: T('你在香港出生', 'You were born in Hong Kong'),
    mainland: T('你在內地出生，年輕時來到香港', 'You were born on the Mainland and came to Hong Kong when you were young'),
    elsewhere: T('你在香港以外的地方出生，後來在這裡落地生根', 'You were born outside Hong Kong and made your life here'),
    minority: T('你屬於香港的非華裔社群，在這裡生活了大半輩子', 'You belong to one of Hong Kong\'s ethnic minority communities and have lived here most of your life'),
  };

  function describe(s) {
    const work = s.working ? T('你仍然在工作。', 'You are still working.') : T('你已經退休了。', 'You have retired.');
    return T(
      `今天是你65歲生日。你是${s.name.zh}，${ARR_LABEL[s.arrangement].zh}，住在${houseLabel(s).zh}。${BORN[s.chinese ? s.born : 'minority'].zh}。${work.zh}`,
      `Today is your 65th birthday. You are ${s.name.en}, ${ARR_LABEL[s.arrangement].en} in ${houseLabel(s).en}. ${BORN[s.chinese ? s.born : 'minority'].en}. ${work.en}`,
    );
  }

  // Pick a variant not yet shown in this life, so a repeated event does not repeat word for word.
  function startHard(s, kind) { s.flags.hardKind = kind; s.flags.hardFrom = s.age; return true; }
  // A stretch stays on while the thing it is about is still there.
  function hardOn(s) {
    const k = s.flags.hardKind;
    if (!k || s.flags.hardDone) return false;
    if (k === 'carer') return s.flags.carer === 'child' ? family(s) : s.flags.carer === 'spouse' && s.spouse;
    if (k === 'alone' || k === 'money') return !s.flags.dementia;
    return true;
  }
  function carerWord(s) { return s.flags.carer === 'child' && s.hasChild ? child(s) : T('另一半', 'partner'); }

  // Lines that ask a lot of the body: not soon after an injury, a broken hip or a stroke, and not from 80.
  const hurt = (s) => s.flags.hurtAge !== undefined && s.age - s.flags.hurtAge <= 1;
  const sturdy = (s) => s.age < 80 && !hurt(s) && !s.flags.hip && s.flags.strokeAge === undefined && s.stats.health >= 55;
  function fresh(s, rng, key, list) {
    const used = s.used[key] || (s.used[key] = []);
    // A null in the list is a line that does not fit this life right now (see sturdy).
    let free = list.map((_, j) => j).filter((j) => list[j] && !used.includes(j));
    if (!free.length) { used.length = 0; free = list.map((_, j) => j).filter((j) => list[j]); }
    const i = free[Math.floor(rng() * free.length)];
    used.push(i);
    return list[i];
  }

  // ------------------------------------------------------------------ events
  // Fields: id, when(s), p(s) yearly probability, once / rep / gap, heavy, daily, run(s, rng) -> entry.
  // An entry: { text, fact?, src?, help?, soft?, choice? }. A choice: { prompt, options: [{ label, auto, ok?, apply }] }.
  // A fact is shown once per life per key (factKey, or the event id); repeats keep the story line only.
  // Support outcomes: about one in three leaves something unresolved.

  const EVENTS = [
    // --- the first year ---
    {
      id: 'mpf', once: true, when: (s) => s.age === 65, p: () => 1,
      run: (s) => {
        s.stats.money += s.housing === 'prh' ? 3 : 6;
        return {
          text: s.arrangement === 'alone'
            ? T('你提取了強積金。你對著結單看了很久，然後拿出紙筆，計劃這筆錢怎樣用。', 'You withdrew your MPF. You looked at the statement for a long time, then took out a pen and paper to plan how to use it.')
            : T('你提取了強積金。你對著結單看了很久，然後和家人坐下來，計劃這筆錢怎樣用。', 'You withdrew your MPF. You looked at the statement for a long time, then sat down with your family to plan how to use it.'),
          fact: T('強積金於2000年12月實施，今年65歲的人最多供款約26年。2024年底，成員平均持有超過2.3個戶口；55歲至未滿65歲人士的戶口，平均結餘約$149,000。', 'The MPF started in December 2000, so people turning 65 this year contributed for up to about 26 years. At the end of 2024, members held more than 2.3 accounts on average, and accounts of people aged 55 to under 65 had an average balance of about $149,000.'),
          src: ['mpf_balances', 'mpfa'],
        };
      },
    },
    {
      id: 'card', once: true, when: (s) => s.age >= 65, p: () => 0.6,
      run: (s) => {
        s.stats.spirits += 2; s.stats.people += 1;
        return {
          text: T('你拿到了長者咭，坐$2巴士去探老朋友。', 'You got your Senior Citizen Card, and took the $2 bus to visit an old friend.'),
          fact: T('由2026年4月3日起，$2計劃有所調整：成人車費$10或以下的行程付$2；$10以上的行程，可獲全費80%的折扣。', 'From 3 April 2026 the $2 Scheme changed: trips with an adult fare of $10 or below cost $2, and trips above $10 get an 80% discount on the full fare.'),
          src: ['fare'],
        };
      },
    },
    {
      id: 'voucher', once: true, when: (s) => s.age >= 66, p: () => 0.6,
      run: (s) => {
        s.stats.health += 2;
        return {
          text: T('你第一次用長者醫療券，在屋企附近的家庭醫生那裡做了一次身體檢查。', 'You used your Elderly Health Care Vouchers for the first time, for a check-up with the family doctor near home.'),
          fact: T('每名合資格長者每年獲發$2,000醫療券，累積上限為$8,000。', 'Each eligible older person receives $2,000 in vouchers a year, up to an accumulation limit of $8,000.'),
          src: ['hcv'],
        };
      },
    },
    {
      id: 'work', once: true, when: (s) => s.working && s.age === 65, p: () => 1,
      run: () => ({
        text: T('老闆問你，65歲之後會不會考慮留低做兼職。', 'Your employer asked whether you would like to stay on part-time after turning 65.'),
        fact: T('65歲或以上的勞動人口由2019年的157,900人增至2023年的213,500人；2023年他們每月就業收入的中位數為$13,500。', 'The labour force aged 65 and over grew from 157,900 in 2019 to 213,500 in 2023; their median monthly earnings in 2023 were $13,500.'),
        src: ['labour'],
        choice: {
          prompt: T('繼續工作嗎？', 'Keep working?'),
          options: [
            { label: T('留低做兼職', 'Stay on part-time'), auto: 0.6, apply: (s) => { s.stats.money += 8; s.stats.people += 2; s.flags.partTime = true; return T('你改為每星期返三日工。人工少了，但同事仍然會留一份早餐給你。', 'You moved to three days a week. The pay is smaller, but your colleagues still save you a breakfast.'); } },
            { label: T('現在退休', 'Retire now'), auto: 0.4, apply: (s) => { s.working = false; s.stats.spirits += 3; return T('你交還了職員證。第一個不用返工的星期一，你在公園看人打太極，看了一整個上午。', 'You handed in your staff card. On your first free Monday you watched the tai chi group in the park all morning.'); } },
          ],
        },
      }),
    },
    {
      id: 'retire_later', once: true, when: (s) => s.working && s.flags.partTime && s.age >= 67, p: (s) => (s.age < 70 ? 0.2 : 0.35), // ASSUMPTION
      run: (s) => {
        s.working = false; s.stats.spirits += 2;
        return { text: T('你決定正式退休。同事們送了你一個刻上名字的保溫杯。', 'You decided to retire for good. Your colleagues gave you a flask with your name on it.') };
      },
    },
    {
      id: 'job', once: true, when: (s) => !s.working && s.age <= 72 && s.stats.money < 35 && !s.flags.ltc, p: () => 0.15, // ASSUMPTION
      run: () => ({
        text: T('街坊介紹你去一間茶餐廳做早更兼職。', 'A neighbour told you about a part-time morning shift at a café.'),
        fact: T('勞工處的中高齡就業計劃下，聘用60歲或以上求職者的僱主，可申請每月最高$5,000的在職培訓津貼，為期6至12個月。', 'Under the Labour Department\'s Employment Programme for the Elderly and Middle-aged, employers who hire job seekers aged 60 or above can receive a training allowance of up to $5,000 a month for 6 to 12 months.'),
        src: ['epem'],
        choice: {
          prompt: T('去試試嗎？', 'Give it a try?'),
          options: [
            { label: T('去試試', 'Give it a try'), auto: 0.5, apply: (s) => { s.working = true; s.flags.partTime = true; s.stats.money += 8; s.stats.people += 3; return T('朝早五點半起身不容易，但你很快就記得每位熟客要什麼。', 'Getting up at half past five is hard, but you soon know what every regular orders.'); } },
            { label: T('還是不了', 'Not this time'), auto: 0.5, apply: () => T('你多謝街坊，說想先多陪陪家人。', 'You thanked your neighbour and said you would rather spend the time with family for now.') },
          ],
        },
      }),
    },
    {
      id: 'oala', once: true,
      when: (s) => !s.working && (s.housing === 'prh' || s.housing === 'other' || s.stats.money < 40),
      p: () => 0.85, // ASSUMPTION: most eligible people apply within a year
      run: (s) => ({
        text: near(s) && s.age % 2 ? T(`${child(s).zh}陪你把長者生活津貼的申請表填好。`, `Your ${child(s).en} sat with you while you filled in the Old Age Living Allowance form.`) : T('長者中心的社工和你一起填好了長者生活津貼的申請表。', 'A social worker at the elderly centre helped you fill in the Old Age Living Allowance form.'),
        fact: T('長者生活津貼每月$4,345（2026年2月起）。每月入息及資產限額：單身人士$10,900及$415,000；夫婦$16,680及$630,000。', 'The Old Age Living Allowance is $4,345 a month (from February 2026). Monthly income and asset limits: $10,900 and $415,000 for a single person; $16,680 and $630,000 for a married couple.'),
        src: ['swd_rates', 'oala_limits'],
        choice: {
          prompt: T('申請嗎？', 'Apply?'),
          options: [
            { label: T('申請', 'Apply'), auto: 0.9, apply: (s) => { s.flags.oala = true; s.stats.money += 12; s.stats.spirits += 2; return T('申請表交了上去，幾個星期後，津貼批了。每個月的電費和餸錢有了着落；你仍然習慣在街市收檔前才去買菜。', 'You sent the form in, and a few weeks later the allowance was approved. Once it came through, the electricity bill and the grocery money were covered; you still like to shop just before the market closes.'); } },
            { label: T('暫時不用', 'Not for now'), auto: 0.1, apply: (s) => { s.stats.money -= 3; return T('你說暫時用積蓄應付得來，把表格放進了抽屜。', 'You said your savings would do for now, and put the form in a drawer.'); } },
          ],
        },
      }),
    },
    {
      id: 'oaa', once: true, when: (s) => s.age === 70 && !s.flags.oala, p: () => 1,
      run: (s) => {
        s.stats.money += 4;
        return {
          text: T('70歲生日之後，你開始領取高齡津貼，即大家口中的「生果金」。', 'After your 70th birthday you began receiving the Old Age Allowance, the "fruit money".'),
          fact: T('70歲或以上的香港居民可申領高齡津貼，每月$1,675（2026年2月起）。', 'Hong Kong residents aged 70 and over can receive the Old Age Allowance, $1,675 a month (from February 2026).'),
          src: ['swd_rates'],
        };
      },
    },
    {
      id: 'rent', once: true, when: (s) => s.housing === 'private' && !s.owner && !s.working && !s.flags.inHome, p: () => 0.25, // ASSUMPTION
      run: () => ({
        text: T('業主說，下一份租約要加租。你拿著計數機，在飯枱前坐了一個晚上。', 'The landlord said the rent would go up with the next lease. You sat at the dining table with a calculator all evening.'),
        fact: T('綜合社會保障援助（綜援）為經濟有困難的人提供現金援助。每月金額按住戶人數、年齡和健康狀況計算，另可按需要獲發租金津貼等補助。', 'The Comprehensive Social Security Assistance (CSSA) scheme gives cash assistance to people in financial need. The monthly amount depends on household size, age and health, with supplements such as a rent allowance where eligible.'),
        src: ['cssa'],
        choice: {
          prompt: T('你打算怎樣做？', 'What will you do?'),
          options: [
            { label: T('請社工幫忙看看', 'Ask a social worker to look at it with you'), auto: 0.6, apply: (s) => { s.stats.money += 6; s.flags.cssa = s.stats.money < 30; return s.flags.cssa ? T('社工陪你申請了綜援，連租金津貼一起計。每個月仍要精打細算，但租金不用再一個人擔心。', 'The social worker helped you apply for CSSA, rent allowance included. Money still needs careful sums each month, but you no longer carry the rent alone.') : T('社工和你一起算了一遍，又陪你同業主傾。最後租金加少了一點。', 'The social worker went through the sums with you and came along to talk to the landlord. In the end the rise was a little smaller.'); } },
            { label: T('搬到細一點的單位', 'Move to a smaller flat'), auto: 0.4, apply: (s) => { s.stats.people -= 2; s.stats.money += 3; return T('你搬到同區一個細一點的單位。街市和茶樓仍然是那幾間，只是要多行兩條街。', 'You moved to a smaller flat in the same district. Same market, same tea house, just two more streets to walk.'); } },
          ],
        },
      }),
    },

    // --- health ---
    {
      id: 'chronic', once: true, when: (s) => !s.flags.chronic && s.age >= 66, p: (s) => onset(bpPrev, s.age), // high blood pressure
      run: (s) => {
        s.flags.chronic = true; s.stats.health -= 3;
        return {
          text: T('地區康健中心的護士替你量血壓，發現偏高。她跟你談了少鹽少油，在卡上寫下三個月後再來的日期。', 'A nurse at the District Health Centre found your blood pressure was high. She talked with you about salt and oil, and wrote a date on your card to come back in three months.'),
          fact: T('2025年，65歲或以上人士中有78.2%患有最少一種經西醫診斷的長期病患。', 'In 2025, 78.2% of people aged 65 and over had at least one chronic condition diagnosed by a Western-medicine doctor.'),
          src: ['ths84'],
        };
      },
    },
    {
      id: 'diabetes', once: true, when: (s) => !s.flags.dm && s.age >= 66, p: (s) => onset(dmPrev, s.age),
      run: (s, rng) => {
        s.flags.dm = true; s.stats.health -= 3;
        return {
          text: fresh(s, rng, 'dm', [
            T('驗血發現你的血糖偏高，醫生確診了糖尿病。營養師教你看食物標籤，你開始在白飯裡加一半糙米。', 'A blood test showed high blood sugar, and the doctor confirmed diabetes. A dietitian showed you how to read food labels, and you started making your rice half white, half brown.'),
            T('普通科門診的醫生說你的血糖一直偏高，確診了糖尿病。護士教你用血糖機，你把每次的讀數寫在一本小簿裡。', 'The doctor at the general outpatient clinic said your blood sugar had stayed high, and confirmed diabetes. A nurse taught you to use a glucose meter, and you write every reading in a little notebook.'),
          ]),
          fact: T('2020-22年，65至74歲人士中有17.1%曾經醫生診斷患有糖尿病，75至84歲為23.5%。', 'In 2020-22, 17.1% of people aged 65-74 had been diagnosed with diabetes by a doctor, and 23.5% of those aged 75-84.'),
          src: ['phs'],
        };
      },
    },
    {
      id: 'heart', once: true, when: (s) => !s.flags.chd && s.age >= 66, p: (s) => onset(chdPrev, s.age),
      run: (s) => {
        s.flags.chd = true; s.stats.health -= 6; s.flags.admits.push(s.age);
        return {
          text: s.flags.inHome
            ? T('你心口翳得厲害，院舍的職員即刻叫了救護車。醫生替你做了通波仔，幾日後你回到院舍，護理員扶著你慢慢行。', 'You felt a heavy tightness in your chest, and the care home staff called an ambulance at once. The doctors opened a narrowed artery with a balloon, and a few days later you were back, walking slowly with a care worker\'s arm.')
            : T('你行樓梯時心口翳得厲害，入了醫院。醫生替你做了通波仔，兩日後就出院；物理治療師教你每日慢慢加長散步的時間。', 'Climbing the stairs, you felt a heavy tightness in your chest and went to hospital. The doctors opened a narrowed artery with a balloon, and you were home two days later; a physiotherapist showed you how to walk a little further each day.'),
          fact: T('2020-22年，65至74歲人士中有3.9%曾經醫生診斷患有冠心病，75至84歲為5.7%，85歲或以上為7.7%。', 'In 2020-22, 3.9% of people aged 65-74 had been diagnosed with coronary heart disease by a doctor, 5.7% of those aged 75-84 and 7.7% of those aged 85 or above.'),
          src: ['phs'],
        };
      },
    },
    {
      id: 'stroke', once: true, heavy: true, when: (s) => !s.flags.stroke && s.age >= 66, p: (s) => onset(strokePrev, s.age),
      run: (s) => {
        s.flags.stroke = true; s.flags.strokeAge = s.age; s.stats.health -= 12; s.stats.spirits -= 4; s.flags.admits.push(s.age);
        const who = s.flags.inHome ? T('院舍的職員', 'The care home staff') : s.arrangement === 'alone' ? T('你察覺不對勁，自己', 'You knew something was wrong and') : T('家人', 'Your family');
        return {
          text: T(`一天早上，你說話含糊，右手無力。${who.zh}即刻叫了救護車。你在醫院住了三個星期，之後每星期做復康；職業治療師教你用左手扣鈕。`, `One morning your speech slurred and your right hand went weak. ${who.en} called an ambulance at once. After three weeks in hospital you went to rehabilitation every week, where an occupational therapist taught you to do up buttons with your left hand.`),
          soft: T('你中風了，在醫院住了一段時間，之後慢慢做復康。', 'You had a stroke, spent some weeks in hospital, and then worked slowly at rehabilitation.'),
          fact: T('2020-22年，65至74歲人士中有1.3%曾經醫生診斷患有中風，75至84歲為4.8%。', 'In 2020-22, 1.3% of people aged 65-74 had been diagnosed with a stroke by a doctor, and 4.8% of those aged 75-84.'),
          src: ['phs'],
        };
      },
    },
    {
      id: 'cancer', once: true, heavy: true, when: (s) => !s.flags.cancer && s.age >= 66, p: (s) => onset(cancerPrev, s.age),
      run: (s, rng) => {
        s.flags.cancer = true; s.flags.cancerAge = s.age; s.stats.health -= 10; s.stats.spirits -= 4; s.flags.admits.push(s.age);
        return {
          text: fresh(s, rng, 'cancer', [
            T('身體檢查發現了腫瘤，醫生確診是癌症。你做了手術，之後幾個月定期覆診。醫院的護士和社工把治療逐步講給你聽，同房的病友教你應付副作用的小貼士。', 'A check-up found a tumour, and the doctor confirmed cancer. You had an operation, then regular follow-ups for several months. The nurses and the hospital social worker explained each step, and a patient in the next bed shared tips for coping with the side effects.'),
            T('你確診了癌症，入院做了治療。那幾個月，你常常很累，鄰居輪流替你買餸，舊同事每星期打電話來問候。', 'You were diagnosed with cancer and went into hospital for treatment. For months you were often tired; neighbours took turns doing your shopping, and an old colleague phoned every week.'),
          ]),
          soft: T('你確診了癌症，接受了治療。', 'You were diagnosed with cancer and had treatment.'),
          fact: T('2020-22年，65至74歲人士中有5.3%曾經醫生診斷患有癌症，75至84歲為8.0%。', 'In 2020-22, 5.3% of people aged 65-74 had been diagnosed with cancer by a doctor, and 8.0% of those aged 75-84.'),
          src: ['phs'],
        };
      },
    },
    {
      id: 'cataract', once: true, when: (s) => !s.flags.cataract && s.age >= 66, p: (s) => onset(catPrev, s.age),
      run: (s) => {
        s.flags.cataract = true;
        return {
          text: T('看報紙越來越吃力。醫生說是白內障，轉介你去眼科。', 'Reading the newspaper was getting harder. The doctor said it was cataracts and referred you to the eye clinic.'),
          fact: T('公立醫院在2023-24年度做了26,479宗白內障手術。2024年，手術輪候時間中位數為14個月；最緊急的個案約一個月內做手術。', 'Public hospitals carried out 26,479 cataract operations in 2023-24. In 2024 the median wait for surgery was 14 months; the most urgent cases had surgery within about a month.'),
          src: ['cataract_annex', 'cataract'],
          choice: {
            prompt: T('你打算怎樣做？', 'What will you do?'),
            options: [
              { label: T('在公立醫院排期', 'Join the public hospital list'), auto: 0.65, apply: (s) => { s.flags.catWait = true; s.stats.health -= 2; return T('你拿到手術日期，在月曆上把那天圈了起來。等候期間，家人幫你把手機字體調大，長者中心的義工陪你去覆診。', 'You were given a date and circled it on the calendar. Meanwhile your family made the text on your phone bigger, and a volunteer from the elderly centre came with you to check-ups.'); } },
              { label: T('去私家醫院做', 'Have it done privately'), auto: 0.35, ok: (s) => s.stats.money >= 40, apply: (s) => { s.stats.money -= 12; s.stats.health += 2; s.flags.catDone = true; return T('你用積蓄在私家醫院做了手術，之後有一段日子，你買餸也算得仔細些。除下眼罩那天，你望出窗外，說顏色鮮艷過以前記得的。', 'You paid for surgery at a private hospital out of your savings, and for a while afterwards you counted the grocery money more carefully. The day the eye shield came off, you looked out of the window and said the colours were brighter than you remembered.'); } },
            ],
          },
        };
      },
    },
    {
      id: 'cataract_op', once: true, when: (s) => s.flags.catWait, p: () => 0.6, // ASSUMPTION: close to the 14-month median
      run: (s) => {
        s.flags.catWait = false; s.flags.catDone = true; s.stats.health += 4; s.stats.spirits += 3;
        return { text: T('你做了白內障手術。除下眼罩那天，你望出窗外，說顏色鮮艷過以前記得的。', 'You had your cataract operation. The day the eye shield came off, you looked out of the window and said the colours were brighter than you remembered.') };
      },
    },
    {
      id: 'joints', once: true, when: (s) => !s.flags.joints && s.age >= 66, p: (s) => onset(jointPrev, s.age),
      run: (s) => {
        s.flags.joints = true; s.stats.health -= 4;
        return {
          text: T('上落樓梯時膝頭開始痛。醫生說是退化性關節炎。', 'Your knees began to hurt on the stairs. The doctor said it was osteoarthritis.'),
          fact: T('2020-22年，經醫生診斷患關節炎的比率：65-74歲為7.7%，75-84歲為12.4%，85歲或以上為15.5%。', 'In 2020-22, doctor-diagnosed arthritis affected 7.7% of people aged 65-74, 12.4% at 75-84 and 15.5% at 85 and over.'),
          src: ['phs'],
          choice: {
            prompt: T('你怎樣照顧膝頭？', 'How will you look after your knees?'),
            options: [
              { label: T('參加康健中心的運動班', 'Join the exercise class at the health centre'), auto: 0.7, apply: (s) => { s.stats.health += 3; s.stats.people += 2; return T('物理治療師教你一套鍛鍊大腿肌肉的運動。你在班上認識了兩個同樣膝頭痛的朋友，三個人慢慢行上山。', 'A physiotherapist taught you exercises to strengthen your thighs. You made two friends in the class with the same sore knees, and the three of you walk up the hill together, slowly.'); } },
              { label: T('看私家骨科', 'See a private orthopaedic specialist'), auto: 0.3, ok: (s) => s.stats.money >= 35, apply: (s) => { s.stats.money -= 8; s.stats.health += 3; return T('打了針，再做了幾次物理治療，膝頭舒服了些。你又去行山了，只是揀短一點的路線。', 'After an injection and some physiotherapy your knees felt easier. You went back to hiking, choosing shorter trails.'); } },
            ],
          },
        };
      },
    },
    {
      id: 'fall', when: (s) => s.age >= 66 && !s.flags.inHome, p: () => ANY_FALL, gap: 2, rep: 4,
      run: (s, rng) => {
        const injured = rng() < injFall(s.age) / ANY_FALL;
        s.stats.health -= injured ? 8 : 2;
        s.flags.fell = true;
        if (injured) s.flags.hurtAge = s.age;
        let text;
        if (injured && s.hard && !s.flags.hardKind && rng() < 0.5) {
          s.stats.health -= 8; s.flags.hip = true; startHard(s, 'hip'); s.flags.admits.push(s.age);
          text = T('你在家中跌倒，跌斷了髖骨。做完手術，在醫院住了幾個星期，你帶著助行架回家。物理治療師每星期來一次。', 'You fell at home and broke your hip. After an operation and some weeks in hospital you came home with a walking frame, and a physiotherapist came once a week.');
        } else if (injured && s.arrangement === 'alone' && !s.used.fallAlone) { s.used.fallAlone = 1; text = T('你在浴室滑倒，扭傷了手腕。你按了平安鐘，救護員來了，送你去急症室。', 'You slipped in the bathroom and hurt your wrist. You pressed your emergency alarm; the ambulance crew came and took you to A&E.'); }
        else if (injured) text = fresh(s, rng, 'fallHurt', [
          T('你在街市門口絆倒，扭傷了腳踝。醫生說要休息幾個星期。', 'You tripped at the market entrance and sprained your ankle. The doctor said to rest for a few weeks.'),
          T('你落巴士時踏空，跌傷了膝頭。路人扶你坐下，替你打電話叫救護車。', 'Stepping off the bus you missed the kerb and hurt your knee. A passer-by helped you sit down and called an ambulance.'),
          T('你在廚房轉身時跌倒，手腕撞傷了。在急症室待了一個下午，打了石膏回家。', 'You fell turning round in the kitchen and hurt your wrist. After an afternoon in A&E you came home in a cast.'),
          T('你在屋苑的樓梯踏空，撞傷了肩膊。有幾個星期，你連晾衫也要人幫手。', 'You missed a step on the estate stairs and hurt your shoulder. For weeks you needed help even to hang out the washing.'),
        ]);
        else text = fresh(s, rng, 'fallNear', [
          T('你在家中絆了一下，扶著椅背站了一會，心跳才慢慢平復。', 'You tripped at home and stood holding the back of a chair until your heart slowed.'),
          T('落雨天，你在大廈外的斜路滑了一下，幸好扶住了欄杆。之後你出門都帶把長柄遮，當拐杖用。', 'On a wet day you slipped on the slope outside your building and caught the railing. Since then you take a long-handled umbrella with you to lean on.'),
          s.arrangement === 'alone'
            ? T('半夜起身去廁所，你在走廊踢到一張櫈。第二日，你把櫈搬走，又買了一盞夜燈。', 'Getting up in the night, you stumbled over a stool in the corridor. The next day you moved the stool and bought a night light.')
            : T('半夜起身去廁所，你在走廊踢到一張櫈。第二日，家人在走廊裝了一盞夜燈。', 'Getting up in the night, you stumbled over a stool in the corridor. The next day your family put in a night light.'),
          T('你在浴室差點滑倒，及時扶住了洗手盆。之後你在浴缸旁邊放了一張防滑櫈。', 'You nearly slipped in the bathroom and caught the basin just in time. Afterwards you put a non-slip stool by the bath.'),
        ]);
        return {
          text,
          fact: T('2023年，長者健康中心的登記會員中，15.7%在一年內曾經跌倒。2018年的調查顯示，每年因跌倒而受傷的長者約為4%至7%。', 'In 2023, 15.7% of Elderly Health Centre members had fallen at least once in a year. A 2018 survey found about 4% to 7% of older people were injured in a fall each year.'),
          src: ['ehs_falls', 'injury_survey'],
        };
      },
    },
    {
      id: 'adapt', once: true, when: (s) => s.flags.fell && (s.housing === 'prh' || (s.owner && s.stats.money < 60)), p: () => 0.5, // ASSUMPTION
      run: (s) => {
        s.stats.health += 2;
        return s.housing === 'prh'
          ? { text: T('你通知了屋邨辦事處。等了一陣子，工人來替你在浴室裝了扶手，沒有收費。', 'You let the estate office know. After a while, workers came to fit grab rails in your bathroom, free of charge.'), fact: T('公屋住戶如有60歲或以上的長者，只要通知屋邨辦事處，便可免費安排浴室扶手等簡單改裝。', 'Public housing households with members aged 60 or above can have simple adaptations, such as bathroom grab rails, arranged free of charge by notifying their estate office.'), src: ['adaptations'] }
          : { text: T('你申請了資助，把浴室換上防滑地磚，又加了扶手和沐浴椅。你仍然慢慢扶著扶手才轉身。', 'You applied for a grant and had non-slip tiles, grab rails and a shower seat fitted in your bathroom. You still turn slowly, one hand on the rail.'), fact: T('符合入息及資產限額的60歲或以上自住業主，每名合資格業主最高可獲$80,000資助，用於防滑地磚、扶手等長者友善改裝。', 'Owner-occupiers aged 60 or above who meet the income and asset limits can each receive up to $80,000 for age-friendly alterations such as non-slip tiles and grab rails.'), src: ['adaptations'] };
      },
    },
    {
      // ASSUMPTION: the yearly chance is tuned so that admissions from every cause (this event, and a
      // heart attack, stroke or cancer treatment) add up to the 16.1% of people 65+ at home admitted in
      // 2025; rising a little with age.
      id: 'hospital', when: (s) => !s.flags.inHome, p: (s) => (s.age < 75 ? 0.125 : s.age < 85 ? 0.175 : 0.22), gap: 1, rep: 8,
      run: (s, rng) => {
        s.stats.health -= 5; s.flags.admits.push(s.age);
        return {
          text: fresh(s, rng, 'hospital', [
            T('你因肺炎入院一個星期。病房有點嘈，你睡得不好，但姑娘每朝都叫你的名字，跟你說聲早晨。', 'You spent a week in hospital with pneumonia. The ward was noisy and you slept badly, but every morning the nurse greeted you by name.'),
            T('你發高燒不退，入了醫院驗血。原來是細菌感染，打了幾日抗生素就出院。', 'A fever that would not go down took you into hospital for tests. It was a bacterial infection, and after a few days of antibiotics you went home.'),
            T('你一連幾日頭暈，入了醫院觀察。醫生調整了你的藥，出院時護士把覆診日期和藥單逐樣解釋給你聽。', 'Several days of dizzy spells took you into hospital for observation. The doctor adjusted your medicines, and when you left the nurse went through the follow-up date and the medicines with you one by one.'),
            T('天氣太熱，你脫了水，在醫院吊了兩日鹽水。出院後，鄰居每日都提你飲多啲水。', 'The heat left you dehydrated, and you spent two days on a drip in hospital. Afterwards a neighbour reminded you every day to drink more water.'),
            T('你因為尿道炎入院住了幾日。出院時，護士提你每日要飲夠水。', 'A urinary infection kept you in hospital for a few days. When you left, the nurse reminded you to drink enough every day.'),
            T('你入院做一個預約好的小手術，住了兩晚。隔籬床的伯伯一直同你講笑，時間過得快了。', 'You went in for a planned minor operation and stayed two nights. The man in the next bed kept you laughing, and the time passed quickly.'),
            T('一場感冒拖成了胸肺感染，你在醫院住了一個星期。出院那天，你說最想念的是屋企的白粥。', 'A cold turned into a chest infection, and you spent a week in hospital. On the day you left, you said what you had missed most was plain congee at home.'),
            T('一次腸胃炎，令你在醫院住了五日。出院後，你瘦了一圈，胃口要慢慢才回來。', 'A stomach infection kept you in hospital for five days. After you left you were thinner, and your appetite took a while to return.'),
          ]),
          factKey: 'hospital',
          fact: T('2025年，65歲或以上人士中有16.1%在一年內曾入住醫院。由2026年1月起，公營醫療收費設有每年$10,000的開支上限；75歲或以上領取長者生活津貼的長者，獲全數豁免收費。', 'In 2025, 16.1% of people aged 65 and over had been admitted to hospital in the past year. From January 2026, public medical fees are capped at $10,000 a year, and Old Age Living Allowance recipients aged 75 or above receive full fee waivers.'),
          src: ['ths84', 'ha_fees'],
        };
      },
    },
    {
      id: 'low_mood', notBeforeDeath: true, when: (s) => s.age >= 67 && !s.flags.dementia, p: (s) => (s.flags.widowed || s.arrangement === 'alone' ? 0.04 : 0.02), gap: 5, rep: 2, // ASSUMPTION
      run: (s, rng) => {
        s.stats.spirits -= 6;
        return {
          text: fresh(s, rng, 'lowMood', [
            s.chinese
              ? T('有好幾個星期，你提不起勁，連最喜歡的粵曲也不想聽，夜晚又睡不著。', 'For several weeks you could not find the energy for anything. You did not even want to hear your favourite Cantonese opera, and you could not sleep at night.')
              : T('有好幾個星期，你提不起勁，連最喜歡的音樂也不想聽，夜晚又睡不著。', 'For several weeks you could not find the energy for anything. You did not even want to hear your favourite music, and you could not sleep at night.'),
            T('那種沉重的感覺又回來了。你朝早不想起身，飯也吃得很少。', 'The heavy feeling came back. In the mornings you did not want to get up, and you ate very little.'),
          ]),
          choice: {
            prompt: T('你會怎樣做？', 'What will you do?'),
            options: [
              { label: T('跟家庭醫生說', 'Tell your family doctor'), auto: 0.4, apply: (x) => { x.stats.spirits += 5; return x.used.lowMood && x.used.lowMood.length > 1 ? T('醫生記得你上次的情況，調整了治療，又轉介你見社區的精神健康服務。這一次好轉得更慢。', 'The doctor remembered last time, adjusted the treatment and referred you to a community mental health service. This time the improvement came more slowly.') : T('醫生聽你講了很久，說情緒低落是可以治療的，約了你兩個星期後再見。好轉得慢，但一天比一天好。', 'The doctor listened for a long time, said low mood can be treated, and booked you in again in two weeks. It lifted slowly, a little more each day.'); } },
              { label: T('跟身邊的人說', 'Talk to someone near you'), auto: 0.4, apply: (x) => { x.stats.spirits += 4; x.stats.people += 2; return near(x) ? T(`你把心裡話告訴了${child(x).zh}。${childPron(x).zh}聽完，說這個星期日會留一個下午陪你。`, `You told your ${child(x).en} how you had been feeling. After listening, ${childPron(x).en} said ${childPron(x).en} would keep Sunday afternoon free for you.`) : family(x) ? T(`你在電話裡把心裡話告訴了${child(x).zh}。之後那個星期，${childPron(x).zh}每晚都打電話來。`, `On the phone you told your ${child(x).en} how you had been feeling. Every evening that week, ${childPron(x).en} called.`) : T('你跟長者中心的社工講了。她說不用一個人撐，下星期再約你見面。', 'You told the social worker at the elderly centre. She said you do not have to carry it alone, and arranged to see you again next week.'); } },
              { label: T('等它自己過去', 'Wait for it to pass'), auto: 0.2, apply: (x) => { x.stats.spirits += 1; return { text: x.used.lowMood && x.used.lowMood.length > 1 ? T('你等了。這一次等了大半年，才慢慢回復過來。', 'You waited. This time it was the better part of a year before you began to feel like yourself.') : T('你等了一段日子。有一朝，樓下的街坊叫你一起去飲茶，你去了。', 'You waited. One morning a neighbour asked you to come for dim sum, and you went.'), help: HELP.talk }; } },
            ],
          },
        };
      },
    },

    // --- family and people ---
    {
      id: 'widowed', heavy: true, when: (s) => s.spouse, p: (s) => qx(s.sex === 'M' ? 'F' : 'M', Math.max(65, s.spouseAge + (s.age - 65))),
      run: (s, rng) => {
        s.spouse = false; s.flags.widowed = true; s.flags.widowAge = s.age; s.flags.partnerCare = false;
        s.stats.spirits -= 18; s.stats.people -= 8;
        if (s.arrangement === 'spouse') s.arrangement = 'alone';
        if (s.arrangement === 'spouse_kids') s.arrangement = 'kids';
        const who = s.sex === 'M' ? T('太太', 'wife') : T('丈夫', 'husband');
        const po = s.sex === 'M' ? T('她', 'her') : T('他', 'his');
        const after = rng.pick([
          T('屋企忽然靜了下來。', 'Home is suddenly very quiet.'),
          T('那天晚上，你還是煮了兩碗飯。', 'That night you still cooked two bowls of rice.'),
          T('半夜醒來，你習慣地伸手去拍拍旁邊的枕頭。', 'Waking in the night, you reached out to the other pillow out of habit.'),
        ]);
        return {
          text: T(`你的${who.zh}在醫院離開了，你一直握著${po.zh}的手。${after.zh}`, `Your ${who.en} passed away in hospital, with you holding ${po.en === 'his' ? 'his' : 'her'} hand. ${after.en}`),
          fact: T('2021年，75至84歲的女性中有46.3%喪偶，男性則為11.2%。', 'In 2021, 46.3% of women aged 75-84 were widowed, compared with 11.2% of men.'),
          src: ['census_older'],
          help: HELP.talk,
          soft: T(`你的${who.zh}離開了。你們一起走過了很多年。`, `Your ${who.en} passed away, after many years together.`),
        };
      },
    },
    {
      id: 'after_loss', once: true, when: (s) => s.flags.widowed && s.age - s.flags.widowAge <= 1 && !s.flags.inHome, p: () => 0.7,
      run: (s) => {
        s.stats.spirits += 6; s.stats.people += 4;
        const entry = {
          text: T('過了一段日子，長者中心的社工打電話來，邀請你參加一個喪偶長者的小組。你在那裡坐了很久，有位街坊遞了張紙巾給你。', 'Some time later the social worker from the elderly centre phoned and invited you to a group for people who have lost a partner. You sat there a long time, and someone passed you a tissue.'),
        };
        if (s.sex === 'F' && s.arrangement === 'alone') Object.assign(entry, {
          fact: T('2021年，獨居的65歲或以上女性中，59%是喪偶的。', 'In 2021, 59% of women aged 65 and over who lived alone were widowed.'),
          src: ['census_alone'],
        });
        return entry;
      },
    },
    {
      id: 'partner_care', once: true, when: (s) => s.spouse && s.age >= 70 && !s.flags.ltc, p: () => 0.03, // ASSUMPTION
      run: (s) => {
        s.flags.partnerCare = true; s.stats.spirits -= 5; s.stats.health -= 2;
        const who = s.sex === 'M' ? T('太太', 'wife') : T('丈夫', 'husband');
        return {
          text: T(`你的${who.zh}中風後，要人扶著才能行路。現在每朝替${who.zh}梳洗的，是你。`, `After a stroke, your ${who.en} needs a steady arm to walk. Now it is you who helps with washing every morning.`),
          fact: T('2021年發表的調查顯示，長期病患者的主要照顧者之中，28.9%是他們的配偶。', 'A survey published in 2021 found that 28.9% of people with chronic diseases were looked after mainly by their spouse.'),
          src: ['str63'],
          help: HELP.carer,
          choice: {
            prompt: T('你會怎樣安排？', 'How will you manage?'),
            options: [
              { label: T('申請日間護理', 'Apply for day care'), auto: 0.6, apply: (x) => { x.stats.spirits += 3; return T(`社工為你們做了評估。之後每星期有兩日，你的另一半去日間護理中心，你可以去街市、飲杯茶。`, 'A social worker assessed your needs. Now two days a week your partner goes to a day care centre, and you get to the market and a cup of tea.'); } },
              { label: T('自己照顧', 'Manage on your own'), auto: 0.4, apply: (x) => { x.stats.health -= 2; x.stats.people += 1; return T('你說自己應付得來。只是夜晚起身的次數多了，你在手機記下照顧者支援專線的號碼。', 'You said you could manage. You get up more often in the night now, and you saved the carer support hotline number in your phone.'); } },
            ],
          },
        };
      },
    },
    {
      id: 'lonely', when: (s) => !s.flags.inHome, p: (s) => (s.age < 80 ? 0.121 : 0.21), gap: 3, rep: 3, // ASSUMPTION: a weekly share used as a yearly chance; the survey gives it by age only, so living alone does not raise it
      run: (s, rng) => {
        s.stats.spirits -= 4;
        if (s.hard && !s.flags.hardKind && !s.flags.ltc && (s.arrangement === 'alone' || s.flags.widowed)) startHard(s, 'alone');
        const text = (s.flags.ltc || s.flags.dementia) && (s.arrangement !== 'alone' || s.flags.carer === 'helper')
          ? fresh(s, rng, 'lonelyCare', [
            T('這幾個月，屋企的話題都圍著覆診和照顧安排。有好幾個星期，你很想有人隨便同你傾傾偈，說些無關緊要的事。', 'For months the talk at home had been all appointments and care arrangements. For weeks you wished someone would simply chat with you about nothing in particular.'),
            T('大家都對你很好，但講的都是食藥、覆診、小心跌倒。你掛念以前同人講笑的日子。', 'Everyone was kind, but the talk was all medicines, appointments and mind the step. You missed the days when people joked with you.'),
            T('朋友來探你，坐了一陣就走。你知道他們不知道應該講甚麼。', 'Friends came to visit and left after a short while. You could tell they did not know what to say.'),
          ])
          : s.arrangement === 'alone'
          ? fresh(s, rng, 'lonelyAlone', [
            T('有一段日子，你一整日只跟樓下的管理員講過一句「早晨」。', 'For a while, the only words you spoke all day were "good morning" to the caretaker downstairs.'),
            T('有幾個星期，電話一直沒有響過。晚飯時，你開著電視，只為聽到有人講話。', 'For weeks the phone did not ring. At dinner you kept the television on just to hear voices.'),
            T('長假期，街上的人都和家人出去了。你在窗邊坐了一個下午，看著樓下的球場。', 'Over the long holiday everyone seemed to be out with family. You sat by the window all afternoon, watching the courts below.'),
          ])
          : s.spouse && !s.kidsAtHome
          ? fresh(s, rng, 'lonelySpouse', [
            T('有好幾個星期天氣不好，你和另一半都沒怎麼出門。日子過得很靜，你開始掛念以前常見面的老朋友。', 'For several weeks the weather was poor and you and your partner hardly went out. The days were very quiet, and you found yourself missing old friends.'),
            T('老朋友一個二個搬了去別區，飲茶的人少了。你和另一半說，好像很久沒有見過舊街坊。', 'One by one your old friends had moved to other districts, and fewer came to morning tea. You told your partner it felt a long time since you had seen the old neighbours.'),
            T('你們兩個人的日子過得很規律，但有時一整日，除了對方，沒有同第二個人講過話。', 'Your days together run like clockwork, but some days you speak to nobody but each other.'),
          ])
          : fresh(s, rng, 'lonelyHome', [
            T('屋企人人都忙。有好幾個星期，沒有人坐下來同你好好傾過偈。', 'Everyone at home was busy. For weeks, nobody sat down for a proper chat with you.'),
            T('屋企人早出晚歸，你一個人吃午飯吃了好幾個星期，覺得屋企很大。', 'The family left early and came home late. For weeks you ate lunch alone, and the flat felt very big.'),
            T('一家人坐在一齊，但人人都望著手機。你講了兩次以前的事，都沒有人接話。', 'The family sat together, but everyone was looking at a phone. Twice you started a story from the old days, and nobody picked it up.'),
          ]);
        return {
          text,
          fact: T('2024年，65歲或以上人士中有14.1%在過去一星期感到孤單（80歲或以上為21.0%）；95.8%在過去三個月曾與不同住的親友聯絡。', 'In 2024, 14.1% of people aged 65 and over had felt lonely in the past week (21.0% at 80 and over); 95.8% had been in touch with relatives or friends living apart in the past three months.'),
          src: ['ths87'],
          choice: {
            prompt: T('你會怎樣做？', 'What will you do?'),
            options: [
              { label: T('打電話給老朋友', 'Call an old friend'), auto: 0.4, apply: (x) => { x.stats.people += 5; x.stats.spirits += 4; return fresh(x, rng, 'lonelyCall', [
                T('你們在電話裡傾了一個鐘，約好下星期去飲茶。', 'You talked for an hour and agreed to go for dim sum next week.'),
                T('老朋友換了電話號碼。另一位舊同事把新號碼轉給你，你們講起以前那條街，講到電話差點沒電。', 'Your friend\'s number had changed. An old colleague passed on the new one, and you talked about the old street until your phone nearly ran out of battery.'),
                T('電話沒人接。兩日後老朋友回電，連聲說不好意思，你們一傾就好像從沒分開過。', 'Nobody answered. Two days later your friend called back, full of apologies, and you talked as if no time had passed.'),
                T('老朋友近來精神不太好，耳朵也不靈了，傾了一陣就累。你們約好下個月再打電話。', 'Your friend tires easily these days and is hard of hearing, so the call was short. You agreed to ring again next month.'),
              ]); } },
              { label: T('去長者中心看看', 'Drop in at the elderly centre'), auto: 0.4, apply: (x) => { x.stats.people += 6; x.stats.spirits += 3; if (x.flags.ltc || x.flags.dementia) return fresh(x, rng, 'lonelyCentreCare', [
                T('中心的職員陪你坐在窗邊，飲著茶傾偈，義工還讀了今日的報紙給你聽。', 'A staff member at the centre sat with you by the window over a cup of tea, and a volunteer read you the day\'s newspaper.'),
                T('家人推你去中心的懷舊小組。大家看舊相，你認出了以前住的那條街。', 'Your family took you to the centre\'s reminiscence group. Looking at old photos, you recognised the street where you used to live.'),
              ]); return fresh(x, rng, 'lonelyCentre', [
                T('中心剛好開班教用手機視像通話。你學得慢，但義工很有耐性。隔晚你試著打給老朋友，響了很久，終於接通了。', 'The centre had just started a class on video calls. You learned slowly, but the volunteer was patient. The next evening you tried a video call to an old friend; it rang a long time, then the picture came on.'),
                T('中心早上有唱歌班。第一個星期你只是跟著口型，到第三個星期，你已經會點自己最鍾意的歌。', 'The centre runs a morning singing group. The first week you only mouthed the words; by the third you were asking for your favourite song.'),
                T('你坐在健康講座的最後一排，未到茶點時間就走了。下星期，社工打電話來問你會不會再去。你說，或者會。', 'You sat at the back of a health talk and left before the tea. The next week a social worker phoned to ask if you would come again. You said you might.'),
              ]); } },
              { label: T('自己靜一靜', 'Keep to yourself for now'), auto: 0.2, apply: (x) => { x.stats.spirits -= 2; return { text: fresh(x, rng, 'lonelyKeep', [
                T('你把收音機開大了一點。隔日，樓下的管理員問你最近好不好。', 'You turned the radio up a little. The next day the caretaker downstairs asked how you were keeping.'),
                T('你留在家裡，一個星期又一個星期過去。過了很久，你才再有心情出街。', 'You stayed in, and the weeks went by. It was a long time before you felt like going out again.'),
                x.arrangement === 'alone'
                  ? T('你沒有出門。對面的街坊見你門口的報紙幾日沒拿，敲門問你是否安好。', 'You stayed in. The neighbour across the landing saw the newspaper lying at your door for days, and knocked to check on you.')
                  : T('你整天留在房裡。屋企人敲門，問你要不要一齊食飯，你說遲些。', 'You kept to your room. Someone at home knocked to ask if you would join them for dinner; you said later.'),
              ]), help: HELP.talk }; } },
            ],
          },
        };
      },
    },
    {
      id: 'volunteer', once: true, when: (s) => s.stats.health >= 50 && !s.flags.ltc && !s.flags.dementia, p: (s) => (s.focus === 'help' ? 0.3 : 0.02), // ASSUMPTION
      run: (s, rng) => {
        s.flags.volunteer = true; s.stats.spirits += 6; s.stats.people += 6;
        return {
          text: rng.pick([
            T('你參加了長者中心的義工隊，每個月探訪大廈裡幾位獨居長者，陪他們傾偈，看看藥有沒有過期。', 'You joined the elderly centre\'s volunteer team. Once a month you visit a few older neighbours who live alone, for a chat and to check their medicines are in date.'),
            T(`你在小學做「${s.sex === 'F' ? '故事婆婆' : '故事伯伯'}」，每星期講一次舊香港的故事。小朋友最愛聽你講以前的街市。`, 'You became a storyteller at a primary school, telling stories of old Hong Kong once a week. The children love hearing about the markets of the past.'),
            T('你在街坊常去的廟宇幫手派飯，每個星期六朝早都去。', 'You help hand out meals at the neighbourhood temple every Saturday morning.'),
            T('你在附近的教會幫手派飯，每個星期六朝早都去。', 'You help hand out meals at a church nearby every Saturday morning.'),
          ]),
          fact: T('2024年，有13.7%的65歲或以上人士在過去三個月參與社區或義工活動，當中一半每星期都參與。', 'In 2024, 13.7% of people aged 65 and over had taken part in community or volunteer activities in the past three months; half of them did so every week.'),
          src: ['ths87'],
        };
      },
    },
    {
      id: 'academy', once: true, when: (s) => s.age <= 80 && s.stats.health >= 45 && !s.flags.dementia && !s.flags.ltc, p: (s) => (s.focus === 'people' || s.focus === 'learn' ? 0.12 : 0.02), // ASSUMPTION
      run: (s) => {
        s.stats.spirits += 5; s.stats.people += 3;
        return {
          text: T('你在附近一間中學的長者學苑報讀了書法班。教你握筆的，是一個十五歲的學生義工。', 'You signed up for a calligraphy class at the Elder Academy in a nearby secondary school. The one who showed you how to hold the brush was a fifteen-year-old student volunteer.'),
          fact: T('全港約有200間長者學苑，設於中小學及專上院校。', 'There are about 200 Elder Academies in primary, secondary and post-secondary institutions across Hong Kong.'),
          src: ['elder_academy'],
        };
      },
    },
    {
      id: 'guangdong', once: true, when: (s) => s.age >= 66 && s.age <= 78 && (s.flags.oala || s.age >= 70) && !s.flags.ltc, p: () => 0.02, // ASSUMPTION
      run: () => ({
        text: T('鄰居搬了去中山，說想換個環境，退休後在那邊種種菜。她問你有沒有興趣一起去。', 'A neighbour moved to Zhongshan, wanting a change of scene, and now grows vegetables there. She asked if you would like to come too.'),
        fact: T('在廣東計劃下，合資格長者移居廣東後可領取高齡津貼或長者生活津貼；受惠人數由2021-22年度的19,509人增至2024-25年度的26,077人。', 'Under the Guangdong Scheme, eligible older people can keep receiving the Old Age Allowance or the Old Age Living Allowance while living in Guangdong; beneficiaries rose from 19,509 in 2021-22 to 26,077 in 2024-25.'),
        src: ['gd_scheme'],
        choice: {
          prompt: T('搬過去嗎？', 'Move across?'),
          options: [
            { label: T('留在香港', 'Stay in Hong Kong'), auto: 0.85, apply: (s) => { s.stats.people += 1; return T('你說還是捨不得茶樓的老伙記，還有街市那檔最好的薑。', 'You said you could not leave the waiters you had known for years at the tea house, or the stall at the market with the best ginger.'); } },
            { label: T('搬去廣東', 'Move to Guangdong'), auto: 0.15, apply: (s) => { s.flags.gd = true; s.stats.money += 6; s.stats.people -= 4; s.stats.spirits += 2; return T('你搬到中山，住在那位鄰居附近。回港覆診時，順道和家人吃飯。', 'You moved to Zhongshan, near your old neighbour. When you come back for check-ups, you have dinner with family.'); } },
          ],
        },
      }),
    },

    // --- memory and care ---
    {
      id: 'dementia', once: true, heavy: true, when: () => true, p: (s) => demOnset(s.age),
      run: (s, rng) => {
        s.flags.dementia = true; s.stats.health -= 8; s.stats.spirits -= 4;
        return {
          text: s.flags.inHome
            ? T('你開始記不起剛說過的話。院舍的姑娘請了醫生來看，醫生說是早期認知障礙症；家人也趕來陪你。', 'You began to lose track of what you had just said. The care home staff asked a doctor to see you, who said it was early dementia, and your family came.')
            : rng.pick([
              T('幾個月來，你常常一時說不出字，又忘記覆診日子。轉介之後等了一段時間，記憶診所的醫生說是早期認知障礙症。', 'For months you had been losing words and missing appointments. After a referral and a wait, a memory clinic doctor said it was early dementia.'),
              T('你在行了三十年的街市回家途中迷了路，一位相熟的檔主陪你走回家。之後做了評估，醫生說是早期認知障礙症。', 'On the way home from the market you had used for thirty years, you lost your way. A stallholder who knew you walked you home. After an assessment, the doctor said it was early dementia.'),
              s.arrangement === 'alone'
                ? T('你一個星期內兩次忘記熄爐。鄰居聞到焦味來敲門，之後社工安排你做評估，醫生說是早期認知障礙症。', 'Twice in one week you left the stove on. A neighbour smelled burning and knocked; a social worker then arranged an assessment, and the doctor said it was early dementia.')
                : T('你一個星期內兩次忘記熄爐。家人陪你去檢查，醫生說是早期認知障礙症。', 'Twice in one week you left the stove on. Your family took you for an assessment, and the doctor said it was early dementia.'),
            ]),
          fact: T('一項約於2005年進行的本地研究發現，認知障礙症隨年齡上升：65-69歲約2.5%，70-74歲約3.5%，85歲或以上約32.1%；83%的個案屬輕度。', 'A Hong Kong study carried out around 2005 found dementia rises with age: about 2.5% at 65-69, 3.5% at 70-74 and about 32.1% at 85 and over; 83% of cases were mild.'),
          src: ['dementia_0506'],
          help: HELP.family,
          soft: T('你的記性開始差了。醫生說是認知障礙症，家人輪流陪你覆診。', 'Your memory began to slip. The doctor said it was dementia, and your family took turns coming with you to appointments.'),
        };
      },
    },
    {
      id: 'dementia_support', once: true, when: (s) => s.flags.dementia && !s.flags.inHome, p: () => 0.8,
      run: (s) => {
        s.stats.spirits += 4; s.stats.people += 2;
        return {
          text: T('長者地區中心的職員開始每星期陪你做記憶訓練。有些日子你記得他們的名字，有些日子不記得；家人也在一點一點學習怎樣陪伴你。', 'Staff at the district elderly centre began doing memory exercises with you each week. Some days you remember their names, some days not; your family is learning, bit by bit, how to be with you.'),
        };
      },
    },
    {
      id: 'ltc', once: true, when: (s) => s.age >= 66, p: (s) => (s.flags.dementia ? 0.25 : onset(ltcPrev, s.age)), // ASSUMPTION: 25% a year once dementia is diagnosed
      run: (s) => {
        s.flags.ltc = true; s.stats.health -= 10;
        const options = [];
        if (s.spouse) options.push({ label: T('由另一半照顧', 'Your partner cares for you'), auto: 3, apply: (x) => { x.flags.carer = 'spouse'; x.stats.people += 3; return T('你的另一半成了你的照顧者。其實大家都不年輕了。', 'Your partner became your carer. Neither of you is young any more.'); } });
        if (s.kidsAtHome) options.push({ label: T('由子女照顧', 'Your children care for you'), auto: 3, apply: (x) => { x.flags.carer = 'child'; x.stats.people += 2; return T(`${child(x).zh}把工作轉成兼職，每日幫你洗澡、陪你吃飯。`, `Your ${child(x).en} moved to part-time work to help you bathe and sit with you at meals.`); } });
        options.push({ label: T('聘請外籍家庭傭工', 'Hire a live-in domestic helper'), auto: 1, ok: (x) => x.stats.money >= 45, apply: (x) => { x.flags.carer = 'helper'; x.stats.money -= 15; return T(`${x.helper}搬進了小房間。頭幾個星期大家都未慣，但她煲的粥很合你口味。她星期日放假，會去中環和朋友聚會。`, `${x.helper} moved into the small room as your live-in helper. The first weeks were strange for both of you, but she makes congee just the way you like it. On Sundays, her day off, she meets her friends in Central.`); } });
        options.push({ label: T('申請資助院舍', 'Apply for a subsidised care home'), auto: 1, apply: (x) => { x.flags.waitlist = x.age; return T('社工為你做了評估，你登記了輪候冊。等候期間，家居照顧服務的職員每星期上門兩次。', 'A social worker assessed your needs and you joined the waiting list. Meanwhile home care workers visit twice a week.'); } });
        return {
          text: T('你開始需要別人幫忙洗澡和上落樓梯。你不想麻煩人，但終於開口了。', 'You now need help to bathe and to manage the stairs. You did not want to trouble anyone, but in the end you asked.'),
          fact: T('2021年，住在家中的60歲或以上人士有16.6%需要長期照顧。在家中接受照顧的人，80%與主要照顧者同住；這些照顧者中，46.8%是子女或子女的配偶，26.6%是外籍家庭傭工，23.2%是配偶。', 'In 2021, 16.6% of people aged 60 and over living at home needed long-term care. Of those cared for at home, 80% lived with their main carer: a child or child-in-law in 46.8% of cases, a live-in domestic helper in 26.6% and a spouse in 23.2%.'),
          src: ['census_snapshot'],
          choice: { prompt: T('誰來照顧你？', 'Who will care for you?'), options },
        };
      },
    },
    {
      id: 'carer_strain', once: true, when: (s) => (s.flags.carer === 'child' && family(s)) || (s.flags.carer === 'spouse' && s.spouse), p: () => 0.5,
      run: (s) => (s.hard && !s.flags.hardKind && startHard(s, 'carer'), {
        text: s.flags.carer === 'child'
          ? T(`某個深夜，你聽到${child(s).zh}在廚房低聲哭。第二日，${childPron(s).zh}打了照顧者支援專線，社工約了${childPron(s).zh}下星期見面。`, `Late one night you heard your ${child(s).en} crying quietly in the kitchen. The next day ${childPron(s).en} called the carer support hotline, and a social worker arranged to meet the following week.`)
          : T('你的另一半一連幾晚都睡不好。社工安排你每星期兩日去日間護理中心。你的另一半終於睡了一個整覺，但醒來還是先望向你的床。', 'Your partner had not slept properly for nights. The social worker arranged day care for you two days a week. Your partner finally slept through a night, but still woke looking towards your bed.'),
        fact: T('2021年發表的調查顯示，照顧長期病患者的家人，每星期照顧時數的中位數為35小時，54.9%表示在過去一個月因照顧而感到有壓力。低收入家庭的護老者可申領每月$3,000生活津貼。', 'A survey published in 2021 found that people caring for someone with a chronic illness spend a median 35 hours a week on care, and 54.9% said they had felt stressed by it in the past month. Carers of older people in low-income families can receive a living allowance of $3,000 a month.'),
        src: ['str63', 'carers'],
        help: HELP.carer,
      }),
    },
    {
      id: 'home_apply', once: true, when: (s) => s.flags.ltc && s.flags.waitlist === undefined && s.age >= 80, p: () => 0.2, // ASSUMPTION
      run: () => ({
        text: T('家人和社工坐下來，傾你將來要不要入住院舍。你說要想一想，那幾天大家都沒有再提。', 'Your family and the social worker sat down to talk about whether you might move to a care home. You said you needed to think, and for a few days nobody mentioned it.'),
        fact: T('2026年9月30日的數字：護理安老宿位的整體平均輪候時間為12個月。按院舍類別計，改善買位計劃的私營院舍為6個月，津助及合約院舍為23個月。', 'Figures for 30 September 2026: the overall average wait for a care-and-attention place was 12 months. By type of home, it was 6 months for private homes in the Enhanced Bought Place Scheme and 23 months for subvented and contract homes.'),
        src: ['swd_cwl'],
        choice: {
          prompt: T('你們怎樣決定？', 'What do you decide?'),
          options: [
            { label: T('登記輪候，同時在家接受照顧', 'Join the list and keep care at home meanwhile'), auto: 0.6, apply: (s) => { s.flags.waitlist = s.age; return T('你登記了輪候冊。你說，能在家多住一日就多住一日。', 'You joined the waiting list. You said you would stay at home for as long as you can.'); } },
            { label: T('留在家中', 'Stay at home'), auto: 0.4, apply: (s) => { s.stats.people += 2; return T('一家人決定讓你留在家中，社區照顧服務的職員會繼續上門。', 'The family decided you will stay at home, with community care workers continuing to visit.'); } },
          ],
        },
      }),
    },
    {
      id: 'wait_long', once: true, when: (s) => s.hard && !s.flags.hardKind && s.flags.waitlist !== undefined && !s.flags.inHome && s.age - s.flags.waitlist >= 2, p: () => 1,
      run: (s) => { startHard(s, 'wait'); return { text: T('兩年過去，你仍在輪候冊上。社工上門重新評估，加多了家居照顧的時數。', 'Two years on, you were still on the waiting list. A social worker came to reassess your needs and added more hours of home care.') }; },
    },
    {
      id: 'care_home', once: true, when: (s) => s.flags.waitlist !== undefined && !s.flags.inHome, p: (s) => (s.age - s.flags.waitlist >= 1 ? 0.6 : 0.3) * (s.hard ? 0.5 : 1), // ASSUMPTION: near the 12-month overall average; slower in a hard life
      run: (s) => {
        s.flags.inHome = true; s.stats.people -= 3; s.stats.health += 2;
        return { text: T('院舍有宿位了。家人幫你把相架和那張舊被帶過去。第一晚你睡不慣，聽不到街上的聲音。', 'A care home place became available. Your family brought your photos and your old quilt. The first night you could not sleep, missing the sound of the street.') };
      },
    },

    {
      id: 'scam_loss', once: true, heavy: true, when: (s) => s.hard && !s.flags.hardKind && !s.flags.dementia && !s.flags.inHome && s.age <= 85, p: () => 0.03, // ASSUMPTION
      run: (s) => {
        s.stats.money -= 15; s.stats.spirits -= 6; startHard(s, 'money');
        return {
          text: T('有人來電，自稱銀行職員，說你的戶口被人盜用，要你把存款轉去「安全戶口」。你照做了。到發覺是騙局時，八萬元已經不見了。警察落了口供，但錢沒有追回。', 'A caller said he was from your bank and that your account had been taken over; you should move your savings to a "safe account". You did. By the time you knew it was a scam, $80,000 was gone. The police took a statement, but the money did not come back.'),
          soft: T('你遇上電話騙案，損失了一筆積蓄。', 'You lost some of your savings to a phone scam.'),
          help: HELP.scam,
        };
      },
    },
    {
      id: 'hard_days', gap: 1, rep: 3,
      when: (s) => hardOn(s) && s.age - s.flags.hardFrom >= 1 && s.age - s.flags.hardFrom <= 3 && !s.flags.inHome,
      p: () => 0.75,
      run: (s, rng) => {
        s.stats.spirits -= 2;
        const k = s.flags.hardKind, who = carerWord(s);
        const lines = {
          hip: [
            T('跌倒後幾個月，你仍然未能自己上落樓梯。物理治療師說進展會慢，事實也是這樣。', 'Months after the fall you still could not manage the stairs alone. The physiotherapist said progress would be slow, and it was.'),
            T('你不再去早市。大多數日子，你走得最遠的地方是窗邊。', 'You stopped going to the morning market. Most days, the furthest you walked was to the window.'),
            T('長者中心的義工逢星期四來，陪你行到走廊盡頭再行返來。有些星期，你只能做到這麼多。', 'A volunteer from the centre came on Thursdays to walk with you to the end of the corridor and back. Some weeks that was all you could manage.'),
          ],
          money: [
            T('錢沒了之後，你每朝都翻開銀行簿，雖然明知裡面寫著甚麼。', 'After the money went, you opened your bank book every morning, though you knew what it would say.'),
            T('你少了和老朋友飲茶，只說自己忙。', 'You went to dim sum with old friends less often, and told them you were busy.'),
            T('你不斷在腦裡重播那通電話：他說了甚麼，你本來可以怎樣回答。', 'You kept going over the call in your head: what he had said, and what you might have said instead.'),
            T('社工陪你把開支逐項看過，申請了你可以領的津貼。錢沒有回來，但日子比較容易打算。', 'A social worker went through your spending with you and helped you apply for what you were entitled to. The money did not come back, but the months were easier to plan.'),
          ],
          alone: [
            T('這份寂靜持續了好幾個月。有些日子，你要到天全黑了才開燈。', 'The quiet went on for months. Some days you did not turn on the light until it was fully dark.'),
            T('你不再應門給派單張的義工。有一個星期，連鄰居敲門你也沒有應。', 'You stopped answering the door to the volunteers with leaflets. One week you did not answer it to the neighbour either.'),
            T('一位義工每星期照樣打電話來，即使你說得很少。你開始等那通電話。', 'A volunteer kept phoning every week, even when you said very little. You began to wait for the call.'),
          ],
          carer: [
            T(`凌晨三點，你聽到廚房煲水的聲音：照顧你的${who.zh}又睡不著。`, `At three in the morning you heard the kettle in the kitchen: your ${who.en}, who looks after you, could not sleep again.`),
            T(`${who.zh}先是停了晚上的課，之後連每星期的麻雀也不打了。你們都沒有多講。`, `Your ${who.en} gave up the evening class, and then the weekly mahjong. Neither of you said much about it.`),
            T(`日間護理中心每星期有三日位。其餘幾日，所有事都由${who.zh}一手包辦。`, `The day care centre had a place three days a week. On the other days your ${who.en} did everything.`),
          ],
          wait: [
            T('輪候宿位的日子很長。家居照顧的職員每星期來兩次，其餘時間，家人輪流請假。', 'The wait for a place was long. Home care workers came twice a week; the rest of the time the family took turns to take leave.'),
            T('又一年過去，你仍在輪候冊上。你說，在家等也好，至少聽得到街上的聲音。', 'Another year passed and you were still on the list. You said waiting at home was not so bad: at least you could hear the street.'),
          ],
        }[k];
        return { text: fresh(s, rng, 'hard_' + k, lines), help: k === 'carer' ? HELP.carer : k === 'alone' ? HELP.talk : undefined };
      },
    },
    {
      id: 'hard_eases', once: true, when: (s) => hardOn(s) && s.age - s.flags.hardFrom >= 3 && !s.flags.inHome, p: () => 0.6,
      run: (s, rng) => {
        const k = s.flags.hardKind, who = carerWord(s);
        s.flags.hardDone = true; s.stats.spirits += 3;
        const text = {
          hip: T('慢慢地，你行到升降機大堂，再行到樓下的長櫈。你再沒有行得像以前那麼遠，但那張長櫈成了你的位置。', 'Slowly you got as far as the lift lobby, then the bench downstairs. You never walked as far as you used to, but the bench became yours.'),
          money: T('過了一段時間，你開始講得出口。你在中心把經過講給其他人聽，希望他們比你早一步收線。', 'In time you could talk about it. At the centre you told the others what had happened, so they would hang up sooner than you had.'),
          alone: T('有一朝，你又落樓飲茶。沒有人大驚小怪，伙記只是把你那杯茶放下。', 'One morning you went down for tea again. Nobody made a fuss; the waiter just put your cup down.'),
          carer: T(`一個星期的暫託服務，讓${who.zh}睡了幾晚好覺。回來時仍然累，但精神好了一點。`, `A week of respite care gave your ${who.en} a few nights' sleep. Still tired, but a little more like their old self.`),
          wait: T('你仍在輪候，但日子有了規律：星期二、五職員上門，星期日一家人吃飯。', 'You were still waiting, but the weeks had found a shape: the care workers on Tuesdays and Fridays, family dinner on Sundays.'),
        }[k];
        return { text };
      },
    },

    // --- everyday moments (no statistic) ---
    // Nothing here carries a figure. Each moment is gated so it fits the life: a grandchild only
    // when there is one, at an age that suits; a partner only while alive; outings only before
    // long-term care. Several wordings each, so a repeat reads as a new moment (fresh).
    // Family
    { id: 'grandkid', daily: true, gap: 3, rep: 3, when: (s) => hasGk(s) && near(s) && s.gkAge >= 4 && s.gkAge <= 12 && !s.flags.ltc, p: () => 0.35, run: (s, rng) => { s.stats.people += 2; s.stats.spirits += 1; return { text: fresh(s, rng, 'gkSchool', [
      T(`你接${gk(s).zh}放學，路上買了一串魚蛋給${gkPron(s).zh}。`, `You picked your ${gk(s).en} up from school and bought a skewer of fish balls on the way home.`),
      T(`${gk(s).zh}放學後在你家做功課。那些數學題你看不明白，就負責切橙。`, `Your ${gk(s).en} did homework at your place after school. The maths was beyond you, so you were in charge of cutting oranges.`),
      T(`你帶${gk(s).zh}去公園踩單車，自己坐在長櫈上大聲打氣。`, `You took your ${gk(s).en} cycling in the park and cheered loudly from the bench.`),
      sturdy(s) ? T(`每個平日下午都由你照顧${gk(s).zh}，直到${child(s).zh}放工來接。你們一齊看卡通片，一齊食下午茶。`, `Every weekday afternoon you look after your ${gk(s).en} until your ${child(s).en} comes home from work. You watch cartoons and have tea together.`) : null,
    ]) }; } },
    { id: 'gk_baby', daily: true, gap: 2, rep: 3, when: (s) => hasGk(s) && near(s) && s.gkAge <= 3 && !s.flags.ltc, p: () => 0.4, run: (s, rng) => { s.stats.spirits += 2; return { text: fresh(s, rng, 'gkBaby', [
      T(`你抱著${gk(s).zh}哄${gkPron(s).zh}睡覺，哼起你小時候聽過的兒歌。`, `You rocked your ${gk(s).en} to sleep, humming a nursery rhyme from your own childhood.`),
      T(`${child(s).zh}放工前，你幫手湊${gk(s).zh}。${gkPron(s).zh}扶著梳化站了起來，剛好給你看見。`, `You minded your ${gk(s).en} until your ${child(s).en} finished work, and were there to see the first time the baby stood up holding the sofa.`),
      T(`你替${gk(s).zh}揀了一對學行鞋。${gkPron(s).zh}跌了兩次，又自己爬起來。`, `You chose a first pair of shoes for your ${gk(s).en}, who fell twice and got up again each time.`),
      sturdy(s) ? T(`${child(s).zh}兩公婆都要返工，星期一至五由你湊${gk(s).zh}。你和${gkPron(s).zh}一齊午睡，一齊醒。`, `Your ${child(s).en} and partner both work, so you mind your ${gk(s).en} every weekday. The two of you nap at the same time and wake together.`) : null,
    ]) }; } },
    { id: 'gk_teen', daily: true, gap: 3, rep: 2, when: (s) => hasGk(s) && near(s) && s.gkAge >= 13 && s.gkAge <= 18 && !s.flags.inHome, p: () => 0.3, run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'gkTeen', [
      T(`${gk(s).zh}考試前溫書到深夜。你煲了一碗湯，靜靜放在${gkPron(s).zh}枱面。`, `Your ${gk(s).en} was studying late before exams. You made a bowl of soup and left it quietly on the desk.`),
      T(`${gk(s).zh}教你在手機用表情符號。你最鍾意那個合十的。`, `Your ${gk(s).en} taught you to use emoji on your phone. Your favourite is the one with hands pressed together.`),
      T(`${gk(s).zh}帶你去看電影，全程細細聲替你解釋劇情。`, `Your ${gk(s).en} took you to the cinema and whispered the plot to you all the way through.`),
    ]) }; } },
    { id: 'gk_adult', daily: true, gap: 3, rep: 2, when: (s) => hasGk(s) && s.gkAge >= 19, p: () => 0.3, run: (s, rng) => { s.stats.spirits += 2; return { text: fresh(s, rng, 'gkAdult', [
      T(`${gk(s).zh}出來工作，用第一份人工請你食飯。`, `Your ${gk(s).en} started work and took you out for a meal with the first pay packet.`),
      T(`${gk(s).zh}帶了朋友來探你。你偷偷問${gkPron(s).zh}幾時請飲。`, `Your ${gk(s).en} brought a friend to visit, and you quietly asked when the wedding would be.`),
      T(`${gk(s).zh}放假回來，坐在你身邊聽你講${child(s).zh}細個的事。`, `Your ${gk(s).en} came home on holiday and sat beside you to hear stories about your ${child(s).en} as a child.`),
    ]) }; } },
    { id: 'first_gk', daily: true, once: true, when: (s) => family(s) && !hasGk(s) && s.age < 80, p: (s) => (s.age < 70 ? 0.05 : s.age < 75 ? 0.035 : 0.015), run: (s, rng) => {
      s.gkAge = 0; s.gkSex = rng() < 0.5 ? 'F' : 'M'; s.stats.spirits += 4;
      const title = s.childSex === 'F' ? (s.sex === 'M' ? T('公公', 'grandfather') : T('婆婆', 'grandmother')) : (s.sex === 'M' ? T('爺爺', 'grandfather') : T('嫲嫲', 'grandmother'));
      if (s.childAway) return { text: T(`${child(s).zh}在${city(s).zh}生了BB，你做${title.zh}了。你在視像裡看著那張小臉，看了很久。`, `Your ${child(s).en} in ${city(s).en} had a baby, and you became a ${title.en}. You looked at the little face on the video call for a long time.`) };
      return { text: T(`${child(s).zh}生了BB，你做${title.zh}了。你在醫院隔著玻璃看了很久。`, `Your ${child(s).en} had a baby, and you became a ${title.en}. You stood at the nursery window for a long time.`) };
    } },
    { id: 'phone', daily: true, once: true, when: (s) => hasGk(s) && near(s) && s.gkAge >= 10 && s.age < 82 && !s.flags.dementia, p: () => 0.25, run: (s) => { s.stats.people += 2; return { text: T(`${gk(s).zh}教你在手機用語音輸入。你現在每日都在家人的WhatsApp群組講早晨。`, `Your ${gk(s).en} taught you voice typing on your phone. Now you say good morning in the family WhatsApp group every day.`) }; } },
    { id: 'yum_cha', daily: true, gap: 3, rep: 3, when: (s) => near(s) && !s.flags.ltc, p: (s) => (s.focus === 'people' ? 0.45 : 0.3), run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'yumCha', [
      T(`星期日一家人去飲茶。你堅持要埋單，但搶不過${child(s).zh}。`, `The family went for dim sum on Sunday. You insisted on paying, but your ${child(s).en} got there first.`),
      T(`你和${child(s).zh}去飲早茶，一人一份報紙，傾兩句又看兩版。`, `You and your ${child(s).en} went for morning tea with a newspaper each, chatting a little and reading a little.`),
      T('一家人去飲茶，你逐籠點心問大家夠不夠食，自己反而忘了起筷。', 'At family dim sum you kept asking whether everyone had enough, and forgot to eat yourself.'),
    ]) }; } },
    { id: 'cook', daily: true, gap: 3, rep: 2, when: (s) => near(s) && !s.flags.ltc && !s.flags.dementia, p: () => 0.2, run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'cook', [
      T(`你教${child(s).zh}煲你媽媽傳下來的老火湯，${childPron(s).zh}用手機把每一步拍下來。`, `You taught your ${child(s).en} the slow-cooked soup your mother taught you. ${childPron(s).en === 'she' ? 'She' : 'He'} filmed every step on the phone.`),
      T(`你教${child(s).zh}包餃子。${childPron(s).zh}包的形狀奇奇怪怪，你照樣煮來食。`, `You taught your ${child(s).en} to fold dumplings. They came out in strange shapes, and you cooked them all the same.`),
    ]) }; } },
    { id: 'quarrel', daily: true, gap: 4, rep: 2, when: (s) => family(s) && s.kidsAtHome && !s.flags.inHome, p: () => 0.15, run: (s, rng) => { s.stats.spirits -= 1; return { text: fresh(s, rng, 'quarrel', [
      T(`你和${child(s).zh}為了一件小事爭拗了幾句。晚飯時大家都沒有再提，${childPron(s).zh}替你夾了一塊雞。`, `You and your ${child(s).en} had a few sharp words over something small. At dinner nobody mentioned it, and ${childPron(s).en} put a piece of chicken in your bowl.`),
      T(`你和${child(s).zh}為了冷氣開幾多度爭了兩句。第二朝，冷氣已調到你慣用的度數，枱面還有張字條，提你出街記得帶遮。`, `You and your ${child(s).en} argued about the air-conditioner setting. The next morning it was set the way you like it, and a note on the table reminded you to take an umbrella.`),
    ]) }; } },
    { id: 'child_near', daily: true, gap: 2, rep: 3, when: (s) => near(s) && !s.kidsAtHome && !s.flags.inHome, p: (s) => (s.focus === 'people' ? 0.4 : 0.25), run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'childNear', [
      T(`每個星期日晚，${child(s).zh}都會打電話來，問你食咗飯未。`, `Every Sunday evening your ${child(s).en} phones to ask whether you have eaten.`),
      T(`${child(s).zh}幫你把手機的字體調大了，臨走前再示範一次點樣視像通話。`, `Your ${child(s).en} made the text on your phone bigger and showed you once more how to make a video call before leaving.`),
      T(`${child(s).zh}放假回來吃飯，帶了一袋你鍾意的生果。`, `Your ${child(s).en} came round for dinner on a day off, with a bag of the fruit you like.`),
    ]) }; } },
    { id: 'outing', daily: true, gap: 3, rep: 2, when: (s) => near(s) && !s.flags.ltc && s.stats.health >= 45, p: () => 0.2, run: (s, rng) => { s.stats.spirits += 2; return { text: fresh(s, rng, 'outing', [
      T(`${child(s).zh}放假，載你去西貢食海鮮。你們在碼頭看漁船回來。`, `On a day off your ${child(s).en} drove you to Sai Kung for seafood, and you watched the fishing boats come in.`),
      T(`你和${child(s).zh}坐纜車上昂坪，${childPron(s).zh}一路扶著你。`, `You and your ${child(s).en} took the cable car up to Ngong Ping, with a steadying arm all the way.`),
      T(`${child(s).zh}帶你去看花展，你們在鬱金香前面拍了很多相。`, `Your ${child(s).en} took you to the flower show, and you took a lot of photos in front of the tulips.`),
    ]) }; } },
    { id: 'child_away', daily: true, gap: 2, rep: 4, when: (s) => s.childAway && !s.flags.inHome, p: (s) => (s.focus === 'people' ? 0.45 : 0.3), run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'childAway', [
      AWAY[s.awayCity].far
        ? T(`${child(s).zh}${why(s).zh}。${childPron(s).zh}那邊是晚上，你這邊是早上；${childPron(s).zh}一放工就打電話來，你一邊吃早餐一邊同${childPron(s).zh}傾。`, `Your ${child(s).en} ${why(s).en}. ${childPron(s).en === 'she' ? 'Her' : 'His'} evening is your morning, so the call comes just as you sit down to breakfast.`)
        : T(`${child(s).zh}${why(s).zh}。每晚九點，${childPron(s).zh}都準時打電話來，問你今日吃了甚麼。`, `Your ${child(s).en} ${why(s).en}. At nine every evening the call comes, asking what you ate today.`),
      T(`長者中心的義工教你用手機視像通話。第一次就見到${child(s).zh}在${city(s).zh}向你揮手。`, `A volunteer at the elderly centre helped you set up video calls. First try, there was your ${child(s).en} in ${city(s).en}, waving.`),
      T(`${child(s).zh}${why(s).zh}。對面單位的街坊每次去街市，都順道問你要不要帶些餸。`, `Your ${child(s).en} ${why(s).en}. The neighbour across the landing asks if you need anything every time she goes to the market.`),
      T(`你在電話裡教${child(s).zh}煲你拿手的湯。${childPron(s).zh}在${city(s).zh}的廚房照著做，拍了相給你看。`, `On the phone you talked your ${child(s).en} through your best soup. ${childPron(s).en === 'she' ? 'She' : 'He'} made it in a kitchen in ${city(s).en} and sent you a photo.`),
    ].concat(s.chinese ? [T(`${child(s).zh}今年回來過年。一家人去飲茶，${childPron(s).zh}搶著埋單，你扮作不肯，心裡很高興。`, `Your ${child(s).en} came home for Lunar New Year. At dim sum ${childPron(s).en} grabbed the bill; you protested, secretly delighted.`)] : [])
      .concat(hasGk(s) ? [T(`${gk(s).zh}在視像裡唱了一首學校教的歌給你聽，你叫${gkPron(s).zh}再唱一次。`, `On a video call your ${gk(s).en} sang you a song from school, and you asked for it again.`)] : [])) }; } },
    // A partner, while alive; a partner remembered, after.
    { id: 'walk', daily: true, gap: 3, rep: 3, when: (s) => s.spouse && !s.flags.ltc && !s.flags.partnerCare, p: () => 0.3, run: (s, rng) => { s.stats.people += 2; s.stats.spirits += 1; return { text: fresh(s, rng, 'walk', [
      T('晚飯後，你和另一半沿海旁散步，一人一句講起剛結婚時的事。', 'After dinner you and your partner walked along the waterfront, taking turns to remember when you were first married.'),
      T('結婚紀念日，你們去了第一次拍拖的茶餐廳，點了同一款奶茶。', 'On your wedding anniversary the two of you went back to the café of your first date and ordered the same milk tea.'),
      T('你和另一半每晚八點準時坐好追電視劇，一路看一路估結局。', 'Every night at eight you and your partner sit down for your drama series, guessing how it will end.'),
      T('你們一齊整理舊相簿，為某張相是哪一年影的爭論了半日。', 'You sorted the old photo albums together and spent half a day arguing about the year one picture was taken.'),
    ]) }; } },
    { id: 'remember', daily: true, gap: 3, rep: 2, when: (s) => s.flags.widowed && s.age - s.flags.widowAge >= 2, p: () => 0.3, run: (s, rng) => { s.stats.spirits += 1; return { text: fresh(s, rng, 'remember', [
      T(`另一半的生忌，你煮了${partnerPron(s).zh}最鍾意的餸，擺多一對筷子。`, `On what would have been your partner's birthday you cooked ${partnerPron(s).en} favourite dish and set out an extra pair of chopsticks.`),
      T('你在抽屜裡找到另一半寫給你的舊信，坐在床邊讀了一遍又一遍。', 'You found an old letter from your partner in a drawer and read it again and again, sitting on the bed.'),
    ].concat(s.flags.dementia || s.flags.ltc ? [] : [T('你學會了另一半以前做的事：自己去交水費，自己換燈膽。', 'You learned to do the things your partner used to do: paying the water bill, changing a light bulb.')])) }; } },
    { id: 'stroke_after', daily: true, once: true, when: (s) => s.flags.strokeAge !== undefined && s.age - s.flags.strokeAge >= 1 && s.age - s.flags.strokeAge <= 4 && !s.flags.inHome, p: () => 0.6, run: (s, rng) => ({ text: rng.pick([
      T('中風之後，你右手仍然不太靈活。你學會了用左手扣鈕，只是比以前慢。', 'Since the stroke your right hand has stayed clumsy. You button your shirt with your left now, only more slowly.'),
      T('復康中心的治療師說你進步了。你自己知道，有些字仍然要想一想才講得出口。', 'The therapist at the rehabilitation centre said you had improved. You knew that some words still took a moment to find.'),
    ]) }) },
    { id: 'cancer_after', daily: true, once: true, when: (s) => s.flags.cancerAge !== undefined && s.age - s.flags.cancerAge >= 2 && !s.flags.inHome, p: () => 0.5, run: (s, rng) => ({ text: rng.pick([
      T('每次覆診，你都屏住呼吸，等到醫生笑一笑才放鬆。這一次，報告也沒有問題。', 'At every follow-up you held your breath until the doctor smiled. This time, too, the results were clear.'),
      T('治療完結兩年，你仍然容易累，但開始重新計劃去旅行。', 'Two years after treatment you still tire easily, but you have started planning a trip again.'),
    ]) }) },
    // Neighbourhood and community: loose gates, as long as the person still lives at home.
    { id: 'tai_chi', daily: true, gap: 3, rep: 3, when: (s) => !s.flags.ltc && s.stats.health >= 40 && !hurt(s), p: (s) => (s.focus === 'health' ? 0.4 : 0.25), run: (s, rng) => { s.stats.health += 1; return { text: fresh(s, rng, 'taiChi', [
      T('你每朝去公園打太極。那班老朋友總會等齊人才開始。', 'Every morning you do tai chi in the park. The group always waits until everyone has arrived.'),
      T('太極班的師傅讚你的「雲手」有板有眼了。', 'The tai chi teacher said your "cloud hands" have really taken shape.'),
      T('落雨天，大家改去長者中心的活動室打太極，打完一齊飲杯茶。', 'On rainy days the group moves to the activity room at the elderly centre, with a cup of tea afterwards.'),
    ]) }; } },
    { id: 'market', daily: true, gap: 2, rep: 3, when: (s) => !s.flags.ltc && !s.flags.inHome, p: () => 0.25, run: (s, rng) => { s.stats.people += 1; return { text: fresh(s, rng, 'market', [
      T('街市的菜檔老闆記得你只要半斤菜心，見到你就先揀定。', 'The greengrocer at the market knows you only want half a catty of choi sum, and has it picked out when you arrive.'),
      T('你在魚檔講價講了很久，最後老闆多送了你一條蔥。', 'You bargained a long time at the fish stall, and in the end the stallholder threw in a spring onion.'),
      T('收市前半個鐘，你去街市買生果，順便同相熟的檔主傾兩句。', 'Half an hour before the market closed you went for fruit, and stopped to chat with the stallholders you know.'),
    ]) }; } },
    { id: 'teahouse', daily: true, gap: 2, rep: 3, when: (s) => !s.flags.ltc && !s.flags.inHome, p: () => 0.2, run: (s, rng) => { s.stats.people += 1; return { text: fresh(s, rng, 'teahouse', [
      T('樓下茶餐廳的伙計一見你入門，就喊：「熱奶茶少甜！」', 'The waiter at the café downstairs calls out "hot milk tea, less sweet!" the moment you walk in.'),
      T('你和幾個老街坊在茶餐廳坐了一個朝早，由天氣講到電視劇。', 'You and a few old neighbours spent the morning at the café, talking about everything from the weather to the TV dramas.'),
      T('茶餐廳換了新老闆，菜單多了幾款新嘢。你試了一次，還是叫回常餐。', 'The café changed hands and the menu has new things on it. You tried one once, then went back to the set breakfast.'),
    ]) }; } },
    { id: 'park', daily: true, gap: 3, rep: 2, when: (s) => !s.flags.ltc && !s.flags.inHome, p: () => 0.2, run: (s, rng) => { s.stats.people += 1; return { text: fresh(s, rng, 'park', [
      T('你在公園看人捉象棋，忍不住出聲提點，結果被叫坐低捉一盤。', 'Watching a game of Chinese chess in the park, you could not help giving advice, and were invited to sit down and play.'),
      T('公園的老朋友教你玩一種新的紙牌遊戲，你輸了三局才搞清楚規則。', 'Friends in the park taught you a new card game. You lost three rounds before you understood the rules.'),
    ]) }; } },
    { id: 'hike', daily: true, gap: 3, rep: 2, when: (s) => !s.flags.ltc && sturdy(s), p: (s) => (s.focus === 'health' ? 0.3 : 0.15), run: (s, rng) => { s.stats.health += 1; s.stats.spirits += 1; return { text: fresh(s, rng, 'hike', [
      s.age < 76 ? T('你和行山的朋友行了一段麥理浩徑，在山頂分著食橙。', 'You walked a section of the MacLehose Trail with your hiking friends and shared oranges at the top.') : null,
      T('你們揀了一條平路的郊遊徑，沿路有人介紹每種樹的名字。', 'The group chose a level nature trail, and someone named every tree along the way.'),
      T('夏天，你每朝七點去公眾泳池游幾個塘，救生員都認得你。', 'All summer you swam a few lengths at the public pool at seven each morning. The lifeguards know you by now.'),
    ]) }; } },
    { id: 'learn', daily: true, gap: 3, rep: 2, when: (s) => !s.flags.ltc && !s.flags.dementia && s.age < 86, p: (s) => (s.focus === 'learn' ? 0.4 : 0.12), run: (s, rng) => { s.stats.spirits += 2; return { text: fresh(s, rng, 'learn', [
      T('你在長者中心學書法，把第一次寫好的「福」字貼在門口。', 'You took up calligraphy at the elderly centre and stuck your first good "fortune" character on the front door.'),
      T('你參加了智能手機班，學會了用手機付款。', 'You joined a smartphone class and learned to pay with your phone.'),
      T('你學畫水彩，畫了一幅維港夜景送給鄰居。', 'You learned watercolour and gave a painting of the harbour at night to a neighbour.'),
      T('你在公共圖書館借了幾本大字版小說，一個星期就看完。', 'You borrowed a few large-print novels from the public library and finished them within a week.'),
    ]) }; } },
    { id: 'help_out', daily: true, gap: 3, rep: 2, when: (s) => !s.flags.ltc && !s.flags.dementia && s.stats.health >= 45 && !(s.flags.strokeAge !== undefined && s.age - s.flags.strokeAge < 2) && !s.flags.hip, p: (s) => (s.focus === 'help' ? 0.4 : 0.12), run: (s, rng) => { s.stats.spirits += 2; s.stats.people += 1; return { text: fresh(s, rng, 'helpOut', [
      sturdy(s) ? T('你幫隔籬屋的婆婆把一袋米抬上樓，她堅持要你帶兩個橙走。', 'You carried a bag of rice upstairs for the elderly woman next door, and she insisted you take two oranges.') : null,
      T('樓下的街坊入了醫院，你幫手餵了兩個星期貓。', 'A neighbour downstairs went into hospital, and you fed the cat for two weeks.'),
      T('你每星期去長者中心一次，陪幾位行動不便的會員傾偈。', 'Once a week you go to the elderly centre to chat with members who find it hard to get about.'),
      T('你教鄰居的小朋友捉象棋。小朋友贏了你一盤，開心到跳起。', 'You taught the neighbours\' child Chinese chess, and the child jumped for joy after winning a game.'),
    ]) }; } },
    { id: 'neighbour', daily: true, gap: 3, rep: 2, when: (s) => !s.flags.inHome, p: () => 0.2, run: (s, rng) => { s.stats.people += 1; return { text: fresh(s, rng, 'neighbour', [
      T('對面單位的新住客搬進來，你送了一袋柑過去。他們的小朋友現在見到你都會大聲叫早晨。', 'New neighbours moved in across the landing, and you took them a bag of mandarins. Their little one now says good morning every time.'),
      T('隔籬屋的街坊出門旅行，把鎖匙交給你，托你幫手淋花。', 'The neighbours next door went travelling and left you their key to water the plants.'),
      T('落大雨，一位街坊把傘借給你，說下次見面才還。', 'It poured with rain, and a neighbour lent you an umbrella, saying you could give it back next time.'),
    ]) }; } },
    { id: 'kind', daily: true, once: true, when: (s) => !s.flags.inHome, p: () => 0.1, run: () => ({ text: T('你在巴士上跌了八達通，一位後生仔追落車交還給你。', 'You dropped your Octopus card on the bus, and a young man ran after you to give it back.') }) },
    { id: 'home_days', daily: true, gap: 2, rep: 3, when: (s) => !s.flags.inHome, p: (s) => (s.focus === 'rest' ? 0.3 : 0.12), run: (s, rng) => { s.stats.spirits += 1; return { text: fresh(s, rng, 'homeDays', [
      T('你在窗台種的辣椒結了果，摘了一袋送給鄰居。', 'The chillies on your windowsill fruited, and you picked a bagful for the neighbours.'),
      T('你把一盆快枯的富貴竹救活了，每朝都同它講兩句。', 'You brought a nearly dead lucky bamboo back to life, and say a few words to it every morning.'),
      T('你每朝先聽收音機的天氣報告，再決定帶不帶遮。', 'Every morning you listen to the weather on the radio before deciding whether to take an umbrella.'),
      T('天氣轉涼，你把冬天的衣服翻出來，口袋裡竟然有一張五十蚊紙。', 'When the weather turned cool you got out your winter clothes and found a fifty-dollar note in a pocket.'),
    ]) }; } },
    { id: 'alone_days', daily: true, gap: 3, rep: 2, when: (s) => s.arrangement === 'alone' && !s.flags.inHome, p: () => 0.25, run: (s, rng) => { s.stats.people += 1; return { text: fresh(s, rng, 'aloneDays', [
      T('管理員每朝見到你都問一句：「今日去邊呀？」你通常答「去飲茶」。', 'Every morning the caretaker asks where you are off to today. Usually you say "for tea".'),
      T('樓上的街坊約你一齊去街市，買完餸再一齊行返來。', 'The neighbour upstairs asked you along to the market, and you walked back together afterwards.'),
    ]) }; } },
    { id: 'centre', daily: true, gap: 3, rep: 2, when: (s) => !s.flags.inHome && !s.flags.dementia, p: (s) => (s.focus === 'people' ? 0.25 : 0.12), run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, s.chinese ? 'centreZh' : 'centre', s.chinese ? [
      T('長者中心搞卡拉OK，你唱了一首粵曲，台下有人跟著拍手。', 'The elderly centre held a karaoke afternoon. You sang a Cantonese opera tune and people clapped along.'),
      T('你參加了長者中心的健康講座，回家後開始每日量血壓。', 'You went to a health talk at the elderly centre and started checking your blood pressure every day.'),
    ] : [
      T('長者中心搞生日會，大家為這個月生日的會員唱生日歌，也包括你。', 'The elderly centre held a birthday party for everyone born this month, you included.'),
      T('你參加了長者中心的健康講座，回家後開始每日量血壓。', 'You went to a health talk at the elderly centre and started checking your blood pressure every day.'),
    ]) }; } },
    { id: 'faith', daily: true, gap: 3, rep: 2, when: (s) => s.chinese && !s.flags.inHome && !s.flags.ltc, p: () => 0.1, run: (s, rng) => { s.stats.spirits += 1; return { text: fresh(s, rng, 'faith', [
      T('星期日返教會，你負責在門口派詩歌紙。', 'At church on Sunday you hand out the hymn sheets at the door.'),
      T('初一十五，你去廟裡上香，順道同廟祝傾幾句。', 'On the first and fifteenth of the lunar month you light incense at the temple and chat with the keeper.'),
    ]) }; } },
    // Seasons and festivals.
    { id: 'typhoon', daily: true, gap: 3, rep: 2, when: () => true, p: () => 0.2, run: (s, rng) => {
      let text;
      if (s.flags.inHome) text = T('八號風球。院舍的職員把大家聚到飯堂，煲了一鍋糖水，有人搬出了麻雀。', 'Typhoon Signal No. 8. The care home staff gathered everyone in the dining hall and made a big pot of sweet soup, and somebody brought out the mahjong set.');
      else if (s.arrangement === 'alone' && !s.used.careTeam) { s.used.careTeam = 1; text = T('八號風球。地區關愛隊的義工打電話來，問你屋企有沒有足夠食物。', 'Typhoon Signal No. 8. A volunteer from the district Care Team phoned to check you had enough food at home.'); }
      else if (s.arrangement === 'alone') text = fresh(s, rng, 'tyAlone', [
        T('八號風球。你早一日買定了餸，聽著收音機的報告，打了個電話給老朋友。', 'Typhoon Signal No. 8. You had done the shopping the day before, so you listened to the radio and phoned an old friend.'),
        T('八號風球。你用膠紙貼好窗，泡了一碗麵，聽著雨聲睡了個午覺。', 'Typhoon Signal No. 8. You taped the windows, made a bowl of noodles and napped to the sound of the rain.'),
      ]);
      else if (s.spouse && !s.kidsAtHome) text = fresh(s, rng, 'tySpouse', [
        T('八號風球。你和另一半留在屋企，煲了一鍋紅豆沙，看了一個下午電視。', 'Typhoon Signal No. 8. You and your partner stayed in, made a pot of red bean soup and watched television all afternoon.'),
        T('八號風球。你們在窗邊看著樹搖得很厲害，另一半說起年輕時打風的日子。', 'Typhoon Signal No. 8. You watched the trees bending outside, and your partner remembered the storms of your youth.'),
      ]);
      else text = fresh(s, rng, 'tyHome', [
        T('八號風球。一家人留在屋企打了一個下午麻雀。', 'Typhoon Signal No. 8. The family stayed in and played mahjong all afternoon.'),
        T('八號風球。屋企人都不用上班，大家難得一齊食了一頓午飯。', 'Typhoon Signal No. 8. Nobody had to go to work, and for once everyone had lunch together.'),
      ]);
      return { text };
    } },
    { id: 'new_year', daily: true, gap: 3, rep: 2, when: (s) => s.chinese && !s.flags.inHome, p: () => 0.25, run: (s, rng) => { s.stats.spirits += 2; return { text: fresh(s, rng, 'newYear', [
      T('農曆新年，你逐個後生派利是，大家都說你氣色好。', 'At Lunar New Year you handed a red packet to each of the young ones, and everyone said you looked well.'),
      T('年廿八洗邋遢，你把屋企抹得乾乾淨淨，再貼上新揮春。', 'On the 28th of the twelfth lunar month you cleaned the flat from top to bottom and put up new couplets.'),
      T('年初二開年，你煮了一大鍋髮菜蠔豉，親戚朋友都來拜年。', 'On the second day of the new year you cooked a big pot of dried oysters with black moss, and relatives and friends came to visit.'),
    ]) }; } },
    { id: 'mid_autumn', daily: true, once: true, when: (s) => s.chinese && !s.flags.inHome, p: () => 0.2, run: (s) => { s.stats.spirits += 2; return { text: hasGk(s) && near(s) && s.gkAge <= 12
      ? T(`中秋節，一家人在樓下公園賞月，${gk(s).zh}提著燈籠跑來跑去。`, `At Mid-Autumn the family watched the moon in the park downstairs, and your ${gk(s).en} ran around with a lantern.`)
      : T('中秋節，長者中心派月餅，你和幾位老朋友在公園賞月。', 'At Mid-Autumn the elderly centre handed out mooncakes, and you watched the moon in the park with a few old friends.') }; } },
    { id: 'dumplings', daily: true, once: true, when: (s) => s.chinese && !s.flags.inHome && !s.flags.ltc, p: () => 0.15, run: (s) => { s.stats.people += 1; return { text: T('端午節前，你包了十幾隻糭，分了一半給鄰居。', 'Before the Dragon Boat Festival you wrapped a dozen rice dumplings and gave half to the neighbours.') }; } },
    { id: 'solstice', daily: true, once: true, when: (s) => s.chinese && !s.flags.inHome, p: () => 0.15, run: (s) => { s.stats.people += 1; return { text: family(s) || s.spouse
      ? T('冬至，你煮了一大鍋湯，等家人回來做節。', 'At the winter solstice you made a big pot of soup and waited for the family to come home for the festival meal.')
      : T('冬至，長者中心搞聚餐，你和同枱的人一見如故。', 'At the winter solstice the elderly centre held a dinner, and you got on at once with the people at your table.') }; } },
    { id: 'summer', daily: true, gap: 4, rep: 2, when: (s) => !s.flags.inHome && !s.owner, p: () => 0.1, run: (s, rng) => { s.stats.money -= 1; return { text: fresh(s, rng, 'summer', [
      T('夏天很熱。冷氣開還是不開，你每晚都要想一想；有幾個下午，你去長者中心坐，一邊飲茶一邊吹冷氣，跟老朋友傾偈。', 'The summer was hot. Every night you weighed up whether to run the air conditioner; on some afternoons you went to the elderly centre instead, with a cup of tea and old friends to talk to.'),
      T('又一個酷熱的夏天。你朝早趁涼去街市，下午就去公共圖書館看報紙，到傍晚才回家。', 'Another very hot summer. You went to the market early while it was cool, spent the afternoons reading the papers at the public library, and came home towards evening.'),
    ]) }; } },
    { id: 'cold', daily: true, once: true, when: (s) => !s.flags.inHome && s.age >= 70, p: () => 0.1, run: () => ({ text: T('寒冷天氣警告生效。長者中心的職員打電話來提你著多件衫，下午還送來一張新棉被。', 'A cold weather warning was in force. Staff from the elderly centre phoned to remind you to wrap up, and dropped off a new quilt that afternoon.') }) },
    // Other lives.
    { id: 'phone_scam', daily: true, once: true, when: (s) => !s.flags.dementia && !s.flags.inHome, p: () => 0.1, run: () => ({ text: T('有人來電，說你的親人出了事，要你立即過數。你心裡一慌，但先打給那位親人，原來對方在公司上班，安然無恙。你把來電號碼報了警。', 'A caller said a relative of yours was in trouble and needed money at once. Your heart jumped, but you phoned the relative first; they were fine, at work. You reported the number to the police.') }) },
    { id: 'friend', daily: true, gap: 3, rep: 2, when: (s) => s.age >= 74, p: () => 0.2, run: (s, rng) => { s.stats.spirits -= 2; return { text: fresh(s, rng, 'friendGone', [
      T('又一位舊同學離開了。中學同學群組裡，大家互相叮囑要保重。', 'Another old classmate passed away. In the school group chat, everyone reminded each other to take care.'),
      T('舊同事的喪禮上，你見到幾十年沒見的老朋友，大家約好要多些見面。', 'At an old colleague\'s funeral you saw friends you had not seen in decades, and you all promised to meet more often.'),
    ]) }; } },
    { id: 'lift', daily: true, once: true, when: (s) => !s.flags.inHome, p: () => 0.1, run: (s) => { s.stats.people -= 1; return { text: T('大廈升降機維修了一個星期。你每日只落街一次，鄰居幫你買了兩次餸。', 'The lift in your building was being repaired for a week. You went out only once a day, and a neighbour did your shopping twice.') }; } },
    { id: 'work_day', daily: true, gap: 2, rep: 2, when: (s) => s.working && !s.flags.ltc, p: () => 0.35, run: (s, rng) => { s.stats.people += 1; return { text: fresh(s, rng, 'workDay', [
      T('公司新來的後生仔有不明白的地方都來問你，你把幾十年的竅門教給他。', 'The new young colleague comes to you whenever something is unclear, and you pass on decades of know-how.'),
      T('同事知道你生日，午飯時買了個蛋糕給你。', 'Your colleagues found out it was your birthday and brought a cake at lunchtime.'),
    ]) }; } },
    { id: 'hometown', daily: true, gap: 3, rep: 2, when: (s) => s.born === 'mainland' && s.chinese && !s.flags.ltc && s.age < 85 && !hurt(s), p: () => 0.25, run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'hometown', [
      T('清明節，你回鄉下拜山，順道探望表弟一家。村口那棵榕樹還在。', 'At Ching Ming you went back to your home village to tend the family graves, and visited your cousin\'s family. The banyan tree at the village gate is still there.'),
      T('你回鄉下飲表姪的喜酒，席上很多人都要你講香港的事。', 'You went back to your home village for your cousin\'s son\'s wedding, and everyone at the table wanted to hear about Hong Kong.'),
    ]) }; } },
    { id: 'dialect', daily: true, once: true, when: (s) => s.born === 'mainland' && s.chinese && !s.flags.inHome, p: () => 0.2, run: (s) => { s.stats.people += 2; return { text: T('你在街市用家鄉話問價，原來檔主同你是同鄉。之後他總會留最靚的菜給你。', 'At the market you asked a price in your home dialect, and the stallholder turned out to be from the same county. Now he always keeps the best greens for you.') }; } },
    { id: 'community', daily: true, gap: 2, rep: 4, when: (s) => !s.chinese && !s.flags.inHome, p: () => 0.35, run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'community', [
      T('每個星期五，你和同鄉在社區中心見面，用母語傾偈，分享各家帶來的食物。', 'Every Friday you meet people from your community at the community centre, talk in your own language and share the food everyone brought.'),
      T('社區慶祝節日，你帶了自己煮的菜去，鄰居也帶了他們的拿手小菜來交換。', 'Your community marked a festival. You brought a dish you had cooked, and the neighbours brought theirs to swap.'),
      T('街坊的孩子請你教他們幾句你的母語。你寫在紙上，他們一個字一個字地讀。', 'The neighbours\' children asked you to teach them a few words of your language. You wrote them down, and they read them out one by one.'),
      T('你們社群的節日，你穿上傳統衣服，去朋友家吃飯，一直坐到深夜。', 'For your community\'s festival you wore traditional dress and went to a friend\'s home for dinner, staying until late.'),
    ]) }; } },
    { id: 'interpreter', daily: true, once: true, when: (s) => !s.chinese && s.age >= 68, p: () => 0.3, run: (s) => { s.stats.health += 1; return { text: T('覆診時，醫院安排了傳譯員。你可以把身體的情況一五一十講清楚。', 'At your hospital appointment an interpreter was arranged, and you could explain properly how you were feeling.') }; } },
    // Cared for at home.
    { id: 'helper_day', daily: true, gap: 2, rep: 3, when: (s) => s.flags.carer === 'helper' && !s.flags.inHome, p: () => 0.4, run: (s, rng) => { s.stats.spirits += 1; return { text: fresh(s, rng, 'helperDay', [
      T(`${s.helper}每朝推你落樓下公園，你們一齊看人打太極。`, `Every morning ${s.helper} wheels you down to the park, and you watch the tai chi together.`),
      T(`${s.helper}學會了煲你最鍾意的粟米湯，你說她煲得比你好。`, `${s.helper} learned to make your favourite sweetcorn soup, and you told her hers is better than yours.`),
      T(`${s.helper}教你講幾句她家鄉的話，你每朝都用來同她講早晨。`, `${s.helper} taught you a few words of her language, and you use them to say good morning to her every day.`),
    ]) }; } },
    { id: 'day_care', daily: true, gap: 2, rep: 3, when: (s) => s.flags.ltc && !s.flags.inHome && s.flags.carer !== 'helper', p: () => 0.35, run: (s, rng) => { s.stats.people += 1; return { text: fresh(s, rng, 'dayCare', [
      T('上門的護理員教你坐在椅上做伸展，你每朝都跟著做一次。', 'The home care worker showed you some stretches to do sitting down, and you do them every morning.'),
      T('你在日間護理中心和隔籬的婆婆分著食砵仔糕，兩個人講了一個下午。', 'At the day care centre you shared a bowl pudding with the woman beside you and talked all afternoon.'),
      T('社工上門探你，帶來一本大字的月曆，幫你寫低每次覆診的日子。', 'A social worker visited with a large-print calendar and helped you mark your appointments on it.'),
    ]) }; } },
    { id: 'dem_moment', daily: true, gap: 2, rep: 3, when: (s) => s.flags.dementia, p: () => 0.35, run: (s, rng) => { s.stats.spirits += 1; return { text: fresh(s, rng, 'demMoment', [
      T('有些名字你記不起了，但收音機一播起老歌，你仍然跟著唱到尾。', 'Some names escape you now, but when an old song comes on the radio you still sing along to the end.'),
      T('家人把舊相片印大貼在牆上。你指著其中一張，講起年輕時返工的日子。', 'Your family printed old photos large and put them on the wall. You pointed to one and talked about your working days.'),
      T('你聞到薑蔥的味道，笑著說：「媽媽以前都係咁煮。」', 'You smelled ginger and spring onion cooking and smiled: "That\'s how my mother used to make it."'),
    ]) }; } },
    // In a care home.
    { id: 'home_visit', daily: true, gap: 2, rep: 4, when: (s) => s.flags.inHome, p: () => 0.5, run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'homeVisit', [
      T(s.chinese ? '院舍的姑娘記得你喜歡聽粵曲，下午替你開了收音機。' : '院舍的姑娘記得你喜歡聽音樂，下午替你開了收音機。', s.chinese ? 'The care home staff remembered you like Cantonese opera, and put the radio on for you in the afternoon.' : 'The care home staff remembered you like music, and put the radio on for you in the afternoon.'),
      T('院舍搞中秋晚會，你坐在前排，手裡拿著一盞小燈籠。', 'The care home held a Mid-Autumn party. You sat in the front row holding a little lantern.'),
      T('隔籬床的院友每朝都同你講天氣。你們開始一齊看早晨新聞。', 'The resident in the next bed tells you the weather every morning. Now the two of you watch the morning news together.'),
      T('院舍的治療師帶大家做早操，你坐在椅上舉手踢腳。', 'The therapist led morning exercises, and you lifted your arms and legs from your chair.'),
      T('院舍為這個月生日的院友搞生日會，你吹熄了蛋糕上的蠟燭。', 'The care home held a party for everyone with a birthday this month, and you blew out the candles.'),
      T('一班中學生義工來院舍表演，有個女孩坐在你身邊彈琴。', 'A group of secondary-school volunteers came to perform, and a girl played the piano beside you.'),
    ]) }; } },
    { id: 'home_give', daily: true, once: true, when: (s) => s.flags.inHome && !s.flags.dementia, p: () => 0.4, run: (s) => { s.stats.spirits += 3; return { text: s.chinese
      ? T('你教院舍一位年輕護理員唱一段《帝女花》。她唱錯了詞，全層的人都笑了。', 'You taught a young care worker a few lines of Dai Nui Fa, the Cantonese opera. She got the words wrong, and the whole floor laughed.')
      : T('你教院舍一位年輕護理員煮一道你家鄉的菜。她記下了每一步，說要煮給家人吃。', 'You taught a young care worker a dish from your hometown. She wrote down every step and said she would cook it for her family.') }; } },
    { id: 'family_visit', daily: true, gap: 2, rep: 3, when: (s) => s.flags.inHome && near(s), p: () => 0.45, run: (s, rng) => { s.stats.people += 2; return { text: fresh(s, rng, 'famVisit', [
      T('星期日，家人來院舍陪你吃午飯，大家搶著替你夾餸。', 'On Sunday your family came to the care home for lunch and took turns putting food in your bowl.'),
      T(`${child(s).zh}帶了你最鍾意的叉燒包來，陪你在院舍花園坐了一個下午。`, `Your ${child(s).en} brought your favourite barbecue pork buns and sat with you in the care home garden all afternoon.`),
      T('家人推你去附近的公園行一圈。你說，好耐沒有曬過太陽。', 'Your family wheeled you round the park nearby. You said it had been a long time since you sat in the sun.'),
    ].concat(hasGk(s) && near(s) ? [T(`${gk(s).zh}來院舍探你，給你看手機裡的相片。`, `Your ${gk(s).en} came to the care home and showed you photos on the phone.`)] : [])) }; } },
  ];

  // During a hard stretch the years are quieter: one everyday moment at most, and after a broken
  // hip no outings, falls or physical moments until the stretch has eased.
  const inHard = (s) => hardOn(s) && s.age - s.flags.hardFrom <= 3;
  const HIP_BLOCK = ['hike', 'market', 'teahouse', 'park', 'outing', 'yum_cha', 'faith', 'tai_chi', 'hometown', 'help_out', 'work_day', 'fall', 'guangdong', 'swim'];
  for (const e of EVENTS) if (HIP_BLOCK.includes(e.id)) { const w = e.when; e.when = (s) => !(s.flags.hardKind === 'hip' && inHard(s)) && w(s); }

  // A fact is shown once per life per key; later occurrences keep the story line only.
  for (const ev of EVENTS) {
    const run = ev.run;
    ev.run = (s, rng) => {
      const entry = run(s, rng);
      if (!entry || !entry.fact) return entry;
      const key = entry.factKey || ev.id;
      if (s.seenFacts.includes(key)) { delete entry.fact; delete entry.src; } else s.seenFacts.push(key);
      return entry;
    };
  }

  const FOCUSES = [
    { id: 'health', label: T('照顧身體', 'Look after my health'), apply: (s) => { s.focus = 'health'; s.stats.health += 3; } },
    { id: 'people', label: T('多陪家人朋友', 'Time with family and friends'), apply: (s) => { s.focus = 'people'; s.stats.people += 4; s.stats.spirits += 1; } },
    { id: 'help', label: T('幫助別人', 'Help others'), ok: (s) => !s.flags.ltc, apply: (s) => { s.focus = 'help'; s.stats.spirits += 3; s.stats.people += 2; } },
    { id: 'learn', label: T('學點新東西', 'Learn something new'), ok: (s) => !s.flags.ltc, apply: (s) => { s.focus = 'learn'; s.stats.spirits += 2; s.stats.people += 1; } },
    { id: 'rest', label: T('好好享受生活', 'Enjoy the days'), apply: (s) => { s.focus = 'rest'; s.stats.spirits += 4; } },
  ];

  // Small yearly drift. ASSUMPTION: a gentle decline in health from 75; money drifts down for
  // renters and public tenants who are not working and not on an allowance.
  function yearly(s) {
    if (s.gkAge !== null) s.gkAge += 1;
    if (s.age >= 75) s.stats.health -= 1;
    if (!s.working && !s.flags.oala && !s.flags.cssa && !s.owner) s.stats.money -= 1;
  }

  const PAUSES = {
    70: T('70歲。想一想你自己的生活：有誰到了這個年紀，仍在你身邊？', 'Seventy. Think about your own life: who, at this age, is still beside you?'),
    75: T('75歲。你身邊有沒有這個年紀的人？想不想問候他們一聲？', 'Seventy-five. Is there someone around this age in your own life? Would you like to say hello?'),
    80: T('80歲。如果明天你需要人幫忙洗澡，那會是誰？', 'Eighty. If you needed help to bathe tomorrow, who would it be?'),
    85: T('85歲。在這個年紀，怎樣的一天才算是好日子？', 'Eighty-five. What does a good day look like at this age?'),
    90: T('90歲。同輩的人大多已經離開。你希望別人記得你什麼？', 'Ninety. Most of your generation has gone. What would you like people to remember about you?'),
  };

  // Annual mortality from the life table. ASSUMPTION: doubled with dementia and 1.5x with other
  // long-term care needs, then divided by the age's average multiplier, so that across all players
  // deaths still follow the life table.
  // careShare is the share of the living with any care need (dementia included), as the game
  // itself produces it; it is used only for this normalisation.
  const careShare = (a) => Math.min(0.8, 0.03 * Math.pow(1.155, a - 65));
  function mortality(s) {
    const a = s.age;
    const pD = demPrev(a), pL = Math.max(careShare(a), pD);
    const avg = (1 - pL) + (pL - pD) * 1.5 + pD * 2;
    const m = s.flags.dementia ? 2 : s.flags.ltc ? 1.5 : 1;
    return Math.min(0.95, (qx(s.sex, a) * m) / avg);
  }

  // The death line never names a cause. Most deaths in Hong Kong happen in hospital; the lines
  // vary so that not every ending is the same peaceful scene.
  function deathLine(s, rng) {
    const n = s.name, p = pron(s), a = s.age;
    const c = near(s) ? child(s) : null;
    if (s.flags.waitlist !== undefined && !s.flags.inHome) return T(`${n.zh}在醫院離世，享年${a}歲，當時仍在輪候院舍宿位。那天早上，家居照顧的職員還上門探過${p.zh}。`, `${n.en} died in hospital at ${a}, still on the waiting list for a care home place. That morning the home care worker had called in as usual.`);
    if (s.flags.inHome) return rng.pick([
      T(`${n.zh}在院舍離世，享年${a}歲。那天早上，姑娘照常替${p.zh}開了收音機。`, `${n.en} died in the care home at ${a}. That morning a carer had put the radio on as usual.`),
      T(`${n.zh}在院舍離世，享年${a}歲。護理員握著${p.zh}的手，家人隨後趕到。`, `${n.en} died in the care home at ${a}. A care worker held ${p.en} hand, and family arrived soon after.`),
    ]);
    if (rng() < 0.2 && (s.kidsAtHome || s.spouse)) return T(`${n.zh}在家中睡夢裡離世，享年${a}歲。`, `${n.en} died at home in ${p.en} sleep, at ${a}.`);
    if (c) return rng.pick([
      T(`${n.zh}在醫院離世，享年${a}歲。${c.zh}整晚陪在床邊。`, `${n.en} died in hospital at ${a}. ${p.en === 'his' ? 'His' : 'Her'} ${c.en} stayed by the bed through the night.`),
      T(`${n.zh}在醫院離世，享年${a}歲。那晚家人剛剛回家休息，姑娘陪著${p.zh}。`, `${n.en} died in hospital at ${a}. The family had just gone home to rest; a nurse was with ${p.en === 'his' ? 'him' : 'her'}.`),
      T(`${n.zh}在醫院離世，享年${a}歲。最後幾日，家人輪流在床邊陪著${p.zh}。`, `${n.en} died in hospital at ${a}. In the last few days the family took turns at the bedside.`),
      T(`${n.zh}在醫院離世，享年${a}歲，${c.zh}握著${p.zh}的手。`, `${n.en} died in hospital at ${a}, with ${p.en} ${c.en} holding ${p.en} hand.`),
    ]);
    if (s.arrangement === 'other') return T(`${n.zh}在醫院離世，享年${a}歲。同住的親人和幾位老朋友都來送別。`, `${n.en} died in hospital at ${a}. The relatives ${s.sex === 'M' ? 'he' : 'she'} lived with and a few old friends came to say goodbye.`);
    return T(`${n.zh}在醫院離世，享年${a}歲。幾位老朋友和鄰居都來送別。`, `${n.en} died in hospital at ${a}. A few old friends and neighbours came to say goodbye.`);
  }

  // What shaped this life that the person never chose, or chose only in part. Shown at the end,
  // never as a score.
  function notChosen(s) {
    const out = [
      s.sex === 'M' ? T('你是男性。', 'You were a man.') : T('你是女性。', 'You were a woman.'),
      T(`65歲那天，你${ARR_LABEL[s.start].zh}，住在${houseLabel(s).zh}。`, `On your 65th birthday you were ${ARR_LABEL[s.start].en}, at home in ${houseLabel(s).en}.`),
    ];
    if (s.flags.dementia) out.push(T('你患上了認知障礙症。這不是任何人可以選擇的。', 'You developed dementia. Nobody chooses that.'));
    if (s.flags.widowed) out.push(T('你的另一半比你先走。', 'Your partner passed away before you.'));
    if (s.flags.ltc && !s.flags.dementia) out.push(T('你的身體需要別人照顧。', 'Your body came to need someone else\'s care.'));
    return out;
  }

  function epilogue(s) {
    return [
      s.sex === 'M'
        ? T('按2023年的生命表，65歲的男性平均可活到約86歲；實際上，有人早很多，有人遲很多。', 'On the 2023 life table, a man turning 65 in Hong Kong can expect to live to about 86; in real life some people die a good deal earlier and some live a good deal longer.')
        : T('按2023年的生命表，65歲的女性平均可活到約90歲；實際上，有人早很多，有人遲很多。', 'On the 2023 life table, a woman turning 65 in Hong Kong can expect to live to about 90; in real life some people die a good deal earlier and some live a good deal longer.'),
    ];
  }

  // ------------------------------------------------------------------ charts
  // Shares for the intro chart, computed from the same census counts the opening draw uses.
  const ARR_SHORT = { alone: T('獨居', 'Living alone'), spouse: T('只與配偶同住', 'With spouse only'), spouse_kids: T('與配偶和子女同住', 'With spouse and children'), kids: T('與子女同住', 'With children'), other: T('與其他親人同住', 'With other relatives') };
  const HOUSE_SHORT = { prh: T('公屋', 'Public rental'), hos: T('資助出售單位', 'Subsidised sale'), private: T('私人樓宇', 'Private'), other: T('其他', 'Other') };
  // "Today in Hong Kong" on the opening screen: official yearly totals spread evenly over the year
  // (C&SD tables 110-01001, 110-01002 and 115-01011). People aged 65 at mid-2026 stand in for those who turn 65 in a year;
  // 24.4% is 1,834,100 aged 65 and over out of 7,518,300 (mid-2026, provisional, summed from Table
  // 110-01001). Refresh each August (mid-year estimates) and February (births).
  const TODAY = {
    turning65: { perYear: 119400, src: 'pop_age' },
    births: { perYear: 31100, src: 'vital' },
    shareOver65: 0.244,
  };

  const households = (() => {
    const rows = [...WITH_SPOUSE, ...NO_SPOUSE];
    const total = rows.reduce((a, r) => a + r.n, 0);
    return {
      total, src: 'census_older',
      arrangement: ['spouse_kids', 'spouse', 'kids', 'alone', 'other'].map((id) => ({ id, label: ARR_SHORT[id], share: rows.find((r) => r.id === id).n / total })),
      housing: HOUSING.map((h, i) => ({ id: h, label: HOUSE_SHORT[h], share: rows.reduce((a, r) => a + r.housing[i], 0) / total })),
    };
  })();

  // Of 100 people turning 65, how many are alive at each age (2023 life table).
  function survival(sex) {
    const out = [{ age: 65, alive: 100 }];
    let l = 100;
    for (let a = 65; a < 105; a++) { l *= 1 - qx(sex, a); out.push({ age: a + 1, alive: l }); }
    return out;
  }

  // Calibration: published figures the simulated population must reproduce, with tolerances fixed
  // before any tuning. tools/simulate.js turns these into PASS/FAIL; the method page
  // shows them as a table, simulated in the reader's own browser.
  const CAL_BANDS = ['65-74', '75-84', '85+'];
  const CAL = {
    death: { M: 85.57, F: 89.73, tol: 0.5, src: 'lifetable' }, // 65 + life expectancy at 65, 2023 life table
    widowed: { F: [0.203, 0.463, 0.732], M: [0.039, 0.112, 0.279], tol: 0.06, src: 'census_older' },
    ltc85: { lo: 0.5, hi: 0.7, src: 'census_snapshot' },
    dementia: { bands: { '65-69': 0.025, '70-74': 0.035, '75-79': 0.099, '80-84': 0.19, '85+': 0.321 }, tol: 0.02, src: 'dementia_0506' },
    cataract: { v: [0.183, 0.369, 0.478], tol: 0.06, src: 'phs' },
    // Doctor-diagnosed, ages 65-74 and 75-84, Population Health Survey 2020-22.
    conditions: [
      ['chronic', T('高血壓', 'High blood pressure'), [0.452, 0.597], 0.06],
      ['dm', T('糖尿病', 'Diabetes'), [0.171, 0.235], 0.04],
      ['chd', T('冠心病', 'Coronary heart disease'), [0.039, 0.057], 0.02],
      ['stroke', T('中風', 'Stroke'), [0.013, 0.048], 0.02],
      ['cancer', T('癌症', 'Cancer'), [0.053, 0.08], 0.025],
    ],
    admit: { v: 0.161, tol: 0.025, src: 'ths84' }, // admitted to hospital in a year, 65+ at home, 2025
  };
  const bandZh = (k) => k.replace('85+', '85歲或以上').replace(/^(\d+)-(\d+)$/, '$1至$2歲');
  // lives: [{ sex, ageAtDeath, years: [{ age, sex, widowed, flags }] }]
  function calibrate(lives) {
    const band = (a) => (a < 75 ? 0 : a < 85 ? 1 : 2);
    const death = { M: [], F: [] }, wid = { M: [[0, 0], [0, 0], [0, 0]], F: [[0, 0], [0, 0], [0, 0]] }, cat = [[0, 0], [0, 0], [0, 0]], dem = {};
    let py85 = 0, ltc85 = 0, home = 0, admitted = 0;
    const cond = CAL.conditions.map(() => [[0, 0], [0, 0]]);
    for (const life of lives) {
      death[life.sex].push(life.ageAtDeath);
      for (const y of life.years) {
        const b = band(y.age);
        wid[y.sex][b][0]++; if (y.widowed) wid[y.sex][b][1]++;
        cat[b][0]++; if (y.flags.cataract) cat[b][1]++;
        const db = y.age < 70 ? '65-69' : y.age < 75 ? '70-74' : y.age < 80 ? '75-79' : y.age < 85 ? '80-84' : '85+';
        dem[db] = dem[db] || [0, 0]; dem[db][0]++; if (y.flags.dementia) dem[db][1]++;
        if (y.age >= 85) { py85++; if (y.flags.ltc) ltc85++; }
        if (b < 2) CAL.conditions.forEach(([k], i) => { cond[i][b][0]++; if (y.flags[k]) cond[i][b][1]++; });
        if (!y.flags.inHome) { home++; if (y.flags.admits.includes(y.age)) admitted++; }
      }
    }
    const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
    const rate = ([d, k]) => (d ? k / d : 0);
    const rows = [];
    const row = (label, official, sim, lo, hi, fmt, src) => rows.push({ label, official, sim, lo, hi, fmt, src, ok: sim >= lo && sim <= hi });
    row(T('平均離世年齡：男性', 'Average age at death: men'), CAL.death.M, mean(death.M), CAL.death.M - CAL.death.tol, CAL.death.M + CAL.death.tol, 'yrs', CAL.death.src);
    row(T('平均離世年齡：女性', 'Average age at death: women'), CAL.death.F, mean(death.F), CAL.death.F - CAL.death.tol, CAL.death.F + CAL.death.tol, 'yrs', CAL.death.src);
    for (const sex of ['F', 'M']) for (let b = 0; b < 3; b++) {
      const v = CAL.widowed[sex][b];
      row(T(`喪偶：${sex === 'F' ? '女性' : '男性'}${bandZh(CAL_BANDS[b])}`, `Widowed: ${sex === 'F' ? 'women' : 'men'} ${CAL_BANDS[b]}`), v, rate(wid[sex][b]), v - CAL.widowed.tol, v + CAL.widowed.tol, 'pct', CAL.widowed.src);
    }
    row(T('需要長期照顧：85歲或以上', 'Need long-term care: 85+'), T('超過一半', 'more than half'), rate([py85, ltc85]), CAL.ltc85.lo, CAL.ltc85.hi, 'pct', CAL.ltc85.src);
    for (const [k, v] of Object.entries(CAL.dementia.bands)) row(T(`認知障礙症：${bandZh(k)}`, `Dementia: ${k}`), v, rate(dem[k] || [0, 0]), v - CAL.dementia.tol, v + CAL.dementia.tol, 'pct', CAL.dementia.src);
    CAL.cataract.v.forEach((v, b) => row(T(`曾確診白內障：${bandZh(CAL_BANDS[b])}`, `Cataract ever diagnosed: ${CAL_BANDS[b]}`), v, rate(cat[b]), v - CAL.cataract.tol, v + CAL.cataract.tol, 'pct', CAL.cataract.src));
    CAL.conditions.forEach(([, label, v, tol], i) => v.forEach((x, b) => row(T(`${label.zh}：${bandZh(CAL_BANDS[b])}`, `${label.en}: ${CAL_BANDS[b]}`), x, rate(cond[i][b]), x - tol, x + tol, 'pct', 'phs')));
    row(T('一年內曾入住醫院：65歲或以上（住在家中）', 'Admitted to hospital in a year: 65+ living at home'), CAL.admit.v, rate([home, admitted]), CAL.admit.v - CAL.admit.tol, CAL.admit.v + CAL.admit.tol, 'pct', CAL.admit.src);
    return rows;
  }

  // ------------------------------------------------------------------ scenes
  // Which pixel picture each moment gets (drawn by scenes.js): every kind of home drawn with the same care, quiet rooms for heavy moments, no illness shown.
  const SKIN_OF = { 'Rajesh Gurung': 3, 'Muhammad Akbar': 3, 'Ramon Santos': 2, 'Harjit Singh': 3, 'David Harris': 0, 'Sita Rai': 2, 'Amina Bibi': 3, 'Maria Reyes': 2, 'Priya Mehta': 3, 'Susan Clarke': 0 };
  const PLACE = {
    home: T('家中', 'at home'), kitchen: T('廚房', 'in the kitchen'), teahouse: T('茶樓', 'at the tea house'), clinic: T('診所', 'at the clinic'),
    ward: T('醫院病房', 'in a hospital ward'), carehome: T('院舍', 'at the care home'), centre: T('長者中心', 'at the elderly centre'),
    classroom: T('長者學苑', 'at the Elder Academy'), hall: T('社區聚會', 'at a community gathering'), quiet: T('家中', 'at home'),
    park: T('公園', 'in the park'), market: T('街市', 'at the market'), street: T('街上', 'out and about'), school: T('學校門口', 'at the school gate'),
    harbour: T('海旁', 'by the waterfront'), village: T('家鄉', 'in your home village'), estate: T('樓下', 'outside your building'),
  };
  const HOME_NAME = { prh: T('公屋', 'public rental estate'), hos: T('資助出售屋苑', 'subsidised-sale estate'), private: T('私人屋苑', 'private housing'), other: T('其他房屋', 'other housing') };
  // [place, who comes along, weather, extra]
  const SCENE = {
    start: ['estate', 'household'], mpf: ['home', 'household'], card: ['street', ''], voucher: ['clinic', 'staff'],
    work: ['teahouse', 'friends'], retire_later: ['teahouse', 'friends'], job: ['teahouse', 'friends'],
    oala: ['centre', 'staff'], oaa: ['home', 'household'], rent: ['home', '', 'night'],
    chronic: ['clinic', 'nurse'], diabetes: ['clinic', 'nurse'], heart: ['ward', 'nurse'], stroke: ['ward', 'nurse'], cancer: ['ward', 'nurse'], cataract: ['clinic', 'staff'], cataract_op: ['home', 'household', 'day', 'calendar'],
    joints: ['park', 'friends'], fall: ['home', 'household'], adapt: ['home', '', 'day', 'rails'], hospital: ['ward', 'nurse'],
    low_mood: ['quiet', '', 'night'], widowed: ['quiet', '', 'night', 'twocups'], after_loss: ['centre', 'friends'],
    partner_care: ['home', 'spouse'], lonely: ['quiet', '', 'day'], volunteer: ['centre', 'friends'], academy: ['classroom', 'student'],
    guangdong: ['estate', 'friend'], dementia: ['home', 'household'], dementia_support: ['centre', 'staff'],
    ltc: ['home', 'carer'], carer_strain: ['kitchen', '', 'night'], home_apply: ['home', 'household'],
    care_home: ['carehome', 'nurse'], home_visit: ['carehome', 'nurse'], home_give: ['carehome', 'nurse'], family_visit: ['carehome', 'family'],
    grandkid: ['school', 'grandkid'], yum_cha: ['teahouse', 'family'], tai_chi: ['park', 'taichi'], typhoon: ['home', 'household', 'rain'],
    new_year: ['home', 'family', 'day', 'festive'], phone: ['home', 'grandkid', 'day', 'phone'],
    friend: ['park', '', 'dusk'], cook: ['kitchen', 'child'], neighbour: ['estate', 'grandkid'], walk: ['harbour', 'spouse', 'dusk'],
    quarrel: ['home', 'child'], lift: ['estate', ''], summer: ['centre', 'friends', 'hot'], hometown: ['village', 'friend'],
    dialect: ['market', ''], community: ['hall', 'friends'], interpreter: ['clinic', 'staff'],
    gk_baby: ['home', 'grandkid'], gk_teen: ['home', 'grandkid'], gk_adult: ['teahouse', ''], first_gk: ['ward', 'child'],
    child_near: ['home', 'child', 'day', 'phone'], child_away: ['home', '', 'day', 'phone'], outing: ['harbour', 'child'], remember: ['quiet', '', 'day', 'twocups'],
    market: ['market', ''], teahouse: ['teahouse', 'friends'], park: ['park', 'friends'], hike: ['park', 'friends'],
    learn: ['classroom', 'student'], help_out: ['estate', 'friend'], kind: ['street', ''], home_days: ['home', ''],
    alone_days: ['estate', 'friend'], centre: ['centre', 'friends'], faith: ['street', 'friends'], mid_autumn: ['park', 'family', 'dusk'],
    dumplings: ['kitchen', ''], solstice: ['home', 'family', 'night'], cold: ['home', '', 'rain'], phone_scam: ['home', '', 'day', 'phone'], scam_loss: ['home', '', 'night', 'phone'], hard_days: ['home', '', 'night'], hard_eases: ['home', '', 'day'], wait_long: ['home', 'carer', 'day'], stroke_after: ['home', '', 'day'], cancer_after: ['home', '', 'day'],
    work_day: ['teahouse', 'friends'], helper_day: ['park', 'carer'], day_care: ['centre', 'carer'], dem_moment: ['home', 'household'],
  };
  // Skin tones live in scenes.js; the scenario only picks an index.
  const sceneSkin = (i) => (window.Scenes ? window.Scenes.SKIN[i] : undefined);

  function scene(s, record) {
    const last = record[record.length - 1];
    // The year just lived is the one before the current age (the engine moves age on at year end).
    const now = [...record].reverse().find((e) => !e.follow && e.kind !== 'death') || record[0];
    const quiet = now.kind !== 'start' && now.age < s.age - 1;
    const id = last && last.kind === 'death' ? 'death' : now.kind === 'start' ? (s.age <= 66 ? 'start' : 'idle') : quiet ? 'idle' : now.id;
    // A quiet year shows what the person chose to focus on.
    const IDLE = { health: ['park', 'friends'], people: ['teahouse', 'family'], help: ['centre', 'friends'], learn: ['classroom', 'student'], rest: ['harbour', 'household', 'dusk'] };
    const idle = s.flags.ltc ? ['home', 'carer'] : IDLE[s.focus] || ['home', 'household'];
    let [place, who, weather, extra] = id === 'idle' ? idle : SCENE[id] || ['home', 'household'];
    if (s.flags.inHome && ['home', 'kitchen', 'quiet', 'estate'].includes(place)) place = 'carehome';
    if (id === 'death') { place = 'quiet'; who = ''; weather = 'dusk'; }
    const tone = s.chinese ? (s.name.en.length % 2) : (SKIN_OF[s.name.en] ?? 2);
    const elder = (sx, key, role = 'elder') => ({ id: key, role, sex: sx, skin: sceneSkin(s.chinese ? key.length % 2 : tone) });
    const me = { ...elder(s.sex, `me-${s.name.en}`), skin: sceneSkin(tone), hold: extra === 'phone' ? 'phone' : s.flags.joints && s.age >= 80 ? 'cane' : undefined };
    const spouseFig = () => elder(s.sex === 'M' ? 'F' : 'M', `sp-${s.name.en}`, 'spouse');
    const kid = () => ({ id: `ch-${s.name.en}`, role: 'adult', sex: s.childSex, skin: me.skin });
    const grand = () => ({ id: `gk-${s.name.en}`, role: 'child', skin: me.skin });
    const friendFig = (k) => elder(k % 2 ? 'F' : 'M', `fr${k}-${s.name.en}`);
    const helperFig = () => ({ id: `hp-${s.helper}`, role: 'helper', sex: 'F', skin: sceneSkin(2) });
    let people = [me];
    if (who === 'household' || who === 'family') {
      if (s.spouse) people.push(spouseFig());
      if (near(s) && (s.kidsAtHome || who === 'family')) people.push(kid());
      if (who === 'family' && near(s) && hasGk(s) && s.gkAge <= 12) people.push(grand());
      if (s.flags.carer === 'helper') people.push(helperFig());
    }
    if (who === 'spouse' && s.spouse) people.push(spouseFig());
    if (who === 'child' && near(s)) people.push(kid());
    if (who === 'grandkid' && hasGk(s) && near(s)) people.push(grand());
    if (who === 'friend') people.push(friendFig(1));
    if (who === 'friends' || who === 'taichi') people.push(friendFig(1), friendFig(2));
    if (who === 'taichi') people.forEach((p) => { p.move = 'taichi'; });
    if (who === 'staff') people.push({ id: `st-${id}`, role: 'adult', sex: id.length % 2 ? 'F' : 'M', staff: true });
    if (who === 'student') people.push({ id: `stu-${s.name.en}`, role: 'child', student: true });
    if (who === 'nurse') people.push({ id: `nu-${id}`, role: 'carer', sex: 'F' });
    if (who === 'carer') {
      if (s.flags.carer === 'helper') people.push(helperFig());
      else if (s.flags.carer === 'child' && family(s)) people.push(kid());
      else if (s.flags.carer === 'spouse' && s.spouse) people.push(spouseFig());
      else people.push({ id: 'homecare', role: 'carer', sex: 'F' });
    }
    if (id === 'death') people = [];
    if (id === 'widowed' || id === 'low_mood' || id === 'lonely') people = [me];
    const label = (p) => (p.staff || p.role === 'carer' ? T('職員', 'staff') : p.student ? T('學生義工', 'a student volunteer')
      : p.role === 'spouse' ? T('另一半', 'your partner') : p.role === 'adult' ? T(child(s).zh, `your ${child(s).en}`) : p.role === 'child' ? T('孫兒', 'a grandchild')
      : p.role === 'helper' ? T(s.helper, s.helper) : T('朋友', 'friends'));
    const seen = new Set();
    const withWho = people.slice(1).map(label).filter((x) => !seen.has(x.en) && seen.add(x.en));
    const placeName = id === 'start' ? HOME_NAME[s.housing] : place === 'estate' ? PLACE.estate : PLACE[place];
    const caption = id === 'death' ? T('', '') : T(
      [placeName.zh, withWho.length ? `與${withWho.map((x) => x.zh).join('、')}` : ''].filter(Boolean).join(' · '),
      [placeName.en, withWho.length ? `with ${withWho.map((x) => x.en).join(' and ')}` : ''].filter(Boolean).join(' · '));
    return {
      key: `${id}-${s.age}-${people.length}`, place, weather: weather || 'day', housing: s.housing, mark: extra, festive: extra === 'festive',
      people, caption,
      alt: T(`像素插圖：${caption.zh || '一個安靜的房間，窗外有光'}`, `Pixel picture: ${caption.en || 'a quiet room, with light from the window'}`),
    };
  }

  // Short lines for the companions panel and the share card.
  // Neutral (no "you"): used for the player's share card and for the companions alike.
  const ARR_NEUTRAL = { spouse_kids: 'living with spouse and children', spouse: 'living with spouse', alone: 'living alone', kids: 'living with children', other: 'living with other relatives' };
  const HOUSE_NEUTRAL = { prh: 'a public rental flat', hos: 'an owner-occupied subsidised-sale flat', privateOwn: 'an owner-occupied private flat', privateRent: 'a rented private flat', other: 'temporary or other housing' };
  const houseKey = (s) => (s.housing === 'private' ? (s.owner ? 'privateOwn' : 'privateRent') : s.housing);
  const summary = (s) => T(`${ARR_LABEL[s.start].zh}，住在${houseLabel(s).zh}`, `${ARR_NEUTRAL[s.start]}, in ${HOUSE_NEUTRAL[houseKey(s)]}`);
  function status(s) {
    const f = s.flags;
    if (f.inHome) return T('住在院舍', 'in a care home');
    if (f.waitlist !== undefined) return T('在家等候院舍宿位', 'at home, waiting for a care home place');
    if (f.ltc) return T('在家接受照顧', 'cared for at home');
    if (f.gd) return T('住在廣東', 'living in Guangdong');
    if (f.widowed) return T('喪偶', 'widowed');
    if (s.working) return T('仍在工作', 'still working');
    return s.arrangement === 'alone' ? T('獨居', 'living alone') : T('在家', 'at home');
  }

  // How the opening draw works, in plain numbers (census Tables 7.9 and housing shares, rounded).
  const drawNote = T(
    '在香港每100位65歲或以上、住在家中的長者之中，約14位獨居，29位只與配偶同住，33位與配偶和子女同住，19位只與子女同住，5位與其他人同住。約36位住在公屋，21位住在資助出售單位，43位住在私人樓宇。你的人生，就是按這些比例設定的。',
    'Of every 100 people aged 65 and over living in Hong Kong households, about 14 live alone, 29 with a spouse only, 33 with a spouse and children, 19 with children only and 5 with other people. About 36 live in public rental housing, 21 in subsidised flats they bought and 43 in private housing. Your life was set up in these same proportions.',
  );

  // The method page. README.md has the calibration table.
  const METHOD = {
    data: T(
      '每個人生按2021年人口普查的真實比例設定：性別、婚姻狀況、與誰同住、房屋類型、是否仍在工作、出生地和族裔。每年的死亡機會來自2023年香港生命表。白內障、關節炎、認知障礙症、跌倒、喪偶和需要長期照顧的機會，都按政府統計處、衞生署、社會福利署等機構公布的比率，以及立法會答覆中的數字設定，並經過校準：模擬出來的平均壽命、喪偶比例和患病比例，都與公開數字相符。淺色方格中的每一個數字，都可以在下面的出處找到。',
      'Each life is set up in the proportions of the 2021 census: sex, marital status, who you live with, the type of home, whether you still work, where you were born, and ethnic group. The chance of dying each year comes from the 2023 Hong Kong life table. The chances of cataract, arthritis, dementia, a fall, losing a partner and needing long-term care follow rates published by the Census and Statistics Department, the Department of Health, the Social Welfare Department and others, and figures given in replies to the Legislative Council. The game is calibrated so that its average lifespan, widowhood and illness shares match the published figures. Every number in a shaded box can be found in the sources below.',
    ),
    frame: T(
      '本作品假設今天的比率、津貼和服務，在你餘下的人生中維持不變。這不是預測：醫學會進步，政策也會更新。遊戲顯示的，是按今天的情況，一個65歲的人可能經歷的人生。',
      'This piece assumes today\'s rates, allowances and services stay as they are for the rest of your life. This is not a forecast: medicine improves and policies change. The game shows the life a person turning 65 might live on today\'s figures.',
    ),
    assumptions: [
      T('喪偶的機會由配偶的年齡和生命表推算；本作品假設丈夫比妻子大4歲，令模擬的喪偶比例與人口普查相符。', 'The chance of losing a partner comes from the partner\'s age and the life table; this piece assumes husbands are 4 years older than their wives, which makes the simulated widowhood shares match the census.'),
      T('白內障、關節炎和認知障礙症每年出現的機會，由各年齡組別的患病率推算，組別之間以直線連接。認知障礙症的比率來自約2005年的本地研究；在製作本作品時，較新的全港調查未有完整報告。', 'The yearly chances of cataract, arthritis and dementia are derived from prevalence by age band, joined by straight lines between bands. Dementia rates come from a Hong Kong study from about 2005; when this piece was prepared, a newer territory-wide survey had no full report.'),
      T('需要長期照顧的機會，是一條貼合人口普查數字的曲線（60歲或以上在家居住者16.6%；85歲或以上超過一半）。', 'The chance of needing long-term care follows a curve fitted to census figures (16.6% of people aged 60 and over at home; more than half of those aged 85 and over).'),
      T('患認知障礙症或需要長期照顧的人，每年的死亡機會較高；整體死亡率仍與生命表一致。', 'People with dementia or long-term care needs have a higher yearly chance of dying, adjusted so that overall deaths still follow the life table.'),
      T('有沒有子女和孫兒，是本作品按政府統計處公布的生育和婚姻數字推算的設定：與子女同住的人都有子女；其他曾經結婚的人，約88%有子女；有子女的人，約42%在65歲時已有孫兒，其餘的可能在之後才做爺爺嫲嫲或公公婆婆。有些人生裡，子女因為工作、讀書或婚姻，在內地或外地生活。', 'Whether a life has children and grandchildren is this piece\'s own setting, estimated from published C&SD fertility and marriage figures: everyone living with children has a child; about 88% of the other ever-married have one; about 42% of those with a child already have a grandchild at 65, and others may become grandparents later. In some lives a child lives elsewhere, on the Mainland or overseas, for work, study or marriage.'),
      T('高血壓、糖尿病、冠心病、中風和癌症，按2020-22年人口健康調查各年齡組別的比率出現，組別之間以直線連接。本作品沒有讓這些病改變死亡的機會：生命表本身已經平均計算了它們。所有原因加起來的住院比率，調校至2025年住在家中的65歲或以上人士的16.1%。', 'High blood pressure, diabetes, coronary heart disease, stroke and cancer begin at rates that follow the Population Health Survey 2020-22 by age, linear between age bands. This piece does not let them change the chance of dying: the life table already includes them on average. Hospital stays from every cause together are tuned to the 16.1% of people aged 65 and over living at home who were admitted in 2025.'),
      T('大約每五段人生，就有一段會遇上一段較難熬的日子：跌斷髖骨、積蓄被騙、長時間的孤單、照顧者身心疲累，或輪候院舍較久。幫助仍然會來，但只能令日子好過一點，不一定能解決問題。這個比例是本作品的設定，不是統計數字；它讓人生不會一律順利。', 'In about one life in five, a hard stretch stays hard for a while: a broken hip, savings lost to a scam, a long lonely spell, a carer worn down, or a longer wait for a care home. Help still comes, but it eases things rather than settling them. The share is a setting of this piece, not a statistic; it keeps the lives from all being smooth.'),
      T('「健康、經濟、人際、心情」四項指標是遊戲的設計，不是統計數字。', 'The four bars for health, money, people and spirits are part of the game, not statistics.'),
      T('住院、輪候完結、感到孤單、情緒低落等事件的頻率，部分是本作品按公開數字作出的估計。', 'How often some events happen, such as a hospital stay, a wait ending, a lonely spell or a period of low mood, is this piece’s estimate based on the published figures.'),
    ],
    leftOut: T(
      '自殺是部分長者晚年真實而沉重的一部分。本作品沒有把它寫進任何一段人生：在一個按比例設定人生、又讓玩家作選擇的遊戲裡，把它寫成一個事件，會令人覺得它是遊戲安排的，或是某個選擇造成的。遊戲裡有情緒低落的時刻，也有可以求助的人。如果你或身邊的人需要支援，請致電精神健康支援熱線 18111（24小時）。',
      'Suicide is a real and heavy part of later life for some people. This piece does not write it into any life: in a game that sets up lives in proportion and asks players to choose, writing it as an event would make it look like something the game arranged, or something a choice led to. The game does include periods of low mood, and the people who can help. If you or someone close to you needs support, call the 18111 mental health support hotline (24 hours).',
    ),
    // Credits, worded from the publishers' own reuse notices (read 2026-10-22).
    credits: [
      {
        title: T('數字的來源與使用方式', 'Where the numbers come from, and how they are used'),
        text: T(
          '本作品引用的數字，來自香港政府及相關機構公布的資料，包括政府統計處、衞生署（含衞生防護中心及長者健康服務）、社會福利署、勞工處、立法會、強制性公積金計劃管理局、安老事務委員會，以及香港特別行政區政府新聞公報。版權屬香港特別行政區政府所有；立法會文件的版權屬立法會所有。本作品只用自己的文字複述數字，並附上出處連結，沒有轉載原文、圖表或標誌。資料來源：政府統計處網站（www.censtatd.gov.hk）及下面列出的各個網站。',
          'The figures in this piece come from material published by the Hong Kong Government and related bodies: the Census and Statistics Department, the Department of Health (including the Centre for Health Protection and the Elderly Health Service), the Social Welfare Department, the Labour Department, the Legislative Council, the Mandatory Provident Fund Schemes Authority, the Elderly Commission, and Government press releases. Copyright belongs to the Government of the Hong Kong Special Administrative Region; Legislative Council papers are copyright of the Legislative Council. The piece restates figures in its own words and links to the originals; it does not reproduce the publications, charts or logos. Source: the Census and Statistics Department website (www.censtatd.gov.hk) and the other sites listed below.',
        ),
      },
      {
        title: T('經本作品處理的數字', 'Figures this piece has worked on'),
        text: T(
          '部分數字經本作品內插、推算或校準，例如把各年齡組別的比率連成每年的機會。這些不是官方公布的統計數字，已在上面「本作品的估計」中列明。',
          'Some figures are interpolated, estimated or calibrated by this piece, for example by turning rates for age bands into a chance for each year. They are not published statistics, and they are listed above under "What this piece estimates".',
        ),
      },
      {
        title: T('聲明', 'Disclaimer'),
        text: T(
          '本作品為獨立的個人項目，與任何機構無關，亦並非由香港特別行政區政府、立法會或上述任何機構製作、認可或贊助。數字可能已過時或經過簡化，如有需要，請查閱原來的出版物。',
          'This is an independent personal project, not affiliated with any organisation. It was not produced, endorsed or sponsored by the Hong Kong Government, the Legislative Council or any body named above. Figures may be out of date or simplified; check the original publication where it matters.',
        ),
      },
      {
        title: T('靈感', 'Inspiration'),
        link: { href: 'https://1in8b.life', label: '1in8b.life' },
        text: T(
          '這件作品的構思和形式都來自 1 in 8 Billion（1in8b.life）。在那裡，你按真實的出生機率，成為此刻在世界某處出生的一個嬰兒，再一年一年活下去。這裡借用了它的做法：按真實機率分派一個人生、逐年經歷、每個時刻附上有出處的數字、同日出生的同伴、中途停下來想一想，以及最後的一張人生卡。本作品與該網站及其營運者並無關係，亦沒有使用其程式碼、文字或圖像。',
          'The idea and the shape of this piece come from 1 in 8 Billion (1in8b.life), where you become one of the babies being born somewhere in the world right now, at real birth odds, and live that life year by year. This piece borrows its way of working: one life dealt at real odds, lived a year at a time, a sourced figure under each moment, companions born the same day, pauses to reflect, and a card at the end. It is unaffiliated with that site and its operator, and shares none of its code, text or artwork.',
        ),
      },
      {
        title: T('製作工具', 'How it was made'),
        text: T(
          '本作品運用人工智能工具，把政府統計和已發表的研究整理成一段段人生；內容由作者決定，每個數字都逐一與來源核對。圖像全部以程式繪製，沒有使用其他來源的圖片。只使用你裝置上已有的字體，不載入第三方程式。不設廣告，不收集個人資料；你寫下的字只會留在你的裝置上，語言和顯示設定只儲存在這個瀏覽器。',
          'It was built with the help of AI tools, turning government statistics and published research into lives you can step through. The author decided what goes in and checked every figure against its source. All pictures are drawn in code; no images come from elsewhere. The page uses only fonts already on your device and loads no third-party scripts. No ads, and no personal data is collected; anything you write stays on your device, and your language and display settings are saved in this browser only.',
        ),
      },
    ],
  };

  return {
    id: 'turn65',
    dailyCap: (s) => (inHard(s) ? 1 : 2),
    method: METHOD, drawNote, summary, status, scene, households, survival, calibrate, today: TODAY,
    title: T('65歲，在香港', 'Turning 65 in Hong Kong'),
    version: '0.12.0', // bump when events or figures change: a ?seed= link replays only within one version
    tagline: T('今天是你65歲生日。之後的日子，會是怎樣？', 'Today is your 65th birthday. What will the years ahead hold?'),
    intro: T(
      '你和誰同住、住在哪類房屋，都按2021年人口普查中香港長者的真實比例設定。之後每一年發生的事，都依照公開統計的機會出現。淺色方格裡的數字都有出處；至於怎樣把這些數字串成一段人生，是本作品自己設計的模型。',
      'Who you live with and the kind of home you live in are set in the same proportions as older people in the 2021 census. What happens each year follows published odds. Every number in a shaded box has a source; how those numbers are strung into a life is this piece’s own model.',
    ),
    startAge: 65, maxAge: 105,
    sources: SOURCES, help: HELP, draw, describe, events: EVENTS, focuses: FOCUSES, yearly, pauses: PAUSES,
    mortality, deathLine, deathHelp: null, notChosen, epilogue,
    statLabels: { health: T('健康', 'Health'), money: T('經濟', 'Money'), people: T('人際', 'People'), spirits: T('心情', 'Spirits') },
    // exposed for the calibration tool
    _model: { catPrev, jointPrev, demPrev, ltcPrev, qx },
  };
})();
