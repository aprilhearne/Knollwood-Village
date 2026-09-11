# Knollwood Village Civic Club — Website Rebuild Plan

Rebuild of knollwoodvillage.org (currently WordPress) as a fast, static, GitHub-managed site
with two new features: an interactive neighborhood map and a per-year dues-status map.

This document is the working reference for the project. Update it as decisions change.

---

## Status (September 11, 2026)

Phase 1 through 4 are built and live on the GitHub Pages preview. WordPress is untouched.

| Done | Notes |
|---|---|
| Astro site, all public WordPress content migrated | 12 content pages, 15 news posts, 58 newsletters, deed restrictions, ACC forms, policies, minutes |
| Redirects from every old URL | `public/_redirects` (Cloudflare) and `src/data/page-redirects.json` (any host) |
| Interactive neighborhood map | HCAD parcel polygons, 11 deed sections, address search, parks, trail, signs |
| Dues participation map | 2024, 2025, 2026 from the treasurer's master workbook; status only, no names or amounts |
| New resident guide, documents library, events on the home page | |
| GitHub Pages preview deploy | https://aprilhearne.github.io/Knollwood-Village/ |

Decisions made during the build: Leaflet with free CARTO and Esri tiles (no Google billing account); dues map is public and shows paid vs. not-recorded, matching the paid-homes list the club already publishes in the newsletter; PayPal and Mailchimp embeds reused as-is.

## Cutover checklist

1. Review the preview and send edits.
2. Create a free Cloudflare account, add the `knollwoodvillage.org` zone (Cloudflare will import the existing DNS records), and update the nameservers at the registrar. This alone changes nothing visible.
3. In Cloudflare, create a Pages project connected to this GitHub repo: build command `npm run build`, output `dist`, Node 22. Confirm the `*.pages.dev` preview works.
4. Add the custom domain `knollwoodvillage.org` (and `www`) to the Pages project. Cloudflare sets the DNS and SSL.
5. Keep the WordPress host running for 30 to 60 days as a backup, then cancel it. Export the Mailchimp form and PayPal button IDs are already in `src/data/site.json`.
6. Optional: turn on Cloudflare Web Analytics (free, no cookies) and paste the snippet into `src/layouts/Base.astro`.

Alternative: GitHub Pages can host the final site too (custom domain + HTTPS supported). Set `BASE_PATH=/` in the workflow and add a `CNAME` file. The `_redirects` file would not apply; the page redirects still work.

## Open items

- 2023 newsletters were never published online and none were found locally.
- Entrance sign locations on the map are approximate; send corrected pins.
- Board meeting minutes since 2020 and the annual financial summary could be added to the Documents page once the board approves posting them.
- ACC request forms are still email-based. A web form with file upload (Formspree or Cloudflare Pages Functions) is a small follow-up if wanted.
- Vice President seat shows as open on the Contact page.

## 1. Recommended approach (summary)

| Decision | Recommendation | Why |
|---|---|---|
| Site framework | **Astro** (static site, content in Markdown) | Fast, secure (no plugins to patch), free hosting, easy for Claude to edit via GitHub. |
| Hosting | **Cloudflare Pages** (Netlify is the fallback) | Free tier, auto-deploys from GitHub, preview URL for every branch, free DNS and SSL. Cloudflare Access gives a free board-only login for the dues map. |
| Base map | **Leaflet + free OpenStreetMap/CARTO tiles**; Google Maps only if you want the Google look | No API key, no billing account, no monthly cap. Google Maps JS now needs a Google Cloud billing account even for its 10k free loads/month. |
| Parcel outlines | **Harris Central Appraisal District (HCAD) GIS parcel shapefiles**, filtered to Knollwood Village Sections 1–10 + Braes Terrace II, stored as GeoJSON in the repo | Free, public, quarterly-updated, accurate lot polygons keyed by HCAD account number. |
| Dues data | Treasurer keeps a **Google Sheet** (one row per property per year); site reads a published CSV of it | No new tool for the treasurer; one source of truth; no resident data in git. |
| Dues map visibility | **Board-only** by default (Cloudflare Access email login) with a public aggregate view | Publicly labeling homes as "unpaid" is a privacy and neighbor-relations risk. See §5. |
| Payments | Keep existing PayPal/credit-card and Zelle flows | Already working; no reason to change during the rebuild. |
| Forms (ACC request, contact, vacation watch) | Cloudflare Pages Functions or a form service (Formspree / Tally) | Static sites cannot process forms alone. |
| Email newsletter | Mailchimp signup embed (optional) | The Mailchimp connector in Claude can manage it once authorized. |

---

## 2. How we work together (GitHub workflow)

1. You describe a change in Claude (text edit, new post, new newsletter PDF, board roster change).
2. Claude commits to a branch and pushes to GitHub.
3. Cloudflare Pages builds a **preview URL** for that branch automatically. You look at it.
4. You say "ship it" (or merge the PR yourself). Merging to `main` deploys to knollwoodvillage.org within about a minute.
5. Rollback is `git revert`; the whole site history is in git.

