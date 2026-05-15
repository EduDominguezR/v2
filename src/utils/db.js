// utils/db.js
import mariadb from "mariadb";

const configs = {
  admin: {
    host: "localhost",
    user: "sc_admin",
    password: "admin_pass_segura",
    database: "spooky_cookie",
  },
  cliente: {
    host: "localhost",
    user: "sc_cliente",
    password: "cliente_pass_segura",
    database: "spooky_cookie",
  },
};

const pools = {};

export default function pool(tipo = "cliente") {
  if (!pools[tipo]) {
    pools[tipo] = mariadb.createPool({
      ...configs[tipo],
      connectionLimit: 5,
    });
  }
  return pools[tipo];
}