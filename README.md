# Sriram LinkHub — Supabase version

This version is wired to your Supabase project. The public site has no Admin button.

## One-time setup
1. Open Supabase Dashboard > your project > Authentication > Users > Add user.
2. Create your admin email/password. Do NOT put that password in these website files.
3. Copy the new user's UUID.
4. Open `supabase-setup.sql`, replace `YOUR_ADMIN_USER_UUID` with the UUID, then run the whole file in Supabase > SQL Editor.
5. Upload all files in this folder to your web host / GitHub Pages.
6. Public page: `/index.html` (or your root domain).
7. Private admin: `/admin.html` — bookmark this URL. It is not linked from the public page.

## Security
- `config.js` contains only your browser-safe Supabase URL and publishable key.
- Never put a secret key, service_role key, database password, or admin password in frontend files.
- Row Level Security policies in `supabase-setup.sql` restrict editing/analytics to the UUID you add to `admin_users`.

## Backgrounds
For this version, Appearance accepts a direct HTTPS image URL. This avoids putting large image files into database rows. The built-in cinematic background remains the fallback.

## Analytics
Public page views and link clicks are stored in Supabase. The admin dashboard reads the shared cloud counts, so the numbers are no longer tied to one browser.
