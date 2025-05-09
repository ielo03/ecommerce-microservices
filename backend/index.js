const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

// Create Express app
const app = express();
const PORT = process.env.PORT || 8082;
const HOST = process.env.HOST || "0.0.0.0"; // Bind to all network interfaces

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MySQL connection
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "notes_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Connection retry settings
const MAX_RETRIES = parseInt(process.env.DB_CONNECTION_RETRIES || "5", 10);
const RETRY_DELAY = parseInt(
  process.env.DB_CONNECTION_RETRY_DELAY || "5000",
  10
);

let pool;
let dbConnection = "disconnected";

// Sleep function for retry delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize database and create table if it doesn't exist
async function initializeDatabase() {
  let retries = MAX_RETRIES;

  while (retries >= 0) {
    try {
      console.log(
        `Attempting to connect to MySQL (${MAX_RETRIES - retries + 1}/${
          MAX_RETRIES + 1
        })...`
      );

      // Create connection pool
      pool = mysql.createPool(dbConfig);

      // Test connection
      const connection = await pool.getConnection();
      console.log("Connected to MySQL successfully!");
      console.log(`MySQL Host: ${dbConfig.host}`);
      dbConnection = "connected";

      // Create notes table if it doesn't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Notes table initialized");

      connection.release();
      return; // Success, exit the function
    } catch (err) {
      retries--;
      console.error(
        `MySQL connection error (${retries + 1} retries left):`,
        err
      );
      dbConnection = "error";

      if (retries >= 0) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        console.error("Max retries reached. Could not connect to MySQL.");
      }
    }
  }
}

// Initialize database on startup
initializeDatabase();

// Retry connection periodically if initial connection failed
setInterval(async () => {
  if (dbConnection !== "connected") {
    console.log("Attempting to reconnect to MySQL...");
    await initializeDatabase();
  }
}, 30000); // Try to reconnect every 30 seconds

// Routes
// Get all notes
app.get("/notes", async (req, res) => {
  try {
    if (dbConnection !== "connected") {
      return res.status(503).json({ error: "Database not connected" });
    }

    // Get notes from database
    const [rows] = await pool.query(
      "SELECT * FROM notes ORDER BY created_at DESC"
    );

    console.log("Raw database rows:", JSON.stringify(rows, null, 2));

    // Transform the data for the frontend
    const transformedRows = rows.map((row) => {
      // Convert created_at to ISO string format
      const createdAt =
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : new Date(row.created_at).toISOString();

      return {
        id: row.id,
        content: row.content,
        createdAt: createdAt,
      };
    });

    console.log("Transformed rows:", JSON.stringify(transformedRows, null, 2));

    res.json(transformedRows);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Create a new note
app.post("/notes", async (req, res) => {
  try {
    if (dbConnection !== "connected") {
      return res.status(503).json({ error: "Database not connected" });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Note content is required" });
    }

    // Insert new note
    const [result] = await pool.query(
      "INSERT INTO notes (content) VALUES (?)",
      [content]
    );

    // Get the newly created note
    const [newNotes] = await pool.query("SELECT * FROM notes WHERE id = ?", [
      result.insertId,
    ]);

    if (newNotes.length === 0) {
      throw new Error("Failed to retrieve newly created note");
    }

    const newNote = newNotes[0];
    console.log("Raw new note:", JSON.stringify(newNote, null, 2));

    // Convert created_at to ISO string format
    const createdAt =
      newNote.created_at instanceof Date
        ? newNote.created_at.toISOString()
        : new Date(newNote.created_at).toISOString();

    // Transform the data for the frontend
    const transformedNote = {
      id: newNote.id,
      content: newNote.content,
      createdAt: createdAt,
    };

    console.log(
      "Transformed new note:",
      JSON.stringify(transformedNote, null, 2)
    );

    res.status(201).json(transformedNote);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Health endpoint
app.get("/health", async (req, res) => {
  let currentStatus = dbConnection;

  // Check connection is still valid
  if (dbConnection === "connected" && pool) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
    } catch (err) {
      console.error("Health check failed:", err);
      currentStatus = "error";

      // Try to reconnect immediately if health check fails
      initializeDatabase().catch((err) => {
        console.error("Failed to reconnect:", err);
      });
    }
  }

  res.json({
    status: (currentStatus === "connected" ? "good" : "degraded") + " 1.0.3",
    service: "backend",
    database: currentStatus,
    config: {
      dbHost: dbConfig.host,
      dbName: dbConfig.database,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Backend server running on http://${HOST}:${PORT}`);
  console.log(`Health endpoint: http://${HOST}:${PORT}/health`);
});

// Export for testing
module.exports = app;
