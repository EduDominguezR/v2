// app/api/login/route.js
import pool from "@/utils/db";
import bcrypt from "bcryptjs";

// ─── LOGIN ───────────────────────────────────────────────────────────────────
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

// ─── CAMBIAR CONTRASEÑA ───────────────────────────────────────────────────────
export async function PUT(req) {
  try {
    const { correo, nuevaContrasena } = await req.json();

    if (!correo || !nuevaContrasena) {
      return Response.json(
        { success: false, message: "Correo y nueva contraseña requeridos" },
        { status: 400 }
      );
    }

    if (nuevaContrasena.length < 6) {
      return Response.json(
        { success: false, message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const conn = await pool("admin").getConnection();

    // Verifica que el correo exista
    const rows = await conn.query(
      `SELECT id_cliente FROM cliente WHERE correo = ? LIMIT 1`,
      [correo]
    );

    if (!rows || rows.length === 0) {
      conn.release();
      return Response.json(
        { success: false, message: "Correo no encontrado" },
        { status: 404 }
      );
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);

    await conn.query(
      `UPDATE cliente SET contraseña = ? WHERE correo = ?`,
      [hash, correo]
    );
    conn.release();

    return Response.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });

  } catch (error) {
    console.error("Error en PUT /api/login:", error);
    return Response.json(
      { success: false, message: "Error en el servidor" },
      { status: 500 }
    );
  }
}