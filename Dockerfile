# Use official Node.js runtime as base image
FROM node:18-alpine

# Install OpenSSL (required for Prisma on Alpine)
RUN apk add --no-cache openssl

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy Prisma schema (needed for prisma generate)
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

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
