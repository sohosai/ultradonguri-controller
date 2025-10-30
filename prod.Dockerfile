FROM node:22-alpine AS builder

ENV VITE_API_MODE=prod
ENV VITE_API_BASE_URL=http://server:8080
ENV VITE_WS_URL=ws://server:8080/ws

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
:5137 {\n\
    root * /srv\n\
    encode gzip\n\
    file_server\n\
    try_files {path} /index.html\n\
}' > /etc/caddy/Caddyfile

EXPOSE 5137
