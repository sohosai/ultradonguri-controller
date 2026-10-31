FROM node:22-alpine AS builder

ENV VITE_API_MODE=real

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/server ./server

RUN mkdir -p /app/videos

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
