# Stage 1: Frontend bauen
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

# Stage 2: PocketBase mit gebautem Frontend in pb_public
FROM ghcr.io/coollabsio/pocketbase:latest
COPY --from=builder /app/dist /app/pb_public
COPY start.sh /start.sh
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
