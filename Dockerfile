# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

# Install server + client deps
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci

# Copy source
COPY . .

# Build client + server
RUN cd client && npm run build
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./

# Copy dist + prisma + client build
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/prisma ./prisma

RUN npm ci --omit=dev

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8080
CMD ["npm", "start"]