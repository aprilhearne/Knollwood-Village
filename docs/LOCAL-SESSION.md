# Phase 1 kickoff: local Claude Code session

The cloud Claude environment cannot reach knollwoodvillage.org or the HCAD GIS servers
(network policy returns 403). Everything that needs the live site or parcel data therefore runs
in a **local** Claude Code session on your Mac. After Phase 1 the site source lives in this repo,
so routine updates can be made from claude.ai (cloud) or locally, whichever is handier.

## One-time setup on your Mac

1. Install Claude Code if you have not: https://code.claude.com/docs/en/quickstart
   (Node 18+ required; `npm install -g @anthropic-ai/claude-code`).
2. Clone this repo and switch to the working branch:
   ```bash
   git clone https://github.com/aprilhearne/Knollwood-Village.git
   cd Knollwood-Village
   git checkout claude/admiring-thompson-q8s6hz
   claude
   ```
   Or click "Start locally" on the suggested task card in the Claude desktop app, which does the same thing.
3. Have wp-admin for knollwoodvillage.org open in Chrome. With the Claude in Chrome extension
   installed, the local session can drive that tab to run Tools → Export and to read pages and
   the media library, so you never have to hand over a password. If you have an existing list of
   addresses or HCAD account numbers for the 624 homes, keep it handy (optional; parcel data can
   be pulled from HCAD).

## What the local session will do (Phase 1 + 2 scaffold)

1. **Capture the current site.** Crawl knollwoodvillage.org (canonical; .com should redirect to it if it resolves),
   save every page's text, the menu structure, and the media library (newsletter PDFs, images)
   into `content/` and `public/`. Preferred source: the WordPress export XML
   (wp-admin → Tools → Export → All content) plus a copy of `wp-content/uploads/`.
2. **Scaffold the Astro site** with the pages in `docs/PLAN.md` §3, a mobile-first design,
   a single config file for the dues amount and board roster, redirects for the old URLs, and the
   newsletter archive generated from the PDFs.
3. **Fetch HCAD parcel data** for Knollwood Village Sections 1–10 and Braes Terrace II, convert to
   trimmed GeoJSON, and add a first version of the interactive map (Leaflet) at `/map`.
4. **Run it locally** (`npm run dev`) so you can review at http://localhost:4321, then commit and push.
5. **Connect hosting.** Create the free Cloudflare Pages project pointed at this repo; the preview
   URL appears within minutes. DNS is not touched until you approve cutover.

## Decisions still open (answer in the local session or here)

- Confirm whether knollwoodvillage.com is also owned; if so it redirects to .org.
- Map basemap: Leaflet with free tiles (default) or Google Maps (needs a Google Cloud billing account).
- Dues map visibility: board-only (recommended) or public per-house.
- Who maintains the dues Google Sheet.
