const express = require("express");
const path = require("path");

// Create Express app
const app = express();
const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || "0.0.0.0"; // Bind to all network interfaces

const frontend_version = "${FRONTEND_VERSION}";

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: `good ${frontend_version}`,
    service: "frontend",
    timestamp: new Date().toISOString(),
  });
});

// Serve index.html for all routes to support SPA
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Frontend server running on http://${HOST}:${PORT}`);
  console.log(`Health endpoint: http://${HOST}:${PORT}/health`);
});
