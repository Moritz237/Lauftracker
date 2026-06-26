# Stage 1: Frontend bauen
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: PocketBase mit gebautem Frontend in pb_public
FROM ghcr.io/coollabsio/pocketbase:latest
COPY --from=builder /app/dist /app/pb_public
