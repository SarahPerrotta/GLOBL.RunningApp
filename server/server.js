const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const DATA_DIR = path.join(__dirname, "data");

// Root route so browser doesn’t show an error 
app.get("/", (_req, res) => {
  res.send("GLOBL API is running, try /api/parkruns or /api/runclubs");
});

// Debug (shows what files the server sees)
app.get("/debug", (_req, res) => {
  const pr = path.join(DATA_DIR, "parkrun_uk.json");
  const rc = path.join(DATA_DIR, "runclubs_uk.json");
  res.json({
    __dirname,
    dataDir: DATA_DIR,
    exists: {
      dataDir: fs.existsSync(DATA_DIR),
      parkrun_uk_json: fs.existsSync(pr),
      runclubs_uk_json: fs.existsSync(rc),
    },
    paths: { parkrun: pr, runclubs: rc },
  });
});

// ParkRun endpoint
app.get("/api/parkruns", (req, res) => {
  try {
  const data = fs.readFileSync(path.join(DATA_DIR, "parkrun_uk.json"), "utf-8");
  res.json(JSON.parse(data));
  } catch (err) {
    console.error("Error reading parkrun data:", err);
    res.status(500).json({ error: "Failed to read parkrun data" });
  }
});

// RunClubs endpoint
app.get("/api/runclubs", (req, res) => {
  try {
  const data = fs.readFileSync(path.join(DATA_DIR, "runclubs_uk.json"), "utf-8");
  res.json(JSON.parse(data));
} catch (err) {
  console.error("Error reading runclub data:", err);
  res.status(500).json({ error: "Failed to read runclub data" });
}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
