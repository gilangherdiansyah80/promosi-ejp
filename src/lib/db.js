import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "ejp",
  password: "ejp",
  database: "promosi_ejp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
