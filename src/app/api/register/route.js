import pool from "@/utils/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { nombre, telefono, correo, direccion, rol, contraseña } = await req.json();

    if (!nombre || !correo || !contraseña) {
      return new Response(
        JSON.stringify({ success: false, message: "Nombre, correo y contraseña son obligatorios" }),
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const conn = await pool("admin").getConnection();
    const result = await conn.query(
      `INSERT INTO cliente (nombre, telefono, correo, direccion, rol, contraseña) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, telefono || null, correo, direccion || null, rol || "cliente", hash]
    );
    conn.release();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Usuario registrado correctamente", 
        id: result.insertId.toString() 
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error en /api/register:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return new Response(
        JSON.stringify({ success: false, message: "El correo ya está registrado" }),
        { status: 409 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Error en el servidor" }),
      { status: 500 }
    );
  }
}
