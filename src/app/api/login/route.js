import pool from "@/utils/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  let conn;
  try {
    const { usuario, password } = await req.json();

    if (!usuario || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Faltan datos" }),
        { status: 400 }
      );
    }

    // ✅ mariadb: pool("cliente") es correcto porque pool es función
    conn = await pool("cliente").getConnection();

    // ✅ mariadb devuelve el array directo, sin destructurar
    const rows = await conn.query(
      "SELECT * FROM cliente WHERE correo = ? OR nombre = ? LIMIT 1",
      [usuario, usuario]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Usuario no encontrado" }),
        { status: 404 }
      );
    }

    const user = rows[0];

    // ✅ bcrypt.compare con el campo correcto
    const match = await bcrypt.compare(password, user.contraseña);

    if (!match) {
      return new Response(
        JSON.stringify({ success: false, message: "Contraseña incorrecta" }),
        { status: 401 }
      );
    }

    // ✅ Eliminado el pool(rol) innecesario — el rol ya viene del usuario
    return new Response(
      JSON.stringify({ 
        success: true, 
        cliente: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: "Error en el servidor" }),
      { status: 500 }
    );
  } finally {
    // ✅ Siempre libera en finally, nunca antes
    if (conn) conn.release();
  }
}