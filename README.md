# rosterbots.com

The RosterBots website: plain HTML and CSS, no framework, built by `node build.mjs` from
`src/` (one header, footer and head for every page) and served by GitHub Pages from this repo.

- Pages: home, pricing, the Odunze Incident, waitlist, MegaCast (coming soon), support,
  privacy, delete account, 404. `sitemap.xml` and `robots.txt` are generated.
- The waitlist forms post to the `waitlist` table in Supabase with the publishable key
  (`assets/waitlist.js`); the table takes inserts only.
- Recaps are published unlisted at /recaps/: no links, not in the sitemap, noindex, and robots.txt keeps crawlers off the MP3.

## Going live on www.rosterbots.com

At Porkbun, DNS for rosterbots.com: delete the parking A, ALIAS and CNAME records for the
root and `www` (keep the MX records: they forward support@rosterbots.com), then add:

| Type | Host | Answer |
|---|---|---|
| A | (root) | 185.199.108.153 |
| A | (root) | 185.199.109.153 |
| A | (root) | 185.199.110.153 |
| A | (root) | 185.199.111.153 |
| CNAME | www | rmanager-cpu.github.io |

Then add a `CNAME` file containing `www.rosterbots.com` (or set the custom domain in the
repo's Pages settings) and tick Enforce HTTPS once the certificate is issued.
