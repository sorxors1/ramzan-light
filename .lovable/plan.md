

## Ramadan Ended Overlay for Students

### What This Does
After **March 20, 2026 at midnight (12:00 AM)**, any student who opens the app will see a full-screen popup overlay (similar to the Disqualification overlay) with:

- A beautiful message: "Ramadan Kareem 2026 has ended" (in English and Urdu)
- A thank-you note for their good deeds
- A **Log Out** button as the only action
- Blurred background so the dashboard is slightly visible but not accessible
- **Admins are exempt** -- they can continue using the system normally

### No Data Loss / No Backend Changes
- Frontend-only change
- No database or backend modifications
- All existing data, stats, and points remain intact

### Deployment
1. Pull latest from GitHub
2. Run `npm run build`
3. Upload the `dist` folder to your hPanel

---

### Technical Details

#### New File: `src/components/RamadanEndedOverlay.tsx`
- Follows the exact same pattern as `DisqualificationOverlay.tsx`
- Checks if the current date is past March 20, 2026 (midnight)
- Only shows for authenticated non-admin users
- Renders a fixed full-screen overlay with `backdrop-blur-sm` and `bg-black/60`
- Displays a card with a moon/star icon, the farewell message in English and Urdu, and a Log Out button

**Condition logic:**
```text
if (!isAuthenticated) -> hide
if (adminLoading) -> hide
if (isAdmin) -> hide
if (current date <= March 20, 2026) -> hide
Otherwise -> show the overlay
```

#### Modified File: `src/App.tsx`
- Import and add `<RamadanEndedOverlay />` alongside the existing `<DisqualificationOverlay />`

