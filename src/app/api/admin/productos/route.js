  import pool from "@/utils/db";

  export async function GET(req) {
    try {
      const conn = await pool("admin").getConnection();
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

  export async function POST(req) {
    try {
      const { nombre, descripcion, precio_base, tipo, ingredientes, imagen } = await req.json();

      if (!nombre || !descripcion || !precio_base || !tipo || !ingredientes) {
        return new Response(
          JSON.stringify({ message: "Faltan datos obligatorios del producto" }),
          { status: 400 }
        );
      }

      const conn = await pool("admin").getConnection();
      const result = await conn.query(
        `INSERT INTO producto (nombre, descripcion, precio_base, tipo, ingredientes, imagen)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, descripcion, precio_base, tipo, JSON.stringify(ingredientes), imagen || null]
      );
      conn.release();

      return new Response(
        JSON.stringify({
          message: "Producto agregado correctamente",
          id_producto: Number(result.insertId),
        }),
        { status: 201 }
      );
    } catch (error) {
      console.error("Error en POST /api/admin/productos:", error);
      return new Response(JSON.stringify({ message: "Error al agregar producto" }), { status: 500 });
    }
  }

  export async function PUT(req) {
    try {
      const { id_producto, nombre, descripcion, precio_base, tipo, ingredientes, imagen } =
        await req.json();

      if (!id_producto)
        return new Response(JSON.stringify({ message: "Falta el ID del producto" }), { status: 400 });

      const conn = await pool("admin").getConnection();
      await conn.query(
        `UPDATE producto
        SET nombre=?, descripcion=?, precio_base=?, tipo=?, ingredientes=?, imagen=?
        WHERE id_producto=?`,
        [
          nombre,
          descripcion,
          precio_base,
          tipo,
          JSON.stringify(ingredientes), 
          imagen || null,
          id_producto,
        ]
      );
      conn.release();

      return new Response(JSON.stringify({ message: "Producto actualizado correctamente" }), {
        status: 200,
      });
    } catch (error) {
      console.error("Error en PUT /api/admin/productos:", error);
      return new Response(JSON.stringify({ message: "Error al actualizar producto" }), {
        status: 500,
      });
    }
  }


  export async function DELETE(req) {
    try {
      const { id_producto } = await req.json();
      if (!id_producto)
        return new Response(JSON.stringify({ message: "Falta el ID del producto" }), { status: 400 });

      const conn = await pool("admin").getConnection();
      await conn.query(`DELETE FROM producto WHERE id_producto=?`, [id_producto]);
      conn.release();

      return new Response(JSON.stringify({ message: "Producto eliminado correctamente" }), {
        status: 200,
      });
    } catch (error) {
      console.error("Error en DELETE /api/admin/productos:", error);
      return new Response(JSON.stringify({ message: "Error al eliminar producto" }), { status: 500 });
    }
  }
