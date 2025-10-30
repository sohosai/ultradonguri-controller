FROM node:22-alpine AS builder

ENV VITE_API_MODE=real
ENV VITE_API_BASE_URL=http://localhost:8080
ENV VITE_WS_URL=ws://localhost:8080/ws

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
