# Use Node.js as the base image with ARM64 architecture
FROM --platform=linux/arm64 node:slim

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
ENV PORT=8081
ENV HOST=0.0.0.0
# Ensure logs are not buffered
ENV NODE_OPTIONS="--no-warnings"
ENV NPM_CONFIG_LOGLEVEL="info"

# Expose the port the app runs on
EXPOSE 8081

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:8081/health || exit 1

# Start the application with unbuffered output
CMD ["node", "server.js"]