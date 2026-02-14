

# Multi-Account Instant Switching

## Overview
When a user logs in, their session (including auth tokens) will be saved to the device. From the Profile page, they can instantly switch to any other saved account without re-entering a password. Accounts stay saved until explicitly removed.

## How It Works for You

1. **User A logs in** -- their session is remembered on the device
2. **User A signs out** -- session stays saved on device, but user is logged out
3. **User B logs in** -- their session is also saved
4. **User B goes to Profile** -- sees User A listed under "Switch Account"
5. **User B taps "Switch" on User A** -- instantly switches to User A (no password needed)
6. **Remove button** -- forgets that account from the device; next time they'll need username + password
7. **Sign Out button** -- logs out of current account but keeps it saved for quick switching later

## Technical Details

### New File: `src/hooks/useSavedAccounts.ts`
A hook that manages saved account sessions in localStorage (key: `kyc_saved_sessions`).

Each saved account stores:
- `userId` -- unique identifier
- `username` -- display name for the switch list
- `accessToken` -- for instant session restore
- `refreshToken` -- for instant session restore

Methods:
- `saveAccount(username, userId, accessToken, refreshToken)` -- save/update an account
- `removeAccount(userId)` -- permanently remove a saved account
- `getSavedAccounts()` -- get all saved accounts
- `getOtherAccounts(currentUserId)` -- get accounts excluding the current one

### Modified: `src/pages/SignIn.tsx`
After successful login:
- Fetch the user's username from the `profiles` table
- Save the account session (username, userId, tokens) to localStorage via `useSavedAccounts`

### Modified: `src/hooks/useAuth.ts`
- Add a `switchToAccount(accessToken, refreshToken)` method that calls `supabase.auth.setSession()` to instantly restore a saved session
- Existing `signOut` remains unchanged

### Modified: `src/pages/Profile.tsx`
Add a "Switch Account" section between Quick Links and Sign Out:
- Lists all other saved accounts on this device (showing username)
- Each account has a **"Switch"** button that instantly switches via `setSession`
- Each account has a small **"Remove"** (X) button to forget it from the device
- The existing **"Sign Out"** button remains at the bottom

### Flow Diagram

```text
Login Success
    |
    v
Save session tokens + username to localStorage
    |
    v
Profile Page
    |
    +-- [Switch Account Section]
    |       |
    |       +-- Account A  [Switch] [X Remove]
    |       +-- Account B  [Switch] [X Remove]
    |
    +-- [Sign Out] -- logs out, keeps account saved
```

### Security Note
Session tokens are stored in localStorage (same as the current single-session approach). Removing an account clears its tokens. The refresh token has a limited lifetime, so very old saved sessions will naturally expire and require a fresh login.

