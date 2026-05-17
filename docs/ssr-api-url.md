# SSR API URL — split server / public

## TL;DR

`runtimeConfig.public.baseURL` сейчас единственный API URL — используется и в SSR (Node на pod'е), и в браузере. Это **узкое место по производительности**.

Надо разделить на:
- `runtimeConfig.baseURL` — server-only, cluster-internal URL (`http://buryads-api-service.applications.svc.cluster.local`)
- `runtimeConfig.public.baseURL` — для браузера, external URL (`https://tt.buryads.com`)

## Почему

SSR fetch сейчас идёт по пути: `UI pod → DNS → Cloudflare edge → 65.109.16.49 (k8s ingress) → API pod`. Полный TLS handshake + два пересечения интернета на каждый внутренний вызов.

Замеры (per_page=4&rand=1):

| Путь | total | bytes |
|---|---:|---:|
| SSR pod → CF → ingress → API | 1014ms | 183KB |
| SSR pod → cluster ingress напрямую | 347ms | 183KB |
| SSR pod → API service ClusterIP (HTTP) | 286ms | 183KB |

Backend сам по себе ~285ms. CF roundtrip добавляет ~700ms на каждый SSR fetch.

Сейчас обход через runtime patch deployment'а:
- `hostAliases: tt.buryads.com → <ingress-nginx ClusterIP>` (получить через `kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.spec.clusterIP}'`)
- `NODE_TLS_REJECT_UNAUTHORIZED=0` (ingress отдаёт self-signed cert внутри cluster для hosts без TLS block)

Это работает, но грязно: TLS verify отключен в SSR, привязано к deployment-level конфигу k8s, не version-controlled внутри репы.

## Как разделить (proper fix)

### 1. `nuxt.config.ts`

```ts
runtimeConfig: {
  // server-only, не утечёт в браузер
  baseURL: process.env.API_BASE_URL_SERVER ?? process.env.API_BASE_URL,
  public: {
    // браузер видит это
    baseURL: process.env.API_BASE_URL,
  },
},
```

### 2. Repository factory

В `repository/factory.ts` (или где `HttpFactory.call`) выбирать URL по контексту:

```ts
const config = useRuntimeConfig();
const baseURL = import.meta.server ? config.baseURL : config.public.baseURL;
```

Все `useFetch` / `$fetch` через factory автоматом подхватят правильный URL.

### 3. K8s deployment

`buryads-ui-deployment.yaml`:

```yaml
env:
  - name: API_BASE_URL
    value: "https://tt.buryads.com"           # для клиента
  - name: API_BASE_URL_SERVER
    value: "http://buryads-api-service.applications.svc.cluster.local"  # для SSR
```

### 4. Снять временные обходы

После деплоя с разделением:
- удалить `hostAliases` из deployment
- удалить `NODE_TLS_REJECT_UNAUTHORIZED=0`

## Ожидаемый эффект

| Метрика | Сейчас (с обходами) | После split |
|---|---:|---:|
| SSR fetch к API | 347ms | ~290ms |
| User firstbyte avg | ~1.2s | ~0.9s |
| nginx p95 | 920ms | ~600ms |

Прирост от split поверх обходов: ещё -50ms на SSR + cleaner config.

Но если обходы снять (или их сметут при caching deployment'а из CI), без split всё откатится на 1.7s+.

## Backend ещё

Параллельная задача — Laravel API возвращает 47KB на пак (190KB на per_page=4). Eager-loaded `burWords` со всеми relations. Если сделать summary endpoint `{id, slug, name, description, image_url, word_count}` → ~2KB/pack → -100-200ms SSR + меньше HTML payload.
