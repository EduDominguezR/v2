import pool from "@/utils/db";

export async function GET(req) {
  try {
    const conn = await pool("cliente").getConnection();
    const productos = await conn.query(
      `SELECT id_producto AS id, nombre AS name, descripcion AS description,
              precio_base AS price, tipo AS category, imagen AS image, ingredientes AS ingredients
       FROM producto`
    );

    conn.release();

    const lista = Array.isArray(productos) ? productos : [];

    const resultado = lista.map((p) => {
      let image = p.image;

      // convertir link de drive
      if (image?.includes("drive.google.com") && image.includes("/file/d/")) {
        const idMatch = image.match(/\/d\/([^/]+)/);
        if (idMatch && idMatch[1]) {
          const fileId = idMatch[1];
          image = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }

      return {
        ...p,
        price: parseFloat(p.price),
        image, // imagen corregida
        ingredients: p.ingredients ? p.ingredients : [],
      };
    });

    return new Response(JSON.stringify({ productos: resultado }), { status: 200 });
  } catch (error) {
    console.error("Error en /api/clientes/productos:", error);
    return new Response(JSON.stringify({ message: "Error en el servidor" }), { status: 500 });
  }
}
