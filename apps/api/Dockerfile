FROM node:20-alpine AS builder

RUN apk update && apk upgrade --no-cache

RUN npm install -g pnpm@10.20.0

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS production

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

RUN npm install -g pnpm@10.20.0

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

RUN chown -R nodejs:nodejs /app

USER nodejs

WORKDIR /app/apps/api

EXPOSE 8080

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1

CMD ["node", "api-server.js"]
