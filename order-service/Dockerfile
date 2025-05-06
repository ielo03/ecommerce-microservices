# Use Node.js 18 as the base image
FROM node:slim

# Set working directory
WORKDIR /app

# Install dependencies and wget for healthcheck
COPY package*.json ./
RUN npm install --only=production && \
    apt-get update && apt-get install -y wget && apt-get clean

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8082

# Expose the port the app runs on
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:8082/health || exit 1

# Start the application
CMD ["node", "src/index.mjs"]