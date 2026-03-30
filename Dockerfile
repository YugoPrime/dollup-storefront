FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=1536

# Build-time env vars must be set via Coolify
# Next.js build needs API access, so we build at runtime on first start
EXPOSE 8000

# Build and start script
COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e
echo "Building Next.js storefront..."
npm run build
echo "Starting storefront..."
npm start
EOF

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
