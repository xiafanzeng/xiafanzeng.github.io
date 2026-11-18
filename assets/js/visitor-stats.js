(async function () {
  'use strict';

  const config = document.currentScript;
  if (!config) return;

  const root = document.getElementById('visitor-stats');
  const isZh = root && root.getAttribute('data-language') === 'zh';
  const values = root && root.querySelector('[data-visitor-values]');
  const note = root && root.querySelector('[data-visitor-note]');
  const history = root && root.querySelector('[data-visitor-history]');
  const domain = config.getAttribute('data-domain');
  const websiteId = config.getAttribute('data-website-id') || '';
  const endpoint = config.getAttribute('data-totals-url');
  const cacheKey = `visitor-stats:v1:${endpoint}`;
  const locale = isZh ? 'zh-CN' : 'en-US';

  function showMessage(message) {
    if (!root) return;
    values.replaceChildren();
    values.hidden = true;
    history.textContent = '';
    history.hidden = true;
    note.textContent = message;
    note.hidden = false;
  }

  // A production build may also be opened locally. Check the runtime origin
  // before loading either the tracker or the public totals.
  if (location.hostname !== domain || location.protocol !== 'https:' || location.port) {
    showMessage(isZh ? '本地预览不记录访问。' : 'Visits are not recorded in this preview.');
    return;
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(websiteId)) {
    const tracker = document.createElement('script');
    tracker.async = true;
    tracker.src = config.getAttribute('data-script-url');
    tracker.setAttribute('data-website-id', websiteId);
    tracker.setAttribute('data-domains', domain);
    tracker.setAttribute('data-host-url', config.getAttribute('data-host-url'));
    // This is a native classic script, not fetched/evaluated code or a module.
    // Umami reads these attributes from its own document.currentScript.
    document.head.appendChild(tracker);
  }
  if (!root || !endpoint) return;

  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validCount(value) {
    return Number.isSafeInteger(value) && value >= 0;
  }

  function normalize(data) {
    if (!data || !validDate(data.since) || !validCount(data.pageviews) || !validCount(data.visitors)
        || typeof data.updatedAt !== 'string' || !data.updatedAt.includes('T')
        || !Number.isFinite(Date.parse(data.updatedAt))) {
      throw new Error('Invalid visitor statistics');
    }

    // Only exact numeric history ending before the new period may be added.
    // Historical visitors are always shown separately: they cannot be deduplicated
    // against the new service's visitors.
    const old = data.legacy;
    const legacy = old && validCount(old.pageviews) && validCount(old.visitors)
      && validDate(old.asOf) && old.asOf < data.since
      && Number.isSafeInteger(old.pageviews + data.pageviews)
      ? { pageviews: old.pageviews, visitors: old.visitors, asOf: old.asOf }
      : null;

    const estimate = data.legacyEstimate;
    const legacyEstimate = !legacy && estimate && validCount(estimate.pageviews) && validCount(estimate.visitors)
      ? { pageviews: estimate.pageviews, visitors: estimate.visitors }
      : null;

    return { since: data.since, updatedAt: data.updatedAt, pageviews: data.pageviews, visitors: data.visitors, legacy, legacyEstimate };
  }

  function dateLabel(value) {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
  }

  function updatedLabel(value) {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Shanghai', timeZoneName: 'short',
    }).format(new Date(value));
  }

  function metric(label, count, iconName, suffix = '') {
    const item = document.createElement('span');
    item.className = 'visitor-stats-item';
    const icon = document.createElement('i');
    icon.className = `fas ${iconName}`;
    icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.textContent = `${label}${new Intl.NumberFormat(locale).format(count)}${suffix}`;
    item.appendChild(icon);
    item.appendChild(text);
    return item;
  }

  function showStats(data, cached) {
    const since = dateLabel(data.since);
    const old = data.legacy;
    const items = [];
    let period;

    if (old) {
      const asOf = dateLabel(old.asOf);
      items.push(metric(isZh ? '累计访问量：' : 'Total views: ', old.pageviews + data.pageviews, 'fa-eye'));
      items.push(metric(isZh ? '访客数：' : 'Visitors: ', data.visitors, 'fa-users',
        isZh ? `（自 ${since} 起）` : ` (since ${since})`));
      items.push(metric(isZh ? '历史访客数：' : 'Historical visitors: ', old.visitors, 'fa-history',
        isZh ? `（截至 ${asOf}）` : ` (through ${asOf})`));
      period = isZh
        ? `访问量含截至 ${asOf} 的历史记录；新统计自 ${since} 起。`
        : `Views include history through ${asOf}; new statistics start ${since}.`;
    } else {
      items.push(metric(isZh ? '访问量：' : 'Views: ', data.pageviews, 'fa-eye'));
      items.push(metric(isZh ? '访客数：' : 'Visitors: ', data.visitors, 'fa-users'));
      period = isZh ? `自 ${since} 起` : `Since ${since}`;
    }

    const freshness = cached
      ? (isZh ? `缓存数据，更新于 ${updatedLabel(data.updatedAt)}` : `Cached data · updated ${updatedLabel(data.updatedAt)}`)
      : (isZh ? `数据更新于 ${updatedLabel(data.updatedAt)}` : `Data updated ${updatedLabel(data.updatedAt)}`);
    values.replaceChildren(...items);
    values.hidden = false;
    note.textContent = `${period} · ${freshness}`;
    note.hidden = false;
    const estimate = data.legacyEstimate;
    if (!old && estimate) {
      const number = new Intl.NumberFormat(locale);
      history.textContent = isZh
        ? `迁移前（估计）：${number.format(estimate.pageviews)}+ 次访问 · ${number.format(estimate.visitors)}+ 位访客`
        : `Before migration (estimated): ${number.format(estimate.pageviews)}+ views · ${number.format(estimate.visitors)}+ visitors`;
      history.hidden = false;
    } else {
      history.textContent = '';
      history.hidden = true;
    }
  }

  let cached = null;
  try {
    const saved = localStorage.getItem(cacheKey);
    if (saved) cached = normalize(JSON.parse(saved));
  } catch (_) {
    // Browser privacy settings may disable storage; live totals still work.
  }

  if (cached) showStats(cached, true);
  else showMessage(isZh ? '正在读取访问统计…' : 'Loading visitor statistics…');

  let timeout;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(endpoint, {
      signal: controller.signal, credentials: 'omit', cache: 'no-cache',
    });
    if (!response.ok) throw new Error('Visitor statistics unavailable');
    const data = normalize(await response.json());
    showStats(data, false);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (_) {
      // Failing to save a local fallback must not hide valid current totals.
    }
  } catch (_) {
    if (cached) showStats(cached, true);
    else showMessage(isZh ? '访问统计暂时无法读取，请稍后再试。' : 'Visitor statistics are temporarily unavailable. Please try again later.');
  } finally {
    clearTimeout(timeout);
  }
})();
