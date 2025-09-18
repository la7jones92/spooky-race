# syntax=docker/dockerfile:1

########## deps/build stage ##########
FROM node:20-alpine AS build
WORKDIR /app

# Install server + client deps (NO scripts!)
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --ignore-scripts
RUN cd client && npm ci --ignore-scripts

# Copy source
COPY . .

# Build client + server
RUN cd client && npm run build
RUN npm run build

########## runtime stage ##########
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps (NO scripts!)
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built artifacts and prisma schema
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/prisma ./prisma

# Now that prisma/ exists, generate the client
RUN npx prisma generate

EXPOSE 8080
CMD ["npm", "start"]