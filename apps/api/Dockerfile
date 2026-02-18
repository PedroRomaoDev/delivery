# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.20.0

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all workspace packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Production stage
FROM node:18-alpine AS production

# Install pnpm and curl for healthcheck
RUN npm install -g pnpm@10.20.0 && \
    apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy workspace packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install only production dependencies (skip scripts like husky prepare)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 8080

# Set NODE_ENV
ENV NODE_ENV=production

# Start application
CMD ["node", "api-server.js"]
