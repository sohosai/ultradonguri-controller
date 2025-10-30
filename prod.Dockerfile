FROM node:22-alpine AS builder

ENV VITE_API_MODE=real
ENV VITE_API_BASE_URL=/api
ENV VITE_WS_URL=/ws

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 5173
