FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=1536

EXPOSE 8000

# Entrypoint builds at runtime so it can reach the backend via Docker network
COPY <<'ENTRY' /app/entrypoint.sh
#!/bin/sh
set -e

# Use internal Docker URL for server-side build fetches
export MEDUSA_BACKEND_URL="${MEDUSA_BACKEND_URL:-http://localhost:9000}"
echo "Building with backend: $MEDUSA_BACKEND_URL"

npm run build

echo "Starting storefront..."
exec npm start
ENTRY

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
