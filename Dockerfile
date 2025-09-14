# Multi-stage build: build Vite app, then serve with nginx
# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy client package files and install deps
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci

# Copy source
COPY client ./client

# Build
RUN cd client && npm run build

# ---- Run stage ----
FROM nginx:alpine AS run
# Serve on 8080 for Fly.io (matches [http_service].internal_port)
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf || true

# Replace default config with SPA-friendly config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/client/build /usr/share/nginx/html

# Healthcheck (optional)
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/ || exit 1

EXPOSE 8080
