# LinkHub GitHub + Supabase v11.2

Fixes the public page link loading while keeping the centered admin login and v11 appearance system.

1. Run `supabase-v11.2-public-fix.sql` once in Supabase SQL Editor.
2. Replace your GitHub Pages files with this folder's website files.
3. Open `index.html` (or your GitHub Pages URL) and refresh.

The public loader now fetches links independently from profile settings and displays a useful error if Supabase rejects the request.
