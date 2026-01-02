const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");

const agentRoutes = require("./routes/agents");
const competitionService = require("./services/competition");

const app = express();
const PORT = process.env.PORT || 3001;

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());

// --------------------
// API Routes
// --------------------
app.use("/api", agentRoutes);

// --------------------
// Health check
// --------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// Serve Frontend (Windows-safe)
// --------------------
const frontendPath = path.resolve(__dirname, "../frontend");
const indexFile = path.join(frontendPath, "index.html");

// Debug logs (VERY IMPORTANT)
console.log("📂 Frontend path:", frontendPath);
console.log("📄 index.html exists:", fs.existsSync(indexFile));

// Serve static assets
app.use(express.static(frontendPath));

// Root route
app.get("/", (req, res) => {
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send("Frontend not found: index.html missing");
  }
});

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  cron.schedule("*/1 * * * *", () => {
    console.log("🏆 Starting competition evaluation...");
    competitionService.evaluateCompetition();
    console.log(
      `🏆 Winner: ${winner.id} | Owner: ${winner.owner} | Score: ${winner.score}`
    );
    
  });
  

  // 🔄 Agent simulation – every 30 seconds
  cron.schedule("*/30 * * * * *", () => {
    competitionService.simulateAgentActions();
  });

  console.log("⏰ Competition cycle: Every 6 hours");
  console.log("🔄 Agent simulation: Every 30 seconds");
});
