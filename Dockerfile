# syntax=docker/dockerfile:1

########## build stage ##########
FROM node:20-alpine AS build
WORKDIR /app

# 1) Install deps WITHOUT lifecycle scripts (so prisma doesn't try to run yet)
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --ignore-scripts
RUN cd client && npm ci --ignore-scripts

# 2) Copy source (includes prisma/ and server/)
COPY . .

# 3) Generate Prisma BEFORE compiling TypeScript so @prisma/client types exist
RUN npx prisma generate

# 4) Build client + server
RUN cd client && npm run build
RUN npm run build

# Sanity: ensure server output exists (fail early if not)
RUN test -f dist/server/index.js || (echo 'dist/server/index.js missing' && ls -R dist && exit 1)

########## runtime stage ##########
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 5) Prod deps only, again WITHOUT scripts
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# 6) Bring over built artifacts + prisma schema
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/prisma ./prisma

# 7) (Optional) Generate prisma in runtime layer too
RUN npx prisma generate

EXPOSE 8080
CMD ["npm", "start"]