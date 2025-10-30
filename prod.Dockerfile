FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine

COPY --from=builder /app/dist /srv

RUN echo $'{\n\
    auto_https off\n\
}\n\
\n\
:80 {\n\
    root * /srv\n\
    encode gzip\n\
    file_server\n\
    try_files {path} /index.html\n\
}' > /etc/caddy/Caddyfile

EXPOSE 80
