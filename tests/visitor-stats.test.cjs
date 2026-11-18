const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/visitor-stats.js'), 'utf8');
const endpoint = 'https://stats.cuhkgeo.com/totals.json';
const websiteId = 'e4afae29-66d9-4732-9b81-451434cc1154';
const sample = {
  since: '2026-11-18', updatedAt: '2026-11-18T02:30:00Z',
  pageviews: 120, visitors: 45, legacy: null,
};

class Element {
  constructor(tagName = 'span', attributes = {}) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.children = [];
    this.hidden = true;
    this._text = '';
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this._text = ''; this.children = children; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(' '); }
}

async function render(options = {}) {
  const values = new Element();
  const note = new Element();
  const history = new Element();
  const root = new Element('div', { 'data-language': options.language || 'zh' });
  root.querySelector = selector => ({ '[data-visitor-values]': values, '[data-visitor-note]': note, '[data-visitor-history]': history })[selector];
  const script = new Element('script', {
    'data-domain': 'xiafanzeng.github.io',
    'data-website-id': options.websiteId ?? websiteId,
    'data-script-url': 'https://stats.cuhkgeo.com/script.js',
    'data-host-url': 'https://stats.cuhkgeo.com',
    'data-totals-url': endpoint,
  });
  const head = new Element('head');
  const stored = new Map();
  if (options.cache !== undefined) stored.set(`visitor-stats:v1:${endpoint}`, JSON.stringify(options.cache));
  let calls = 0;
  const context = {
    document: { currentScript: script, head, createElement: tag => new Element(tag), getElementById: () => root },
    location: { hostname: options.hostname || 'xiafanzeng.github.io', protocol: options.protocol || 'https:', port: options.port || '' },
    localStorage: {
      getItem: key => { if (options.storageError) throw Error('Storage unavailable'); return stored.get(key) ?? null; },
      setItem: (key, value) => { if (options.storageError) throw Error('Storage unavailable'); stored.set(key, value); },
    },
    fetch: async (url, init) => {
      calls++;
      assert.equal(url, endpoint);
      assert.equal(init.credentials, 'omit');
      if (options.networkError) throw Error('Network unavailable');
      if (options.timeout) return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Error('Timed out'))));
      return { ok: options.ok !== false, json: async () => options.data ?? sample };
    },
    AbortController, Intl, Date, console,
    setTimeout: options.timeout ? callback => setTimeout(callback, 0) : setTimeout,
    clearTimeout,
  };
  await vm.runInNewContext(source, context);
  return { values, note, history, head, calls, stored };
}

test('local, alternate-domain, and insecure previews make no external requests', async () => {
  for (const options of [{ hostname: 'localhost' }, { hostname: '127.0.0.1' }, { hostname: 'preview.example.com' }, { protocol: 'http:' }, { port: '1313' }]) {
    const result = await render(options);
    assert.equal(result.calls, 0);
    assert.equal(result.head.children.length, 0);
    assert.match(result.note.textContent, /本地预览不记录访问/);
  }
});

test('production loads only the configured Umami tracker and labels new counts with a start date', async () => {
  const result = await render();
  assert.equal(result.calls, 1);
  assert.equal(result.head.children.length, 1);
  const tracker = result.head.children[0];
  assert.equal(tracker.src, 'https://stats.cuhkgeo.com/script.js');
  assert.equal(tracker.getAttribute('data-website-id'), websiteId);
  assert.equal(tracker.getAttribute('data-domains'), 'xiafanzeng.github.io');
  assert.equal(tracker.getAttribute('data-host-url'), 'https://stats.cuhkgeo.com');
  assert.match(result.values.textContent, /访问量：120/);
  assert.match(result.values.textContent, /访客数：45/);
  assert.match(result.note.textContent, /自 2026年11月18日 起/);
});

test('missing website ID does not load a tracker but still allows the public totals', async () => {
  const result = await render({ websiteId: '' });
  assert.equal(result.head.children.length, 0);
  assert.equal(result.calls, 1);
});

test('verified nonoverlapping legacy PV is added; legacy visitors remain separate', async () => {
  const result = await render({ data: { ...sample, legacy: { pageviews: 1000, visitors: 300, asOf: '2026-11-17' } } });
  assert.match(result.values.textContent, /累计访问量：1,120/);
  assert.match(result.values.textContent, /访客数：45（自 2026年11月18日 起）/);
  assert.match(result.values.textContent, /历史访客数：300（截至 2026年11月17日）/);
  assert.doesNotMatch(result.values.textContent, /345/);
});

test('overlapping or approximate legacy counts are not included', async () => {
  for (const legacy of [{ pageviews: 1000, visitors: 300, asOf: '2026-11-18' }, { pageviews: '1000+', visitors: 300, asOf: '2026-11-17' }]) {
    const result = await render({ data: { ...sample, legacy } });
    assert.match(result.values.textContent, /访问量：120/);
    assert.doesNotMatch(result.values.textContent, /历史|累计/);
    assert.match(result.note.textContent, /自 2026年11月18日 起/);
  }
});

