

## Download Report Button on Admin Dashboard

### What This Does
Adds a "Download Report" button on the Admin Dashboard page. When clicked, it fetches all student data and generates a downloadable Excel-compatible CSV file containing:

- Student name, father's name
- Total points breakdown (Early/Middle/Late Namaz, Dua, Quran, Qaza)
- Number of prayers in each time slot (early, middle, late)
- Extra Dhikr entries (date, session, and text)
- Good Deeds entries (date, session, and text)

### No Data Loss / No Backend Changes
- This is a **frontend-only** change -- no database, no edge function modifications
- Uses the same `get_stats` API that the Stats page already uses
- All existing users, data, logins, and points remain untouched

### Deployment
Same as before:
1. Pull latest code from GitHub
2. Run `npm run build`
3. Upload the `dist` folder to your hPanel
4. Done -- no backend changes needed

---

### Technical Details

#### File to Modify: `src/pages/admin/AdminDashboard.tsx`

**Changes:**
1. Add a "Download Report" button (green, with a download icon) below the existing stats cards and above the Reset button
2. When clicked, it calls `adminApi("get_stats")` to fetch all profiles, attendance, and qaza records
3. Processes the data into a structured CSV with these columns:

```text
Rank | Student Name | Father Name | Early Namaz (Count) | Early Namaz (Pts) | Middle Namaz (Count) | Middle Namaz (Pts) | Late Namaz (Count) | Late Namaz (Pts) | Dua (Count) | Dua (Pts) | Quran (Count) | Quran (Pts) | Extra Dhikr (Count) | Extra Dhikr (Pts) | Good Deeds (Count) | Good Deeds (Pts) | Qaza (Count) | Qaza (Pts) | Total Points
```

4. A second sheet/section in the CSV will list detailed Extra Dhikr and Good Deed entries:

```text
--- EXTRA DHIKR & GOOD DEEDS DETAIL ---
Student Name | Date | Session | Type | Text
```

5. The file is generated client-side using a Blob and downloaded as `KYF_Prayer_Report_YYYY-MM-DD.csv` (opens in Excel)

#### Helper Function: CSV Generation
A utility function `generateReportCSV(profiles, attendance, qazaRecords)` will:
- Compute the same point calculations as AdminStats
- Build the summary rows (one per student, sorted by rank)
- Append a detail section with all Extra Dhikr and Good Deed text entries with dates and sessions
- Return a CSV string that gets downloaded via `URL.createObjectURL`

No new dependencies needed -- CSV generation is done with plain JavaScript string building.

