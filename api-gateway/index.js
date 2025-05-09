const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios");

// Create Express app
const app = express();
const PORT = 8080;
const HOST = "0.0.0.0"; // Bind to all network interfaces

// Service hostnames - hardcoded for Docker
const FRONTEND_HOST = "frontend";
const BACKEND_HOST = "backend";
const FRONTEND_PORT = 8081;
const BACKEND_PORT = 8082;
const FRONTEND_URL = `http://${FRONTEND_HOST}:${FRONTEND_PORT}`;
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

console.log(`API Gateway starting...`);
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Backend URL: ${BACKEND_URL}`);

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Gateway health endpoint
app.get("/api-gateway/health", (req, res) => {
  console.log("API Gateway health endpoint called");
  res.json({
    status: "good 1.0.3",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    config: {
      frontendUrl: FRONTEND_URL,
      backendUrl: BACKEND_URL,
    },
  });
});

// Combined health endpoint for all services
app.get("/health", async (req, res) => {
  console.log("Health endpoint called");

  // API Gateway health is always good if we're serving this request
  const apiGatewayHealth = {
    status: "good",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    config: {
      frontendUrl: FRONTEND_URL,
      backendUrl: BACKEND_URL,
    },
  };

  // Check frontend health
  let frontendHealth = {
    status: "unknown",
    service: "frontend",
    timestamp: new Date().toISOString(),
  };

  try {
    // Use axios.create with baseURL to ensure correct hostname resolution
    const frontendAxios = axios.create({
      baseURL: FRONTEND_URL,
      timeout: 5000,
    });

    console.log(`Checking frontend health at ${FRONTEND_URL}/health`);
    const frontendResponse = await frontendAxios.get("/health");
    frontendHealth = frontendResponse.data || frontendHealth;
    frontendHealth.status = frontendHealth.status || "good";
    console.log(`Frontend health: ${frontendHealth.status}`);
  } catch (error) {
    console.error(`Error checking frontend health: ${error.message}`);
    console.error(`Error details:`, error);
    frontendHealth.status = "down";
    frontendHealth.error = error.message;
  }

  // Check backend health
  let backendHealth = {
    status: "unknown",
    service: "backend",
    timestamp: new Date().toISOString(),
  };

  try {
    // Use axios.create with baseURL to ensure correct hostname resolution
    const backendAxios = axios.create({
      baseURL: BACKEND_URL,
      timeout: 5000,
    });

    console.log(`Checking backend health at ${BACKEND_URL}/health`);
    const backendResponse = await backendAxios.get("/health");
    backendHealth = backendResponse.data || backendHealth;
    backendHealth.status = backendHealth.status || "good";
    console.log(`Backend health: ${backendHealth.status}`);
  } catch (error) {
    console.error(`Error checking backend health: ${error.message}`);
    console.error(`Error details:`, error);
    backendHealth.status = "down";
    backendHealth.error = error.message;
  }

  // Return combined health status
  const healthResponse = {
    services: {
      apiGateway: apiGatewayHealth,
      frontend: frontendHealth,
      backend: backendHealth,
    },
    overall:
      frontendHealth.status === "good" && backendHealth.status === "good"
        ? "good"
        : "degraded",
    timestamp: new Date().toISOString(),
  };

  console.log(`Overall health: ${healthResponse.overall}`);
  res.json(healthResponse);
});

// Create proxy options with error handling
const createProxyOptions = (target, pathRewrite = null) => {
  return {
    target,
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite,
    onError: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.status(500).json({
        error: `Proxy error: ${err.message}`,
        target: target,
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `Proxying ${req.method} ${req.url} to ${target}${proxyReq.path}`
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Received response from ${target}: ${proxyRes.statusCode}`);
    },
  };
};

// Proxy middleware for backend routes (/api/*)
app.use(
  "/api",
  createProxyMiddleware(createProxyOptions(BACKEND_URL, { "^/api": "" }))
);

// Proxy middleware for frontend routes (all other routes)
app.use("/", createProxyMiddleware(createProxyOptions(FRONTEND_URL)));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Global error handler: ${err.message}`);
  res.status(500).json({
    error: `Server error: ${err.message}`,
  });
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`API Gateway running on http://${HOST}:${PORT}`);
  console.log(`Forwarding /api/* requests to backend at ${BACKEND_URL}`);
  console.log(`Forwarding all other requests to frontend at ${FRONTEND_URL}`);
});