test('failed refresh shows valid local cache with its date', async () => {
  const result = await render({ networkError: true, cache: sample, language: 'en' });
  assert.match(result.values.textContent, /Views: 120/);
  assert.match(result.note.textContent, /Since November 18, 2026/);
  assert.match(result.note.textContent, /Cached/);
  assert.match(result.note.textContent, /November 18, 2026/);
});

test('no data yields one friendly message without fabricated zeroes or dash counters', async () => {
  const result = await render({ networkError: true });
  assert.equal(result.values.hidden, true);
  assert.match(result.note.textContent, /访问统计暂时无法读取/);
  assert.doesNotMatch(result.note.textContent, /--|：0/);
});

test('invalid numeric data and invalid calendar dates cannot become counters', async () => {
  for (const data of [{ ...sample, pageviews: -1 }, { ...sample, visitors: '45' }, { ...sample, since: '2026-02-30' }, { ...sample, updatedAt: 'unknown' }]) {
    const result = await render({ data });
    assert.equal(result.values.hidden, true);
    assert.match(result.note.textContent, /访问统计暂时无法读取/);
  }
});

test('storage restrictions do not prevent valid English counts including zero', async () => {
  const result = await render({ storageError: true, language: 'en', data: { ...sample, pageviews: 0, visitors: 0 } });
  assert.match(result.values.textContent, /Views: 0/);
  assert.match(result.values.textContent, /Visitors: 0/);
  assert.match(result.note.textContent, /Since November 18, 2026/);
});

test('an HTTP error with invalid cached data shows the unavailable message', async () => {
  const result = await render({ ok: false, cache: { ...sample, pageviews: 'about 100' } });
  assert.equal(result.values.hidden, true);
  assert.match(result.note.textContent, /访问统计暂时无法读取/);
});

test('a stalled request is aborted and valid cached data remains visible', async () => {
  const result = await render({ timeout: true, cache: sample });
  assert.match(result.values.textContent, /访问量：120/);
  assert.match(result.note.textContent, /缓存数据/);
});

test('a successful refresh replaces older local totals', async () => {
  const result = await render({ cache: { ...sample, pageviews: 50, visitors: 20 } });
  assert.match(result.values.textContent, /访问量：120/);
  assert.doesNotMatch(result.note.textContent, /缓存/);
  assert.equal(JSON.parse(result.stored.get(`visitor-stats:v1:${endpoint}`)).pageviews, 120);
});

test('old cached values visibly keep their original as-of date rather than appearing current', async () => {
  const cache = { ...sample, since: '2026-01-01', updatedAt: '2026-02-02T04:05:00Z' };
  for (const language of ['zh', 'en']) {
    const result = await render({ cache, networkError: true, language });
    assert.match(result.note.textContent, language === 'zh' ? /缓存数据，更新于 2026年2月2日/ : /Cached data · updated February 2, 2026/);
    assert.equal(result.note.hidden, false);
  }
});

test('migration estimates are separate from measured counts in both languages', async () => {
  for (const language of ['zh', 'en']) {
    const result = await render({ language, data: { ...sample, legacyEstimate: { pageviews: 2000, visitors: 1500 } } });
    assert.match(result.values.textContent, /120/);
    assert.match(result.values.textContent, /45/);
    assert.doesNotMatch(result.values.textContent, /2,120|1,545|2,000|1,500/);
    assert.equal(result.history.textContent, language === 'zh'
      ? '迁移前（估计）：2,000+ 次访问 · 1,500+ 位访客'
      : 'Before migration (estimated): 2,000+ views · 1,500+ visitors');
    assert.equal(result.history.hidden, false);
  }
});

test('precise historical counts take precedence over migration estimates', async () => {
  const result = await render({ data: {
    ...sample, legacy: { pageviews: 2100, visitors: 1600, asOf: '2026-11-17' },
    legacyEstimate: { pageviews: 2000, visitors: 1500 },
  } });
  assert.match(result.values.textContent, /累计访问量：2,220/);
  assert.match(result.values.textContent, /历史访客数：1,600/);
  assert.equal(result.history.hidden, true);
  assert.equal(result.history.textContent, '');
});

test('invalid estimates are ignored without hiding valid measured totals', async () => {
  for (const legacyEstimate of [{ pageviews: '2000+', visitors: 1500 }, { pageviews: 2000, visitors: -1 }, { pageviews: 2000 }]) {
    const result = await render({ data: { ...sample, legacyEstimate } });
    assert.match(result.values.textContent, /访问量：120/);
    assert.equal(result.history.hidden, true);
  }
});

test('cached estimates retain their label and source timestamp during an outage', async () => {
  const cache = { ...sample, legacyEstimate: { pageviews: 2000, visitors: 1500 } };
  const result = await render({ cache, networkError: true });
  assert.match(result.history.textContent, /迁移前（估计）/);
  assert.match(result.note.textContent, /缓存数据，更新于 2026年11月18日/);
});
