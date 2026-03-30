FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build args for Next.js build-time env
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_BASE_URL
ARG REVALIDATE_WINDOW

ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV REVALIDATE_WINDOW=$REVALIDATE_WINDOW
ENV NODE_OPTIONS=--max-old-space-size=1536

# Build
RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
