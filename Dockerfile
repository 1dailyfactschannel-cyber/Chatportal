# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all files first
COPY . .

# Install dependencies and build
RUN npm ci && npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
