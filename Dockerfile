# syntax=docker/dockerfile:1

########## deps/build stage ##########
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (no lifecycle scripts so prisma doesn't run yet)
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --ignore-scripts
RUN cd client && npm ci --ignore-scripts

# Copy source (includes prisma/)
COPY . .

# Generate Prisma client BEFORE TypeScript build
RUN npx prisma generate

# Build client + server
RUN cd client && npm run build
RUN npm run build

########## runtime stage ##########
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Prod deps only (still no lifecycle scripts)
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts and prisma schema
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/prisma ./prisma

# (Optional) Re-generate in runner to match runtime env; safe to keep or remove
RUN npx prisma generate

EXPOSE 8080
CMD ["npm", "start"]