const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

const DATA_DIR = path.join(__dirname, "data");

// ParkRun endpoint
app.get("/api/parkruns", (req, res) => {
  const data = fs.readFileSync(path.join(DATA_DIR, "parkrun_uk.json"), "utf-8");
  res.json(JSON.parse(data));
});

// RunClubs endpoint
app.get("/api/runclubs", (req, res) => {
  const data = fs.readFileSync(path.join(DATA_DIR, "runclubs_uk.json"), "utf-8");
  res.json(JSON.parse(data));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
