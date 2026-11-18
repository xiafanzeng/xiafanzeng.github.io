# Visitor statistics

The footer reads public aggregate statistics from the URL in `visitor_stats.totals_url`. The Umami website UUID, script URL, and collection host are configured alongside it in `config/_default/params.yaml`. The UUID is public configuration, not an API credential. API credentials must remain on the statistics server.

Both the Umami script and totals request run only on HTTPS at the configured exact hostname without a custom port. Local and alternate-domain previews do not contact the statistics service. The old Busuanzi script is no longer loaded.

The loader creates a native classic `<script src="https://stats.cuhkgeo.com/script.js">` and sets `data-website-id`, `data-domains`, and `data-host-url` before appending it to the document. It does not fetch/evaluate the tracker as text or load it as a JavaScript module, so Umami can read its own `document.currentScript`. The explicit `data-host-url="https://stats.cuhkgeo.com"` directs collection to that host's `/api/send` endpoint. See the [official tracker configuration](https://umami.is/docs/tracker-configuration).

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

The values above are schema examples, not the site's recorded statistics. `pageviews` and `visitors` are nonnegative safe integers for the new period, which starts on `since`. `updatedAt` is the source snapshot time, displayed in the footer with its time zone.

When exact historical statistics have been recovered, `legacy` may contain `pageviews`, `visitors`, and `asOf` (`YYYY-MM-DD`). Only supply verified history whose period does not overlap the new period. The frontend only adds historical pageviews when `asOf` is strictly earlier than `since`; same-day cutovers cannot establish nonoverlap with this date-only contract. Approximate values such as `"1000+"` are not accepted.

Historical pageviews are added to the new period's pageviews. New visitors and historical visitors are displayed separately with their respective dates, because visitors cannot be deduplicated across the two services. With no usable history, both counters are explicitly labeled as starting on `since`.

If only approximate historical figures are available, the optional `legacyEstimate` field may contain nonnegative integer `pageviews` and `visitors`. The footer displays them in a separate line labeled “迁移前（估计） / Before migration (estimated)” with `+` after each value. They are never added to measured statistics. Valid, nonoverlapping exact `legacy` data takes precedence and hides the estimate. The user supplied approximate pre-migration figures of 2,000+ views and 1,500+ visitors on 2026-11-18; these belong in the server's published data, not as hard-coded UI values or exact historical counts.

## Failure behavior

The latest valid response is cached in the visitor's browser, keyed by the totals URL. An unavailable or invalid response falls back to that cache with a visible source timestamp and cache label, even when the cached snapshot is months old. Its `updatedAt` is never replaced with the current time. If there is no valid cache, the footer shows one unavailable message; it does not invent a zero. A real zero from a valid response is displayed normally.

The request times out after eight seconds and does not retry automatically. Browser storage restrictions do not prevent live statistics from displaying. Without JavaScript, the footer displays a short explanation. Dynamic updates use a polite live region and introduce no keyboard-only interaction.

Run the behavior checks with `node --test tests/visitor-stats.test.cjs`, followed by the normal Hugo build.

## Operating the self-hosted service

Umami and PostgreSQL run as the dedicated Compose project in `/opt/fanzeng-analytics` on the analytics host. OpenResty serves `stats.cuhkgeo.com` over HTTPS. PostgreSQL is internal to the Compose network. Only the aggregate snapshot is published at `/totals.json`.

The systemd timer `fanzeng-analytics-totals.timer` publishes a snapshot every minute. If the database is unavailable, the previous snapshot keeps its original timestamp. The owner's pre-migration estimates are stored separately in `historical-estimate.json`. The early Busuanzi figures are not individual events in the Umami database.

The timer `fanzeng-analytics-backup.timer` takes a PostgreSQL dump daily at 04:15 Asia/Shanghai. Private archives under `/opt/fanzeng-analytics/backups/` are retained for about 30 days and include the database, historical figures, service configuration and login secrets. For a recovery check, extract an archive privately and use `pg_restore --exit-on-error --no-owner` against a **fresh** PostgreSQL database. Verify the homepage website ID and domain before reconnecting Umami.
