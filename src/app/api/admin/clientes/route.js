import pool from "@/utils/db";

export async function GET(req) {
  try {
    // debe usar token en lugar esta marranada
    const admin = true; //verificacion temporal
    if (!admin) {
      return new Response(JSON.stringify({ message: "No autorizado" }), { status: 403 });
    }

    const conn = await pool("admin").getConnection();
    const clientes = await conn.query("SELECT id_cliente, nombre, correo, telefono, direccion FROM cliente");
    conn.release();

    return new Response(JSON.stringify({ clientes }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error en el servidor" }), { status: 500 });
  }
}
