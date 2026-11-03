const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Needed behind Render / Vercel proxies so rate limiting sees the real IP
app.set("trust proxy", 1);

app.use(helmet());

// Smaller responses = faster over slow connections
app.use(compression());

const allowedOrigins = [
  "http://localhost:5173",
  "https://employee-leave-management-floyd.vercel.app/",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" }));

// Slows down password guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "Leave Management API is running",
  });
});

// Lightweight route for uptime pingers (does not touch the database)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Catches anything thrown outside the controllers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    message: "Server error",
  });
});

const PORT = process.env.PORT || 5000;

// Only listen when run directly (Render, local). On Vercel the app is imported.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;