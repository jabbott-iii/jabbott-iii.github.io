# jabbott.dev

Engineering log, resume and deployment hub for Joseph Abbott III, served by GitHub Pages at
<https://jabbott.dev>. Every layout, style and script is hand-written; no theme is used.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Landing page: greeting, Resume / Log / Deployments / Market tiles, Projects and Archive columns |
| `log.html` | `/log/`, the engineering log: featured-post carousel, project filters, search, newest-first post grid |
| `_layouts/post.html` | Individual post page (same look as the log) |
| `resume.html` | `/resume/`, built from `_data/resume.yml` |
| `deployments.html` | `/deployments/`, every site deployed from a repository |
| `market.html` | `/market/`, every app released to the public on an app store, built from `_data/releases.yml` |
| `_includes/seo.html` | Title, description, canonical, Open Graph, Twitter and JSON-LD for every page |
| `_data/projects.yml` | Projects listed on the home page and referred to by posts and `llms.txt` |
| `_data/deployments.yml` | Deployed sites listed in the Deployments menu and page |
| `_data/releases.yml` | Production releases listed on the Market page and counted on its home page tile |
| `assets/css/style.css`, `assets/js/site.js` | All styling and behavior |
| `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` | Crawler and answer-engine files, generated from the data above |

## Writing a post

Add `_posts/YYYY-MM-DD-slug.md`:

```yaml
---
title: "Munus v4.0 Release"
date: 2026-11-02 09:00:00 -0700
categories: [intro]        # keeps URLs in the existing /intro/YYYY/MM/DD/ shape
project: munus             # a slug from _data/projects.yml; drives the filter chips and sidebar
kind: Release              # Release, Update, Demo, Contribution, Policy, Maintenance…
description: "One or two sentences. Used for the card, search results and AI summaries."
image: https://…           # optional; otherwise the first image in the post, else a generated plate
---
```

The layout is applied automatically. A leading `# Heading` in the post is shown as the post's
sub-headline, so the page keeps a single `<h1>`.

## Projects and the archive

The home page lists every project in `_data/projects.yml`, in file order, with its summary, status
and links to the repository and its log entries. To archive a project, set `status: Archived`: it
moves from the Projects column to the Archive column, and `llms.txt` lists it under
"Archived projects".

Links from before the log moved to `/log/` (`/?project=…` and `/?q=…`) are forwarded to `/log/`.

## Deployments button

The header's **Deployments** menu lists `_data/deployments.yml`. When it opens it also asks the
GitHub API for any of your non-fork repositories with Pages switched on and adds the ones missing
from the file, so a new deployment shows up before the file is updated. Add an entry to the file
to give a deployment a proper description, structured data and (for sites under `jabbott.dev`) a
sitemap entry.

## Market

The fourth home page tile opens `/market/`, which lists every app released to the public on an app
store. To add a release, add an entry to `_data/releases.yml`:

```yaml
- name: Denarii Dolor
  project: denarii-dolor   # a slug from _data/projects.yml; supplies the language and log link
  platform: Android
  store: Google Play
  store_url: https://play.google.com/store/apps/details?id=com.denariidolor
  price: US$0.99           # the store's US price; update it when the store price changes
  privacy: /denarii-dolor/privacy-policy/   # optional
  summary: "One or two sentences about what the app does."
```

The entry gets a card on `/market/`, a line in `llms.txt`, and structured data, and the tile's count
goes up by one.

## Resume

`_data/resume.yml` holds the resume, copied word for word from the signed-in view of the LinkedIn
profile. When LinkedIn changes, update the matching entries and the `synced` date. The
`clearance` field and the matching About line and skill appear on the public page and in
`llms.txt`; delete them there if the clearance should not be public.

## SEO and GEO

Every page gets a title, description, canonical URL on `jabbott.dev`, Open Graph and Twitter
cards, and one JSON-LD graph: `WebSite` and `Person` everywhere, plus `WebPage` with the project
list (home), `Blog` (`/log/`),
`BlogPosting` + `BreadcrumbList` (posts), `ProfilePage` (resume) and `CollectionPage` (deployments).
For generative engines, `robots.txt` explicitly allows the major AI crawlers, `llms.txt` gives a
plain-text summary with links to every page, project and deployment, and `llms-full.txt` carries
the full text of every post.

### Project sites and subdomains

Project sites GitHub Pages serves under this domain (`https://jabbott.dev/<Repo>/`) share this
site's `robots.txt` and `sitemap.xml`, so listing them in `_data/deployments.yml` is enough for
crawlers to find them. List a project site's other pages that readers may look for on their own,
such as Nadir's instructions, under its entry's `pages`: each gets a sitemap entry and a link in
`llms.txt`. Each project site's own pages still need their own head tags. Paste this
into the project site's `<head>` and fill in the placeholders:

```html
<link rel="canonical" href="https://jabbott.dev/Nadir/">
<meta name="description" content="One-sentence summary of the project.">
<meta name="author" content="Joseph Abbott III">
<link rel="author" href="https://jabbott.dev/resume/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Joseph Abbott III">
<meta property="og:title" content="Nadir">
<meta property="og:description" content="One-sentence summary of the project.">
<meta property="og:url" content="https://jabbott.dev/Nadir/">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Nadir",
  "url": "https://jabbott.dev/Nadir/",
  "description": "One-sentence summary of the project.",
  "isBasedOn": "https://github.com/jabbott-iii/Nadir",
  "isPartOf": { "@id": "https://jabbott.dev/#website" },
  "author": { "@id": "https://jabbott.dev/#person" }
}
</script>
```

A deployment on its own subdomain (for example `nadir.jabbott.dev`) is a separate host, so it
also needs its own `robots.txt` (copy this repo's and change the `Sitemap:` line), its own
`sitemap.xml`, and ideally its own `llms.txt` that links back to <https://jabbott.dev/llms.txt>.

### Cloudflare

`jabbott.dev` is proxied through Cloudflare. If the site gets stuck in a redirect loop, the usual
cause is the SSL/TLS mode being **Flexible** (Cloudflare asks GitHub over HTTP, GitHub redirects to
HTTPS, repeat); set it to **Full** and let GitHub Pages issue its certificate. Cloudflare's
"Block AI bots" / managed `robots.txt` settings override this repo's `robots.txt`, so leave them
off if answer engines should be able to cite the site.

## Running locally

```bash
bundle install
bundle exec jekyll serve
```
