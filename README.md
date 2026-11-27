# ChaleCoco site
Run: open the folder in VS Code, install the "Live Server" extension, right-click index.html > Open with Live Server.
The full-screen story opens with a short intro animation. Scroll, swipe or use arrow keys to move through five scenes. On smaller screens, use the menu button to navigate; long panels can be scrolled within their scene. Social icons in the final scene are placeholders until account links are added.

## Backend (Google Sheets + Apps Script, free)
1. Create a Google Sheet. Rename the tab to `Products`. Row 1: id | name | desc | price | tone | active. Copy rows from products.json (active = TRUE).
2. Extensions > Apps Script. Paste apps-script/Code.gs.
3. Project Settings > Script properties > add `ADMIN_PW` with your password.
4. Deploy > New deployment > Web app. Execute as: Me. Access: Anyone. Copy the URL.
5. Paste the URL into `API` at the top of main.js. Open admin.html, paste the URL and password, then add, hide, reprice or delete products.
Edits to the Sheet itself also show on the site.

## Hosting
Netlify, Vercel, Cloudflare Pages or GitHub Pages (drag the folder). Change WHATSAPP in main.js if the number changes.
