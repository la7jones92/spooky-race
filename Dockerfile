# syntax=docker/dockerfile:1

########## deps stage (installs deps once) ##########
FROM node:20-alpine AS deps
WORKDIR /app
# Install root & client deps WITHOUT lifecycle scripts first
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --ignore-scripts
RUN cd client && npm ci --ignore-scripts

########## build stage (compile TS + client) ##########
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
# copy source
COPY . .
# generate prisma types before TS compile
RUN npx prisma generate
# build client + server TS
RUN npm run build

# (Optional sanity checks; adjust paths to match your layout)
RUN test -f dist/server/index.js
RUN test -f client/dist/index.html

########## pruner stage (prod deps only) ##########
FROM node:20-alpine AS pruner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

########## runtime stage ##########
FROM node:20-alpine AS runner
WORKDIR /app

# If you ever hit OpenSSL issues with Prisma on alpine, uncomment:
# RUN apk add --no-cache openssl

ENV NODE_ENV=production

# bring prod deps, built assets, and prisma schema
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

# Generate Prisma client in the final image so native bindings match
RUN npx prisma generate

EXPOSE 8080
CMD ["node", "dist/server/index.js"]