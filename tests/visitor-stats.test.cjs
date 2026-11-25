const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/visitor-stats.js'), 'utf8');
const endpoint = 'https://stats.cuhkgeo.com/totals.json';
const cacheKey = `visitor-stats:v1:${endpoint}`;
const websiteId = 'e4afae29-66d9-4732-9b81-451434cc1154';
const domains = 'xiafanzeng.me,xiafanzeng.github.io';
const sample = { pageviews: 120, visitors: 45 };
const flush = () => new Promise(resolve => setImmediate(resolve));
const response = data => ({ ok: true, json: async () => data });
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

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

function createPage(options = {}) {
  const values = new Element();
  const note = new Element();
  const root = new Element('div', { 'data-language': options.language || 'zh' });
  root.querySelector = selector => ({ '[data-visitor-values]': values, '[data-visitor-note]': note })[selector];
  const script = new Element('script', {
    'data-domains': options.domains ?? domains, 'data-website-id': options.websiteId ?? websiteId,
    'data-script-url': 'https://stats.cuhkgeo.com/script.js',
    'data-host-url': 'https://stats.cuhkgeo.com', 'data-totals-url': endpoint,
    'data-pageviews-baseline': options.pageviewsBaseline, 'data-visitors-baseline': options.visitorsBaseline,
  });
  const head = new Element('head');
  const stored = new Map();
  if (options.cache !== undefined) stored.set(cacheKey, JSON.stringify(options.cache));
  const requests = [];
  const timers = new Map();
  let nextTimer = 0;
  let trackCalls = 0;
  const context = {
    document: { currentScript: script, head, createElement: tag => new Element(tag), getElementById: () => root },
    location: { hostname: options.hostname || 'xiafanzeng.me', protocol: options.protocol || 'https:', port: options.port || '' },
    window: { umami: options.noUmami ? undefined : { track: () => { trackCalls++; return options.track ? options.track() : Promise.resolve(); } } },
    localStorage: {
      getItem: key => { if (options.storageError) throw Error('Storage unavailable'); return stored.get(key) ?? null; },
      setItem: (key, value) => { if (options.storageError) throw Error('Storage unavailable'); stored.set(key, value); },
    },
    fetch: (url, init) => {
      requests.push({ url, init });
      assert.equal(url, endpoint);
      assert.equal(init.credentials, 'omit');
      assert.equal(init.cache, 'no-store');
      return options.fetch ? options.fetch(requests.length, init) : Promise.resolve(response(options.data ?? sample));
    },
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    AbortController, Intl, console,
  };
  vm.runInNewContext(source, context);
  return {
    values, note, head, stored, requests,
    get trackCalls() { return trackCalls; },
    async loadTracker() {
      const tracker = head.children[0];
      // Simulate Umami's automatic pageview so the test detects double counting.
      if (options.emulateAutoPageview && tracker.getAttribute('data-auto-pageview') !== 'false') context.window.umami.track();
      tracker.onload();
      await flush();
    },
    async failTracker() { head.children[0].onerror(); await flush(); },
    async advance(delay) {
      for (const [id, timer] of [...timers]) {
        if (timer.delay === delay) { timers.delete(id); timer.callback(); }
      }
      await flush();
    },
  };
}

function assertCompact(page, language = 'zh', counts = sample) {
  assert.deepEqual(Array.from(page.values.children, item => item.className), [
    'visitor-stats-sep', 'visitor-stats-item', 'visitor-stats-sep', 'visitor-stats-item',
  ]);
  assert.equal(page.values.children[1].children[0].className, 'fas fa-eye');
  assert.equal(page.values.children[3].children[0].className, 'fas fa-users');
  assert.match(page.values.textContent, new RegExp(`${language === 'zh' ? '访问量：' : 'Views: '}${counts.pageviews}`));
  assert.match(page.values.textContent, new RegExp(`${language === 'zh' ? '访客数：' : 'Visitors: '}${counts.visitors}`));
  assert.equal(page.note.hidden, true);
  assert.equal(page.note.textContent, '');
  for (const item of page.values.children) assert.equal(item.getAttribute('title'), null);
}

test('local and alternate origins neither load the tracker nor read totals', async () => {
  for (const options of [
    { hostname: 'localhost' }, { hostname: '127.0.0.1' }, { hostname: 'preview.example.com' },
    { hostname: 'www.xiafanzeng.me' }, { hostname: 'xiafanzeng.me.example.com' },
    { hostname: 'xiafanzeng.github.io.example.com' }, { domains: '' },
    { protocol: 'http:' }, { port: '1313' },
    { hostname: 'xiafanzeng.github.io', protocol: 'http:' },
    { hostname: 'xiafanzeng.github.io', port: '1313' },
  ]) {
    const page = createPage(options);
    await flush();
    assert.equal(page.requests.length, 0);
    assert.equal(page.head.children.length, 0);
  }
});

