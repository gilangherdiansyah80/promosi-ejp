import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "ejp",
  password: "ejp",
  database: "promosi_ejp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