Until DNS is switched, the WordPress site stays live and untouched. The new site lives at a
`*.pages.dev` preview address. Cutover is a single DNS change and is reversible.

Nothing in this plan requires you to learn git. Routine edits (a newsletter, a meeting notice,
a dues amount) are one message to Claude.

---

## 3. Content inventory (from the current site)

Pages and posts confirmed on knollwoodvillage.org. Exact copy will be pulled from the WordPress export (see §7).

| Current URL | Content | New site |
|---|---|---|
| `/` | Home: "A great inner loop Houston neighborhood", 70+ years, KVCC enforces deed restrictions, funds security patrol, maintains medians, welcomes new residents, liaisons with officials | Home with clear calls to action: Pay Dues, Security, ACC Request, Newsletter |
| `/about/` | About / history (1950s, former Houston Main Street Airport) | About + History page |
| `/contribute/` | Neighborhood dues; 2023 dues $290 (club $55 + security $235); PayPal/credit card, Zelle to treasurer@, check | Pay Dues page; dues amount pulled from one config value so it updates in one place |
| `/security/` | SEAL Security patrol; dispatch (713) 561-5757; vacation watch (call, online form, or email vacationwatch@sealsecurity.com); security@knollwoodvillage.org; 60%+ of budget | Security page |
| `/deeds/` | Deed restrictions by section: Sections 1–10 and Braes Terrace II (PDF links); Email ACC | Deed Restrictions page, section picker, tied to the map (click your lot → your section's PDF) |
| `/acc-faqs/` | Architectural Control Committee FAQ; build@knollwoodvillage.org | ACC page |
| `/new-construction-addition-acc-request/` | ACC request form | ACC request form (form service) |
| `/newsletters/` | "Knollwood Village Voice" quarterly PDFs back to 2010, delivered to 624 homes | Newsletter archive, auto-generated from PDFs in the repo, newest first |
| `/category/meetings/` | Meeting posts: Annual Resident Meeting, payment methods | News/Announcements (blog) |
| `/2023/10/04/knollwood-village-2023-annual-dues/` | Annual dues post | News post; redirect old URL |
| `/advertise/` | Newsletter advertising specs; advertise@knollwoodvillage.org | Advertise page |
| `/contact-us/` | Officers: President April Hearne, VP Paige Willingham, Treasurer Michelle Jarrell, Secretary Laura Ferro. ACC: Chair Joe Powers; David Roder, Brent Nyquist, Bev Blackwood, Reed Hablinski, Parul Vyas. Phone (713) 207-2222 | Contact + Board page |
| `/button-test/` | Test page | Drop |

Old URLs will get redirects so bookmarks, Google results, and newsletter links keep working.

**Images:** the WordPress export includes the media library. We will reuse what is good and
replace low-resolution or dated photos. Suggested new photos: medians/entrance signs, a few
representative ranch homes, Brays Bayou / Willow Waterhole greenway, National Night Out or
other events. Phone photos are fine.

---

## 4. Interactive neighborhood map

**What it shows**
- Neighborhood boundary and the 11 deed-restriction sections (1–10 + Braes Terrace II), color-coded.
- Every lot outline (from HCAD). Click a lot → address, section, link to that section's deed restrictions.
- Points of interest: entrances/signage, medians the club maintains, nearest parks and trails, schools, trash/recycling info, SEAL patrol contact.
- Address search: "which section am I in?"
- Optional layers: street sweeping/trash days, block captains, storm drains, etc.

**How it is built**
1. Download HCAD parcel and subdivision shapefiles (free, public).
2. Filter to the Knollwood Village / Braes Terrace II subdivisions; convert to GeoJSON; strip to
   the fields we need (account number, address, section). Roughly 624 polygons, a small file.
3. Render with Leaflet on free tiles. No API keys, no usage caps, no billing.
4. Section boundaries and POIs are a hand-maintained GeoJSON file in the repo; Claude edits it on request.

**Google Maps option:** if you prefer Google's basemap/Street View, the same GeoJSON works in the
Maps JavaScript API. It requires creating a Google Cloud billing account (card on file) even
though the site's traffic will stay well inside the free 10,000 loads/month. Leaflet avoids that
entirely, so it is the default unless you want Google specifically.

---

## 5. Dues-status map

**What it shows:** the same lot outlines colored by dues status for a selected year
(paid / partial / unpaid / not applicable), with a year selector, totals, and percent paid per section.

**Data flow**
1. Treasurer maintains a Google Sheet: `Year | HCAD account (or address) | Paid (Y/N) | Date | Amount | Method | Notes`.
   The sheet can be pre-filled with every address from the parcel data so the treasurer only ticks boxes.
2. The sheet is "published to the web" as CSV (a private, unguessable link).
3. The map page loads that CSV at view time (or a nightly build copies it in), joins on account number, colors the lots.
4. No resident payment data is ever committed to git.

**Visibility (needs your decision)**
- **Recommended:** the per-house map is **board/treasurer-only**, behind Cloudflare Access
  (free for up to 50 users; login by emailed one-time code, no passwords to manage). The public
  site shows aggregate participation only ("68% of homes have paid for 2026", by section).
- **Alternative:** fully public per-house map. Some civic clubs do this as gentle social pressure,
  but it publishes a household's financial relationship with the club, tends to generate
  complaints, and can cut against the "welcoming" tone of the site. If the board wants it public,
  it should be a deliberate board vote, and the page should carry a short explanation.

Either way, the board-only version also becomes a useful treasurer tool: click a house, see its
payment history across years, and export the unpaid list for reminder mailings.

---

## 6. Best-practice review and suggested improvements

Based on the current site and current guidance for HOA / civic association websites:

**Keep (already good)**
- Online dues payment with several methods.
- Newsletter archive back to 2010.
- Deed restrictions by section and an ACC process.
- Security patrol page with vacation-watch instructions.

**Fix / add (high value, low effort)**
1. **Mobile-first, fast, HTTPS.** Static hosting handles this by default; the current WordPress theme is not mobile-optimized.
2. **Prominent "Pay Dues" button** on every page, with the current year's amount and what it funds (the 60% security figure is persuasive; show it).
3. **New Resident Guide** page: trash/recycling days, bulk pickup, ACC basics, patrol number, how to pay, Nextdoor, nearby parks. This is the page realtors and buyers look for.
4. **Board and Committees page** with roles, contact aliases (president@, treasurer@, build@, security@, advertise@), and how to volunteer.
5. **Document library:** bylaws, deed restrictions, meeting minutes, annual budget/financial summary, Form 990 link. Transparency is the single most-cited trust factor for associations, and the club is a 501(c)(4) whose filings are already public.
6. **Events / calendar:** annual meeting, National Night Out, garage sale, yard-of-the-month, board meetings. A Google Calendar embed is enough and the board can edit it without touching the site.
7. **Announcements feed + email signup:** post once, and residents who opt in get an email (Mailchimp). Cross-post to Nextdoor.
8. **ACC request as a real online form** with file upload for plans, sent to build@; auto-confirmation to the applicant.
9. **Vacation watch and "report an issue" quick links** on the Security page (drainage, streetlights, potholes via Houston 311).
10. **Search** across pages and newsletter PDFs.
11. **Accessibility:** proper headings, alt text, contrast, keyboard navigation. Also helps search ranking.
12. **Privacy:** no resident directory or personal emails on the public site; board contact via role aliases; dues data board-only (see §5).
13. **Analytics:** privacy-friendly analytics (Cloudflare Web Analytics, free, no cookies) so the board can see what residents actually use.
14. **Advertiser/sponsor page** stays; consider a "Local business sponsors" strip on the home page as a revenue line.
15. **Domain hygiene:** own the DNS in Cloudflare, enable DNSSEC, set up SPF/DKIM for the @knollwoodvillage.org role emails so reminders do not land in spam.

**Nice-to-have later**
- Resident-submitted events / garage sales with board moderation.
- Block-captain map layer.
- Bilingual (English/Spanish) versions of key pages.

---

## 7. What is needed from you to start

1. **WordPress export.** In wp-admin: Tools → Export → "All content" → download the XML. Also copy
   `wp-content/uploads/` (the newsletter PDFs and images), or at least the years you want to keep.
   Share via Google Drive (Claude has Drive access) or add them to this repo.
2. **Hosting account.** Create a free Cloudflare account (or tell me you prefer Netlify). Connect it
   to this GitHub repo when I say the scaffold is ready. Do not move DNS yet.
3. **Decisions:**
   - Leaflet (free, default) vs Google Maps (needs a Google Cloud billing account).
   - Dues map: board-only (recommended) vs public.
   - Who maintains the dues sheet (treasurer) and who else should have board-only access.
4. **Network access for this Claude environment.** This session's proxy blocks
   knollwoodvillage.org and the HCAD GIS servers, so I could not fetch the live site or parcel data
   directly. Either allow those domains in the environment's network policy
   (Claude Code on the web → environment settings), or download the HCAD parcel shapefile yourself
   and drop it in Drive. The WordPress export in step 1 covers the site content either way.
5. **Mailchimp (optional):** authorize the Mailchimp connector in claude.ai settings if you want email signups managed from here.

---

## 8. Phased delivery

| Phase | Deliverable | Depends on |
|---|---|---|
| 0 | This plan; decisions in §7 | You |
| 1 | Astro scaffold, design system, all current pages migrated, newsletter archive, redirects, preview URL live | WP export |
| 2 | Interactive neighborhood map (sections, lots, POIs, address search) | HCAD parcel data |
| 3 | Dues-status map, treasurer's Google Sheet template, board-only login | Phase 2, visibility decision |
| 4 | Best-practice additions (§6): new resident guide, documents, calendar, email signup, forms, analytics | Phase 1 |
| 5 | Final review, DNS cutover, keep WordPress as read-only backup for 60 days, then retire | Board sign-off |

Phases 1 and 2 can run in parallel. Each phase ends with a preview link for you to review.
