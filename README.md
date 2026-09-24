# LinkHub v11 — GitHub Pages + Supabase

1. In Supabase > SQL Editor, run `supabase-v11-upgrade.sql` once.
2. Upload all files in this folder to your GitHub repository.
3. In GitHub Settings > Pages, publish from the branch/folder containing `index.html`.
4. Public bio page: `index.html` / your GitHub Pages root URL.
5. Admin: `admin.html`.

Normal changes made in Admin (links, visibility, theme, colors, background, logo, profile text) are stored in Supabase. You do NOT need to push GitHub again for those changes. GitHub only needs a new upload when the website code itself changes.

The Appearance screen auto-saves after a short delay and includes a live preview. Background/logo uploads are stored in the public `linkhub-assets` Supabase Storage bucket. Public preview visits do not count as page views.
