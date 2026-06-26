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
CMD ["/bin/sh", "-c", "/app/pocketbase superuser upsert $PB_ADMIN_EMAIL $PB_ADMIN_PASSWORD --dir=/app/pb_data 2>/dev/null || true; exec /app/pocketbase serve --http=0.0.0.0:8080 --dir=/app/pb_data"]
