
Goal: Fix admin dashboard showing “0 Marked Today” and stagnant points by correcting how admin stats are fetched (without any data loss or schema changes).

What I found
- Attendance is being saved correctly (database has today’s rows, e.g. 2026-03-12).
- The admin stats edge function response currently includes only old attendance (it stops around 2026-02-21 in runtime output).
- Root cause: API row cap per request is 1000, so a single `.select()` (even with high `.limit(...)`) still returns only the first chunk in this environment.

Implementation plan

1) Update edge function data fetching to true pagination
- File: `supabase/functions/admin-manage-users/index.ts`
- Add a reusable paginated fetch helper for table reads:
  - Fetch in chunks with `.range(from, to)` (page size 1000).
  - Use stable ordering (e.g. `created_at` + `id`) to avoid duplicates/skips across pages.
  - Loop until returned rows < page size.
- Apply this helper to:
  - `get_stats` → `prayer_attendance`, `qaza_records`, and `profiles`
  - `list_users` → `prayer_attendance` (and optionally profiles for consistency)

2) Keep existing API contract unchanged
- Return shape remains:
  - `get_stats`: `{ attendance, profiles, qaza_records }`
  - `list_users`: `{ users }`
- No frontend route/component changes needed for this bug fix.

3) Validate after change (runtime checks)
- Call backend function `get_stats` and confirm:
  - attendance includes dates up to today (not ending in Feb)
  - attendance row count matches DB count (currently ~3503)
- In admin UI:
  - `/admin` “Marked Today” should become > 0
  - `/admin/stats` points should reflect recent marks
  - `/admin/reports` should include latest day’s activity

4) Safety and impact
- No database schema change
- No table/data deletion or reset
- No effect on user accounts, points logic, or attendance logic—only complete data retrieval is fixed

Technical notes
- This is a backend function pagination fix, not a timezone fix.
- Current console ref warnings in admin UI are separate and non-blocking for this attendance-count issue.
