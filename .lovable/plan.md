

## Add Reports Tab to Admin Dashboard

### What This Does
Adds a new **Reports** tab to the admin bottom navigation that shows detailed analytical reports of student performance, organized into clear categories:

1. **Namaz Timing Report** -- Students ranked by early/middle/late Namaz counts
2. **Dua Leaders** -- Students with most Duas marked
3. **Quran Leaders** -- Students with most Quran readings
4. **Extra Dhikr Leaders** -- Students with most extra dhikr entries
5. **Good Deeds Leaders** -- Students with most good deeds
6. **Qaza Report** -- Students with most Qaza prayers marked

Each section shows a ranked list of students with counts and visual indicators.

### No Data Loss / No Backend Changes
- This is a **frontend-only** read operation -- it uses the same `get_stats` API that the Stats page already uses
- No new database tables, columns, or backend functions needed
- All existing data remains untouched

### Deployment
1. Pull latest from GitHub
2. Run `npm run build`
3. Upload the `dist` folder to your hPanel

---

### Technical Details

#### New File: `src/pages/admin/AdminReports.tsx`
- Uses `adminApi("get_stats")` to fetch profiles, attendance, and qaza_records (same data source as AdminStats)
- Aggregates data into category-specific leaderboards:
  - Counts early namaz (time_percentage <= 33.33), middle (33.33-66.66), late (> 66.66) per student
  - Counts dua_marked, quran_marked, extra_ziker, good_deed, qaza per student
- Uses Tabs component (already available) to organize reports by category
- Each tab shows a ranked list with student name, father name, and count
- Wrapped in `AdminLayout` for consistent styling

#### Modified File: `src/components/layout/AdminBottomNav.tsx`
- Add a new nav item: `{ icon: FileText, label: "Reports", path: "/admin/reports" }`
- Placed between "Stats" and "Logout"

#### Modified File: `src/App.tsx`
- Import `AdminReports` and add route: `<Route path="/admin/reports" element={<AdminReports />} />`

