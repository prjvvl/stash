# Trestle

A GitHub Pages site-building kit. Clone it, edit one config file, push — you
get a live, custom-domain, SEO-ready site with a consistent design system and
Markdown-based content, without spending a day wiring up the deploy pipeline,
domain, and SEO basics yourself.

Built on [Astro](https://astro.build) with React islands and Tailwind CSS v4.

## Quickstart

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

1. Edit `src/site.config.ts` — name, description, domain, social links,
   navigation.
2. Edit brand colors and fonts in `src/styles/global.css` (the `@theme`
   block).
3. Add content as Markdown files in `src/content/posts/`.
4. Push to `main` — GitHub Actions builds and deploys to GitHub Pages
   automatically (see [Deploying](#deploying)).

## What's included

- **Deploy** — a GitHub Actions workflow (`.github/workflows/deploy.yml`)
  wired to `actions/deploy-pages`. No manual setup beyond enabling Pages on
  the repo (see below).
- **Custom domains** — set `domain` in `site.config.ts` and the `CNAME` file
  is generated automatically on every build, so it doesn't get lost on a
  rebuild.
- **Content** — Markdown + YAML frontmatter via Astro's Content Layer API,
  schema-validated so a malformed post fails the build with a clear error
  instead of shipping a broken page.
- **SEO baseline** — per-page meta tags, Open Graph tags, and an auto-
  generated sitemap.
- **Component set** — Nav (responsive, collapses to a mobile menu), Footer,
  Hero, Card, Button — all styled from shared design tokens, all responsive
  by default.
- **CI** — every PR runs a type-check and a full build before merge.

Not included yet, but planned as self-contained additions: search,
comments, a working contact form, and PR preview deploys.

## Deploying

1. Push this repo to GitHub.
2. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.
3. Push to `main` — the `deploy.yml` workflow builds and publishes the site.
4. If using a custom domain, set it in `src/site.config.ts` (`domain` field)
   before pushing, and point your DNS at GitHub Pages per
   [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Project structure

```
src/
  components/     Nav, Footer, Hero, Card, Button — reusable UI
  content/posts/  Blog posts (Markdown + frontmatter)
  content.config.ts  Content schema (Zod)
  layouts/        BaseLayout.astro — page shell, SEO meta
  pages/          File-based routes
  site.config.ts  Site metadata, nav, feature flags
  styles/         global.css — Tailwind v4 + design tokens
```

## For AI coding agents

See `AGENTS.md` — it documents where content and config live, and the rules
this project follows (design tokens instead of hardcoded values, schema-first
content, etc.) so an agent working on a site built with Trestle doesn't have
to guess.

## License

MIT — see `LICENSE`.