test('new and legacy production domains each record one pageview and read the shared totals', async () => {
  for (const hostname of ['xiafanzeng.me', 'xiafanzeng.github.io']) {
    const page = createPage({ hostname, emulateAutoPageview: true });
    assert.equal(page.head.children.length, 1);
    assert.equal(page.head.children[0].getAttribute('data-domains'), domains);
    await page.loadTracker();
    assert.equal(page.trackCalls, 1);
    assert.equal(page.requests.length, 1);
    assertCompact(page);
  }
});

test('native tracker disables only automatic pageviews and totals wait for the single manual track promise', async () => {
  const collection = deferred();
  const page = createPage({ track: () => collection.promise });
  const tracker = page.head.children[0];
  assert.equal(tracker.src, 'https://stats.cuhkgeo.com/script.js');
  assert.equal(tracker.getAttribute('data-website-id'), websiteId);
  assert.equal(tracker.getAttribute('data-domains'), domains);
  assert.equal(tracker.getAttribute('data-host-url'), 'https://stats.cuhkgeo.com');
  assert.equal(tracker.getAttribute('data-auto-pageview'), 'false');
  assert.equal(tracker.getAttribute('data-auto-track'), null);
  assert.equal(page.requests.length, 0);
  await page.loadTracker();
  assert.equal(page.trackCalls, 1);
  assert.equal(page.requests.length, 0);
  tracker.onload();
  await flush();
  assert.equal(page.trackCalls, 1);
  collection.resolve();
  await flush();
  assert.equal(page.requests.length, 1);
  assertCompact(page);
});

test('each refresh records one PV and displays the server-deduplicated UV without adding one', async () => {
  const server = { pageviews: 7, visitors: 3 };
  for (const expected of [8, 9]) {
    const page = createPage({
      emulateAutoPageview: true,
      track: async () => { server.pageviews++; },
      fetch: async () => response({ ...server }),
    });
    await page.loadTracker();
    assert.equal(page.trackCalls, 1);
    assert.equal(server.pageviews, expected);
    assert.equal(server.visitors, 3);
    assertCompact(page, 'zh', { pageviews: expected, visitors: 3 });
  }
});

test('tracker load errors, missing API, and collection rejection still allow totals to display', async () => {
  const failed = createPage();
  await failed.failTracker();
  assert.equal(failed.trackCalls, 0);
  assertCompact(failed);
  const missing = createPage({ noUmami: true });
  await missing.loadTracker();
  assert.equal(missing.trackCalls, 0);
  assertCompact(missing);
  for (const track of [() => Promise.reject(Error('Blocked')), () => { throw Error('Blocked'); }]) {
    const page = createPage({ track });
    await page.loadTracker();
    assertCompact(page);
  }
});

test('both footers add the fixed baselines once across cached reads and refreshes', async () => {
  for (const language of ['zh', 'en']) {
    let cache = { pageviews: 5, visitors: 1 };
    for (const views of [6, 7]) {
      const data = { pageviews: views, visitors: 1 };
      const page = createPage({ language, cache, data, pageviewsBaseline: '2500', visitorsBaseline: '1700' });
      const viewsLabel = language === 'zh' ? '访问量：' : 'Views: ';
      const visitorsLabel = language === 'zh' ? '访客数：' : 'Visitors: ';
      assert.ok(page.values.textContent.includes(viewsLabel + (2500 + cache.pageviews).toLocaleString('en-US')));
      await page.loadTracker();
      assert.ok(page.values.textContent.includes(viewsLabel + (2500 + views).toLocaleString('en-US')));
      assert.ok(page.values.textContent.includes(visitorsLabel + '1,701'));
      cache = JSON.parse(page.stored.get(cacheKey));
      assert.deepEqual(cache, data);
    }
  }
});

test('a silently blocked tracker triggers a read after two seconds without a fabricated pageview', async () => {
  const page = createPage();
  assert.equal(page.requests.length, 0);
  await page.advance(2000);
  assert.equal(page.requests.length, 1);
  assert.equal(page.trackCalls, 0);
  assertCompact(page);
});

test('an unconfigured website still reads public totals immediately', async () => {
  const page = createPage({ websiteId: '' });
  await flush();
  assert.equal(page.head.children.length, 0);
  assert.equal(page.requests.length, 1);
  assertCompact(page);
});

