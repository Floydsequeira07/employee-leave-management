const mysql = require("mysql2");

require("dotenv").config();

// On Vercel every function instance has its own pool, so keep it small
// to stay under Aiven's connection limit.
const isServerless = Boolean(process.env.VERCEL);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false,
  },

  // Reuse connections instead of opening a new SSL connection per request
  waitForConnections: true,
  connectionLimit: isServerless ? 2 : 10,
  queueLimit: 0,

  // Aiven closes idle connections, so keep them alive and recycle old ones
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: isServerless ? 2 : 5,
  idleTimeout: 60000,
  connectTimeout: 10000,
});

// Warm up one connection at startup so the first login is not slow
pool.query("SELECT 1", (error) => {
  if (error) {
    console.error("Database warm-up failed:", error.message);
  } else {
    console.log("Database connection ready");
  }
});

module.exports = pool.promise();