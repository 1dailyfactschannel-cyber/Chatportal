FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files from root context
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm ci

# Copy server source
COPY server/src ./src

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/package*.json ./

EXPOSE 3001

CMD ["node", "dist/index.js"]
