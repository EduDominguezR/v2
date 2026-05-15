import mariadb from "mariadb";

let adminPool;
let clientePool;

const pool = (rol = "cliente") => {
  if (rol === "admin") {
    if (!adminPool) {
      adminPool = mariadb.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_ADMIN_USER || "r_admin",
        password: process.env.DB_ADMIN_PASS,
        database: process.env.DB_NAME || "reposteria",
        connectionLimit: 5,
      });
    }
    return adminPool;
  } else {
    if (!clientePool) {
      clientePool = mariadb.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_CLIENT_USER || "r_cliente",
        password: process.env.DB_CLIENT_PASS,
        database: process.env.DB_NAME || "reposteria",
        connectionLimit: 5,
      });
    }
    return clientePool;
  }
};

export default pool;