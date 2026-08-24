# ---- Build stage: install deps and build the React frontend into /app/public ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install root dependencies (postinstall skipped — frontend build performed explicitly below)
COPY package.json ./
COPY package-lock.json ./
COPY arise-site/package.json arise-site/package.json
RUN npm ci --ignore-scripts --no-audit --no-fund

# Install frontend dev dependencies
COPY arise-site arise-site
RUN npm --prefix arise-site ci --ignore-scripts --no-audit --no-fund

# Build the React app (outDir is configured to ../public → /app/public)
RUN npm --prefix arise-site run build

# ---- Runtime stage: production Node image, non-root user ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# App source + built frontend
COPY server.js ./
COPY db ./db
COPY --from=builder /app/public ./public

# Non-root user
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app
RUN chown -R app:app /app
USER app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1

CMD ["node", "server.js"]