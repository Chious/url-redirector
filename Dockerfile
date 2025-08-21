# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL (required for Prisma on Alpine)
RUN apk add --no-cache openssl

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema (needed for prisma generate)
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# Production stage
FROM node:20-alpine AS production

# Install OpenSSL (required for Prisma on Alpine)
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund

# Generate Prisma client
RUN npx prisma generate

# Copy built application from builder stage (includes views and public)
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

ARG PORT=3000
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node dist/utils/health-check.js

# Start the application
CMD ["npm", "start"]
