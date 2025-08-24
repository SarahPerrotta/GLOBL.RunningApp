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
