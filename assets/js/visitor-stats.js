(function () {
  'use strict';

  const config = document.currentScript;
  if (!config) return;

  const root = document.getElementById('visitor-stats');
  const isZh = root && root.getAttribute('data-language') === 'zh';
  const values = root && root.querySelector('[data-visitor-values]');
  const note = root && root.querySelector('[data-visitor-note]');
  const domains = (config.getAttribute('data-domains') || '').split(',').map(domain => domain.trim()).filter(Boolean);
  const websiteId = config.getAttribute('data-website-id') || '';
  const endpoint = config.getAttribute('data-totals-url');
  const pageviewsBaseline = Number(config.getAttribute('data-pageviews-baseline'));
  const visitorsBaseline = Number(config.getAttribute('data-visitors-baseline'));
  const cacheKey = `visitor-stats:v1:${endpoint}`;
  const locale = isZh ? 'zh-CN' : 'en-US';

  function showMessage(message) {
    if (!root) return;
    values.replaceChildren();
    values.hidden = true;
    note.textContent = message;
    note.hidden = false;
  }

  // Production builds can also be opened locally; check the runtime origin.
  if (!domains.includes(location.hostname) || location.protocol !== 'https:' || location.port) {
    showMessage(isZh ? '本地预览不记录访问。' : 'Visits are not recorded in this preview.');
    return;
  }

  function recordPageview() {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(websiteId)) {
      return Promise.resolve(false);
    }
    return new Promise(resolve => {
      const tracker = document.createElement('script');
      tracker.async = true;
      tracker.src = config.getAttribute('data-script-url');
      tracker.setAttribute('data-website-id', websiteId);
      tracker.setAttribute('data-domains', domains.join(','));
      tracker.setAttribute('data-host-url', config.getAttribute('data-host-url'));
      // Umami v3.5.0 initializes normally, but this pageview is sent once below.
      tracker.setAttribute('data-auto-pageview', 'false');
      let started = false;
      tracker.onload = () => {
        if (started) return;
        started = true;
        if (!window.umami || typeof window.umami.track !== 'function') {
          resolve(false);
          return;
        }
        Promise.resolve().then(() => window.umami.track()).then(
          () => resolve(true),
          () => resolve(false),
        );
      };
      tracker.onerror = () => { started = true; resolve(false); };
      // Keep this a native classic script so Umami can read currentScript.
      document.head.appendChild(tracker);
    });
  }

  const pageview = recordPageview().catch(() => false);
  if (!root || !endpoint) return;

  function normalize(data) {
    if (!data || !Number.isSafeInteger(data.pageviews) || data.pageviews < 0
        || !Number.isSafeInteger(data.visitors) || data.visitors < 0) {
      throw new Error('Invalid visitor statistics');
    }
    return { pageviews: data.pageviews, visitors: data.visitors };
  }

  function metric(iconClass, label, count) {
    const item = document.createElement('span');
    item.className = 'visitor-stats-item';
    const icon = document.createElement('i');
    icon.className = `fas ${iconClass}`;
    icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.textContent = `${label}${new Intl.NumberFormat(locale).format(count)}`;
    item.replaceChildren(icon, text);
    return item;
  }

  function separator() {
    const dot = document.createElement('span');
    dot.className = 'visitor-stats-sep';
    dot.setAttribute('aria-hidden', 'true');
    dot.textContent = '\u00a0·\u00a0';
    return dot;
  }

  function showStats(data) {
    values.replaceChildren(
      separator(), metric('fa-eye', isZh ? '访问量：' : 'Views: ', pageviewsBaseline + data.pageviews),
      separator(), metric('fa-users', isZh ? '访客数：' : 'Visitors: ', visitorsBaseline + data.visitors),
    );
    values.hidden = false;
    note.textContent = '';
    note.hidden = true;
  }

  let latest = null;
  try {
    const saved = localStorage.getItem(cacheKey);
    if (saved) latest = normalize(JSON.parse(saved));
  } catch (_) {
    // Storage is optional; privacy settings must not prevent live totals.
  }
  if (latest) showStats(latest);
  else showMessage(isZh ? '正在读取访问统计…' : 'Loading visitor statistics…');

  let requested = 0;
  let applied = 0;
  async function refreshTotals() {
    const request = ++requested;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(endpoint, {
        signal: controller.signal, credentials: 'omit', cache: 'no-store',
      });
      if (!response.ok) throw new Error('Visitor statistics unavailable');
      const data = normalize(await response.json());
      if (request < applied) return;
      applied = request;
      latest = data;
      showStats(data);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (_) {
        // Failing to save a fallback must not hide valid current totals.
      }
    } catch (_) {
      if (!latest && request === requested) {
        showMessage(isZh ? '访问统计暂时无法读取，请稍后再试。' : 'Visitor statistics are temporarily unavailable. Please try again later.');
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  // Slow or blocked collection must not prevent reading already recorded totals.
  let fallbackStarted = false;
  const fallbackTimer = setTimeout(() => {
    fallbackStarted = true;
    refreshTotals();
  }, 2000);
  pageview.then(completed => {
    clearTimeout(fallbackTimer);
    if (completed || !fallbackStarted) refreshTotals();
  });
})();
