import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "212.85.27.163",
  user: "admin",
  password: "12345",
  database: "promosi_ejp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
