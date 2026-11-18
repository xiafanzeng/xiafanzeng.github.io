# Visitor statistics

The footer reads public aggregate statistics from the URL in `visitor_stats.totals_url`. The Umami website UUID, script URL, and collection host are configured alongside it in `config/_default/params.yaml`. The UUID is public configuration, not an API credential. API credentials must remain on the statistics server.

Both the Umami script and totals request run only on HTTPS at the configured exact hostname without a custom port. Local and alternate-domain previews do not contact the statistics service. The old Busuanzi script is no longer loaded.

The loader creates a native classic `<script src="https://stats.cuhkgeo.com/script.js">` and sets `data-website-id`, `data-domains`, and `data-host-url` before appending it to the document. It does not fetch/evaluate the tracker as text or load it as a JavaScript module, so Umami can read its own `document.currentScript`. The explicit `data-host-url="https://stats.cuhkgeo.com"` directs collection to that host's `/api/send` endpoint. See the [official tracker configuration](https://umami.is/docs/tracker-configuration).

For Umami v3.5.0, `data-auto-pageview="false"` disables automatic pageviews while leaving the rest of tracker initialization enabled. The native script's load handler calls `window.umami.track()` exactly once, then waits for its promise before reading the real-time totals. Umami handles both pageview collection and visitor deduplication.

## Public totals contract

`totals.json` must return JSON with CORS access allowed for `https://xiafanzeng.github.io`. The browser sends no credentials.

```json
{
  "since": "2026-11-18",
  "updatedAt": "2026-11-18T02:30:00Z",
  "pageviews": 120,
  "visitors": 45,
  "legacy": null,
  "legacyEstimate": null
}
```

The values above are schema examples, not the site's recorded statistics. `pageviews` and `visitors` are nonnegative safe integers for the new period, which starts on `since`. `updatedAt` is the source snapshot time.

The public footer shows **Last updated / Views / Visitors** (最近更新 / 访问量 / 访客数). When rendering a valid pair of Umami counts, both languages add the owner's fixed baselines from `visitor_stats` in `config/_default/params.yaml`. The views baseline is 2,500 and the visitors baseline is 1,700. A measured pair of 6 views and 1 visitor therefore displays as 2,506 and 1,701.

The API and browser cache store raw Umami counts. Applying the offsets only when rendering keeps refreshes and cached reads from accumulating the baselines. The server's separate historical records (`legacy` and `legacyEstimate`) are ignored by the footer.

## Failure behavior

The last valid pair of counts is cached in the visitor's browser, keyed by the totals URL. An unavailable or invalid response leaves the latest valid displayed counts in place, including the local fallback. If there are no valid counts, the footer shows one unavailable message. Valid zero counts display the configured baselines.

The totals request uses `cache: 'no-store'` and an eight-second timeout. If loading or sending the pageview takes longer than two seconds, the footer reads existing totals first, then refreshes once collection finishes. A successful newer request cannot be overwritten by an older response arriving later. Tracker load errors, missing APIs and collection rejection still allow an independent totals read; a silently blocked tracker uses the two-second fallback. Browser storage restrictions do not prevent live statistics from displaying. Without JavaScript, the footer displays a short explanation. Dynamic updates use a polite live region and introduce no keyboard-only interaction.

Run the behavior checks with `node --test tests/visitor-stats.test.cjs`, followed by the normal Hugo build.

## Operating the self-hosted service

The dedicated Compose project in `/opt/fanzeng-analytics` runs Umami, PostgreSQL and a read-only PostgREST service. OpenResty serves `stats.cuhkgeo.com/totals.json` over HTTPS with caching disabled. On each GET it queries the single-row `homepage_api.totals` view for the homepage's committed counts. The database is internal and the totals service is bound to loopback.

The systemd timer `fanzeng-analytics-totals.timer` also writes a static snapshot every minute. OpenResty serves that file if a live read fails. The owner's pre-migration estimates are stored separately in `historical-estimate.json`.

The timer `fanzeng-analytics-backup.timer` takes a PostgreSQL dump daily at 04:15 Asia/Shanghai. Private archives under `/opt/fanzeng-analytics/backups/` are retained for about 30 days and include the database, historical figures, service configuration and login secrets. For a recovery check, extract an archive privately and use `pg_restore --exit-on-error --no-owner` against a **fresh** PostgreSQL database. Verify the homepage website ID and domain before reconnecting Umami.

On a fresh database server, restore with `--no-acl`, then apply the archived `live-totals.sql` to recreate the restricted reader role, view and grants. Supply its `TOTALS_PASSWORD` environment variable from the private `.env` file and the psql variables `website_id` and `since` from `website.json`.