test('slow collection reads a fallback, then the acknowledged new totals; a late older response cannot overwrite them', async () => {
  const collection = deferred();
  const older = deferred();
  const newer = deferred();
  const page = createPage({ track: () => collection.promise, fetch: n => n === 1 ? older.promise : newer.promise });
  await page.loadTracker();
  await page.advance(2000);
  assert.equal(page.requests.length, 1);
  collection.resolve();
  await flush();
  assert.equal(page.requests.length, 2);
  newer.resolve(response({ pageviews: 121, visitors: 45 }));
  await flush();
  assertCompact(page, 'zh', { pageviews: 121, visitors: 45 });
  older.resolve(response(sample));
  await flush();
  assertCompact(page, 'zh', { pageviews: 121, visitors: 45 });
  assert.deepEqual(JSON.parse(page.stored.get(cacheKey)), { pageviews: 121, visitors: 45 });
});

test('a failed post-collection refresh keeps the successful fallback visible', async () => {
  const collection = deferred();
  const page = createPage({ track: () => collection.promise, fetch: n => n === 1 ? Promise.resolve(response(sample)) : Promise.reject(Error('Offline')) });
  await page.loadTracker();
  await page.advance(2000);
  assertCompact(page);
  collection.resolve();
  await flush();
  assert.equal(page.requests.length, 2);
  assertCompact(page);
});

test('late collection failure does not reread or clear a successful fallback', async () => {
  const collection = deferred();
  const page = createPage({ track: () => collection.promise });
  await page.loadTracker();
  await page.advance(2000);
  assertCompact(page);
  collection.reject(Error('Blocked'));
  await flush();
  assert.equal(page.requests.length, 1);
  assertCompact(page);
});

test('late valid fallback data can still display when the newer request failed', async () => {
  const collection = deferred();
  const fallback = deferred();
  const page = createPage({ track: () => collection.promise, fetch: n => n === 1 ? fallback.promise : Promise.reject(Error('Offline')) });
  await page.loadTracker();
  await page.advance(2000);
  collection.resolve();
  await flush();
  fallback.resolve(response(sample));
  await flush();
  assertCompact(page);
});

test('a failed read uses local counts in both languages without any tooltip or history text', async () => {
  for (const language of ['zh', 'en']) {
    const page = createPage({ language, cache: { ...sample, since: '2026-01-01', updatedAt: '2026-02-02T04:05:00Z', legacyEstimate: { pageviews: 2000, visitors: 1500 } }, fetch: () => Promise.reject(Error('Offline')) });
    await page.loadTracker();
    assertCompact(page, language);
    assert.doesNotMatch(page.values.textContent, /日期|起|缓存|迁移|2000|1500|since|cached|migration/i);
  }
});

test('only measured PV and UV are validated and saved; legacy metadata is ignored', async () => {
  for (const language of ['zh', 'en']) {
    const data = { ...sample, since: 'not needed', updatedAt: 'not needed', legacy: { pageviews: 2100, visitors: 1600 }, legacyEstimate: { pageviews: 2000, visitors: 1500 } };
    const page = createPage({ language, data });
    await page.loadTracker();
    assertCompact(page, language);
    assert.deepEqual(JSON.parse(page.stored.get(cacheKey)), sample);
  }
});

test('invalid counts and missing data never become fabricated zeroes', async () => {
  for (const data of [null, { pageviews: -1, visitors: 45 }, { pageviews: 120, visitors: '45' }, { pageviews: 1.5, visitors: 2 }]) {
    const page = createPage({ fetch: async () => response(data) });
    await page.loadTracker();
    assert.equal(page.values.hidden, true);
    assert.match(page.note.textContent, /访问统计暂时无法读取/);
    assert.doesNotMatch(page.note.textContent, /--|：0/);
  }
});

test('HTTP failure and invalid cache produce one friendly message', async () => {
  const page = createPage({ language: 'en', cache: { pageviews: 'about 100', visitors: 40 }, fetch: async () => ({ ok: false }) });
  await page.loadTracker();
  assert.equal(page.values.hidden, true);
  assert.match(page.note.textContent, /temporarily unavailable/);
});

test('a stalled totals request is aborted after eight seconds while cached counts remain visible', async () => {
  let signal;
  const page = createPage({ cache: sample, fetch: (_, init) => {
    signal = init.signal;
    return new Promise((_, reject) => signal.addEventListener('abort', () => reject(Error('Timeout'))));
  } });
  await page.loadTracker();
  await page.advance(8000);
  assert.equal(signal.aborted, true);
  assertCompact(page);
});

test('storage restrictions do not prevent genuine zero counts in either language', async () => {
  for (const language of ['zh', 'en']) {
    const counts = { pageviews: 0, visitors: 0 };
    const page = createPage({ language, storageError: true, data: counts });
    await page.loadTracker();
    assertCompact(page, language, counts);
  }
});
