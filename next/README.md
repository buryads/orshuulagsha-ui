# orshuulagsha-next

Next.js 14 (App Router) frontend, intended successor of `orshuulagsha-ui/`.

- Staging domain: `https://next.buryads.com`
- Future production domain: `https://t.buryads.com` (currently served by the Nuxt app)
- Backend API: `https://tt.buryads.com`

## Dev

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
npm run build        # production build (emits .next/standalone)
npm run start        # serve production build
npm run lint
npm run typecheck
```

## Env vars

- `NEXT_PUBLIC_API_BASE_URL` -- backend API root (default `https://tt.buryads.com`)

`NEXT_PUBLIC_*` vars are baked into the client bundle at **build time**, so the
Dockerfile passes the value via `ARG`/`ENV` in the builder stage. The k8s
Deployment also sets it at runtime for any server-side reads.

## Stack

- Next.js 14 App Router, React 18, TypeScript strict
- Tailwind CSS, CSS-vars themed (`data-theme="light|dark"`), `next-themes`
- next-intl (locales: `ru` default, `bur`, `en`; cookie-based detection)
- axios client at `lib/api.ts` (`withCredentials: true`)
- Fonts: Manrope (primary), Plus Jakarta Sans, Fraunces, JetBrains Mono via `next/font/google`

## Docker

Multi-stage build: `node:20-alpine` `deps` -> `builder` -> tiny standalone `runner`.
Runs as non-root (`uid 1001`), exposes port 3000.

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://tt.buryads.com \
  -t buryads-ui-next .

docker run --rm -p 3000:3000 buryads-ui-next
```

`next.config.mjs` sets `output: 'standalone'` so the runner stage ships only
the trimmed server + static assets.

## Deployment

- Image: `acrossoffwest/buryads-ui-next` on Docker Hub.
- Cluster: Hetzner k8s, namespace `applications`.
- Manifest: `config/deployment.yml` (Deployment + ClusterIP Service +
  ExternalName proxy in `default` namespace).
- Ingress: managed in the `mysql-cluster` repo
  (`config/nginx-ingress/deployment.yml`); host `next.buryads.com` routes to
  `buryads-ui-next-service-proxy:80`.
- Workflow: tag-based (`X.Y.Z` semver) -> builds + pushes image -> applies
  manifest. The workflow template lives at
  `.github/workflows/k8s-deploy.yml.template` and must be moved into the
  dedicated GitHub repo for this app once it exists (this directory is part of
  the buryads-com monorepo and will not be picked up by Actions).

To cut a release once the GitHub repo is set up:

```bash
git tag 0.1.0
git push origin 0.1.0
```

## Layout

```
app/                 routes (App Router)
components/          shared UI (Header/Footer/Breadcrumb/ThemeProvider)
lib/api.ts           axios instance
lib/api/*.ts         typed API modules (words, translate, auth)
i18n/request.ts      next-intl request config (cookie + Accept-Language)
messages/{ru,bur,en}.json
config/deployment.yml         k8s manifest
.github/workflows/*.template  workflow template (move to real repo)
```
