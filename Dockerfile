FROM node:22-bookworm-slim as builder

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

FROM node:22-bookworm-slim

ENV APP_PORT 3000
ENV APP_HOST 0.0.0.0
ENV APP_NAME "Buryad Dictionary"
ENV APP_TITLE "Бурятско-Русский словарь"
ENV APP_DESCRIPTION "Бурястко-Русский словарь"
ENV API_BASE_URL ""

RUN ENVS=$(printenv | sed 's/\(^[^=]*\)=\(.*\)/export \1="\2"/')

WORKDIR /app

COPY --from=builder /app  .

ENV HOST $APP_HOST
EXPOSE $APP_PORT

CMD $ENVS npm run start
