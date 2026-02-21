

## Update Ramadan End Date to March 20, 2026

### What Changes
A single line change in `src/pages/admin/AdminDashboard.tsx`:

```
// Current
const endDate = new Date("2026-03-19");

// Updated to
const endDate = new Date("2026-03-20");
```

This changes the "Days Remaining" counter to end on **March 20, 2026** instead of March 19.

### Impact
- **No data loss** -- this is a display-only calculation
- **No backend changes** -- nothing in the database is affected
- **No other files affected** -- only one line in one file
- All stats, points, attendance records, and user accounts remain exactly as they are

### Deployment
After approval:
1. Pull latest from GitHub
2. Run `npm run build`
3. Upload the `dist` folder to your hPanel
4. Done

