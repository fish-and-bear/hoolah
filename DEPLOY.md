# Deploying hoolah

hoolah is a static site. The `pnpm build` command emits an `out/` directory that can be served from any static host. The production target is Cloudflare Pages.

## TL;DR

```bash
pnpm install
pnpm build
# out/ is what gets uploaded.
```

Cloudflare Pages auto-deploys both branches:

| Branch    | Environment | URL                              |
| --------- | ----------- | -------------------------------- |
| `main`    | production  | `hoolah.hapinas.net`             |
| `develop` | preview     | `dev.hoolah.hapinas.net` (when wired) |

Every other branch gets a unique preview URL of the form `<branch-hash>.hoolah.pages.dev`.

## First-time Cloudflare Pages setup

These steps run once. Re-running them is harmless but unnecessary.

### 1. Create the Pages project

In the Cloudflare dashboard, **Pages → Create a project → Connect to Git**.

- Repository: `fish-and-bear/hoolah`
- Production branch: `main`
- Project name: `hoolah` (this becomes the `hoolah.pages.dev` subdomain)

Build settings:

| Setting             | Value                |
| ------------------- | -------------------- |
| Framework preset    | Next.js (Static HTML Export) |
| Build command       | `pnpm install && pnpm build` |
| Build output dir    | `out`                |
| Root directory      | (leave blank)        |
| Node version        | `20`                 |
| Package manager     | `pnpm`               |

There are no environment variables to set. The game does not call any external API.

### 2. Bind the custom domain

In the Pages project, **Custom domains → Set up a custom domain → `hoolah.hapinas.net`**.

`hapinas.net` already has its nameservers pointing to Cloudflare, so Pages will offer to create the CNAME automatically. Accept it.

If the automatic CNAME does not get created, add it manually in the `hapinas.net` zone:

```
Type:   CNAME
Name:   hoolah
Target: hoolah.pages.dev
Proxy:  Proxied (orange cloud)
TTL:    Auto
```

### 3. (Optional) Bind a preview subdomain

To point a stable hostname at the latest `develop` build, add a second custom domain inside the Pages project: `dev.hoolah.hapinas.net`. Cloudflare lets you alias custom domains to a specific branch.

## Ongoing deploys

Push to `main` deploys production. Push to `develop` deploys the preview. Every other branch gets an automatic preview at `<hash>.hoolah.pages.dev`.

No manual steps are needed after the project is wired up.

## Local production check

```bash
pnpm build && pnpm exec serve out
```

Visit `http://localhost:3000` and confirm:

- The title screen shows today's date and a `hoolah ###` number
- Tapping play loads the keyboard and an empty board
- Typing five letters and pressing enter flips the tiles
- A reload preserves your in-progress guesses
- `/about`, `/rules`, `/archive`, and a deliberately broken path (`/zzz`) all render with the brand chrome
- DevTools, Application, Manifest shows `hoolah` with the oxblood theme colour
- DevTools, Application, Service Workers shows `sw.js` registered (only in production, not on `localhost`)
- DevTools, Lighthouse, PWA / Performance / Accessibility / SEO all clear 95+

## If a deploy fails

Most build failures will come from one of:

- A new word added to `answers.json` that fails `scripts/validate-wordlists.mjs`. Run the script locally first.
- A new content page that introduces a non-static export route. Static export only supports prerendered pages.
- An accidentally pushed `.next/` or `out/` directory. Both are gitignored; if they show up in a PR diff, revert them.

For Cloudflare-side issues (DNS, custom domain, build minutes), the Pages 'Builds' tab shows the full build log and the Pages 'Deployments' tab shows what was actually shipped.
