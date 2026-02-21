

## Admin Stats: View Extra Dhikr and Good Deeds Detail

### What This Does
When an admin expands a student's stats and taps the "Extra Dhikr" or "Good Deeds" card, a popup (dialog) will open showing:
1. A calendar highlighting the dates when that student submitted entries
2. Clicking a highlighted date reveals the actual text the student wrote for that day (for each prayer session)

### No Data Loss / No Backend Changes
- This is a **frontend-only** change to the Admin Stats page
- The attendance data (including `extra_ziker` and `good_deed` text fields) is **already being fetched** by the `get_stats` API action
- We just need to store the raw attendance records alongside the computed points and display them in a dialog
- No database changes, no edge function changes, no schema changes

### Deployment Note
After approval and implementation, you will need to:
1. Pull the latest code from GitHub
2. Run `npm run build`
3. Upload the `dist` folder to your cPanel/hPanel
4. Everything else (data, users, logins) stays exactly the same

---

### Technical Implementation

#### 1. Update AdminStats State to Store Raw Attendance

Currently, the component only computes point totals and discards the raw attendance text. We will also store each user's attendance records that contain `extra_ziker` or `good_deed` text, grouped by user ID.

A new state variable will hold the raw attendance data:
```typescript
const [attendanceData, setAttendanceData] = useState<Record<string, any[]>>({});
```

During the existing `fetchStats` loop, we will populate this map with records that have non-empty `extra_ziker` or `good_deed` values.

#### 2. Make Dhikr and Good Deeds Cards Clickable

The two stat cards ("Extra Dhikr" and "Good Deeds") in each user's expanded section will become clickable buttons. Tapping one opens a Dialog showing that user's data for that category.

New state to track which dialog is open:
```typescript
const [dialogInfo, setDialogInfo] = useState<{
  userId: string;
  userName: string;
  type: "dhikr" | "goodDeed";
} | null>(null);
```

#### 3. Create the Detail Dialog Component

The dialog will contain:
- A **Calendar** component (using the existing Shadcn Calendar) with highlighted dates
- Dates that have entries will be visually marked
- Clicking a date shows the text entries for that date below the calendar
- Each entry shows the session type (Fajr/Zoharain/Maghribain) and the text content

```text
+------------------------------------+
|  Extra Dhikr - Student Name        |
|  --------------------------------  |
|  [  Calendar with highlighted    ] |
|  [  dates showing entries        ] |
|  --------------------------------  |
|  Selected: Feb 25, 2026            |
|  --------------------------------  |
|  Fajr: "Read Surah Yasin..."       |
|  Zoharain: "100x Durood..."        |
+------------------------------------+
```

#### 4. Files to Modify

- **`src/pages/admin/AdminStats.tsx`** -- Main changes:
  - Import Dialog and Calendar components
  - Store raw attendance data alongside computed stats
  - Make Dhikr/Good Deed cards clickable
  - Add dialog with calendar view and date-based text display

No other files need to change. No backend or database modifications required.

