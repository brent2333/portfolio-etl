const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.USERNAME || "brent",
  host: process.env.HOSTNAME || "localhost",
  database: process.env.DATABASE || "api",
  password: process.env.PASSWORD || "",
  port: process.env.PORT || 5432,
});

module.exports = pool;
