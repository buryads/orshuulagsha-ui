FROM node:14.17.4-buster as builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM node:14.17.4-buster

ENV APP_PORT 3000
ENV APP_HOST 0.0.0.0
ENV APP_NAME "Buryad Dictionary"
ENV APP_TITLE "Бурятско-Русский словарь"
ENV APP_DESCRIPTION "Бурястко-Русский словарь"
ENV DEFAULT_LOCALE "ru"
ENV API_BASE_URL ""

RUN ENVS=$(printenv | sed 's/\(^[^=]*\)=\(.*\)/export \1="\2"/')

WORKDIR /app

COPY --from=builder /app  .

ENV HOST $APP_HOST
EXPOSE $APP_PORT

CMD $ENVS npm run start
