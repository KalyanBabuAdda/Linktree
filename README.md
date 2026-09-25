# LinkHub v11.4 — Appearance Cloud Save Fix

This fixes Appearance changes that updated the live preview but disappeared after refresh.

1. Run `supabase-v11.4-appearance-save-fix.sql` once in Supabase SQL Editor.
2. Replace the website files in GitHub with this version (the SQL file itself does not need to be uploaded to GitHub).
3. Open `admin.html`, sign in, change the display name, and wait until the status says **Saved to cloud**.
4. Refresh admin: the new name should remain.
5. Refresh the public GitHub Pages URL: it should show the same saved name.

Appearance is now upserted into `profile_settings` row `id=1` and Supabase is the source of truth.


## v11.5
Run `supabase-v11.5-appearance-controls.sql` once in Supabase SQL Editor before using the new Appearance controls. Do not upload SQL files to GitHub. New options: show/hide link logos, left/middle/right link text alignment, subtitle size/opacity, profile picture size. Background darkness now remains independent of theme, and themes style only link tabs.
