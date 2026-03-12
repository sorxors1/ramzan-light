

## Fix: Admin Dashboard Not Showing Today's Attendance

### Root Cause
The database now contains **3,502 attendance records**. The Supabase client has a **default limit of 1,000 rows** per query. When the `get_stats` action runs `select("*")` on `prayer_attendance`, it only returns the oldest 1,000 records -- today's records are beyond that limit and get silently dropped.

This is why it worked 10 days ago (fewer total records) but stopped now.

### The Fix
In the edge function (`supabase/functions/admin-manage-users/index.ts`), add `.limit(10000)` or use pagination/range to fetch all records. Same fix needed for `list_users` action which also fetches all attendance.

### Technical Details

#### Modified File: `supabase/functions/admin-manage-users/index.ts`

**In the `get_stats` action (~line 265-267):**
- Change `serviceClient.from("prayer_attendance").select("*")` to include `.limit(10000)` 
- Same for `qaza_records` query
- Same for `profiles` query

**In the `list_users` action (~line 238-241):**
- Add `.limit(10000)` to the attendance query

This ensures all records are fetched regardless of how many accumulate over the remaining Ramadan days.

### Impact
- Backend-only change (edge function update)
- The edge function will be deployed automatically
- No data loss, no frontend changes needed
- Your existing deployed build on hPanel will work immediately since it calls the same edge function

