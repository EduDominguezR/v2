// app/api/login/route.js
import pool from "@/utils/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { usuario, password } = await req.json();

    if (!usuario || !password) {
      return Response.json(
        { success: false, message: "Usuario y contraseña requeridos" },
        { status: 400 }
      );
    }

    const conn = await pool("admin").getConnection();

    // Busca por correo o nombre
    const rows = await conn.query(
      `SELECT id_cliente, nombre, correo, telefono, direccion, contraseña, rol
       FROM cliente
       WHERE correo = ? OR nombre = ?
       LIMIT 1`,
      [usuario, usuario]
    );
    conn.release();

    if (!rows || rows.length === 0) {
      return Response.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const cliente = rows[0];
    const passwordValida = await bcrypt.compare(password, cliente.contraseña);

    if (!passwordValida) {
      return Response.json(
        { success: false, message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // No enviar la contraseña al front
    const { contraseña: _, ...clienteSinPass } = cliente;

    return Response.json({
      success: true,
      cliente: {
        ...clienteSinPass,
        id_cliente: Number(cliente.id_cliente),
      },
    });

  } catch (error) {
    console.error("Error en /api/login:", error);
    return Response.json(
      { success: false, message: "Error en el servidor" },
      { status: 500 }
    );
  }
}