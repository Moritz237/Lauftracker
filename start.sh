#!/bin/sh
# Create first admin if env vars provided (only works when no admin exists yet)
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  /app/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" --dir=/app/pb_data 2>/dev/null || true
fi
exec /app/pocketbase serve --http=0.0.0.0:8080 --dir=/app/pb_data
