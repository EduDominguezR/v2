// app/api/clientes/perfil/route.js
import pool from "@/utils/db";

export async function PUT(req) {
  try {
    const body = await req.json();
    console.log("📥 Body recibido:", body); // ← agrega esto

    const { id_cliente, nombre, telefono, direccion } = body;

    if (!id_cliente || !nombre) {
      return Response.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const conn = await pool("cliente").getConnection();
    await conn.query(
      `UPDATE cliente SET nombre = ?, telefono = ?, direccion = ? WHERE id_cliente = ?`,
      [nombre, telefono || null, direccion || null, id_cliente]
    );
    conn.release();

    return Response.json({ message: "Perfil actualizado correctamente" });

  } catch (error) {
    console.error("❌ Error en PUT /api/clientes/perfil:", error.message); // ← y esto
    return Response.json({ message: "Error al actualizar perfil" }, { status: 500 });
  }
}