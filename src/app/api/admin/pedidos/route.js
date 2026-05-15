import pool from "@/utils/db";

// GET - Obtener todos los pedidos con detalles
export async function GET() {
  try {
    const conn = await pool("admin").getConnection();

    // Obtener pedidos con datos del cliente
    const pedidos = await conn.query(`
      SELECT 
        p.id_pedido,
        p.fecha_pedido,
        p.estado_pedido,
        p.estado_pago,
        c.nombre AS nombre_cliente,
        c.correo AS email_cliente,
        c.telefono AS telefono_cliente
      FROM pedido p
      INNER JOIN cliente c ON p.id_cliente = c.id_cliente
      ORDER BY p.id_pedido DESC;
    `);

    // Obtener detalles
    const detalles = await conn.query(`
      SELECT
        dp.id_pedido,
        dp.id_producto,
        pr.nombre AS nombre_producto,
        dp.cantidad,
        dp.precio_unitario
      FROM detalle_pedido dp
      INNER JOIN producto pr ON dp.id_producto = pr.id_producto;
    `);

    // Agrupar detalles por pedido
    const detallesPorPedido = {};
    for (const d of detalles) {
      if (!detallesPorPedido[d.id_pedido]) {
        detallesPorPedido[d.id_pedido] = [];
      }
      detallesPorPedido[d.id_pedido].push({
        id_producto: d.id_producto,
        nombre_producto: d.nombre_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario
      });
    }

    // Armar pedidos finales
    const respuesta = [];

    for (const p of pedidos) {
      const [resultTotal] = await conn.query(
        `SELECT calcular_total_pedido(?) AS total`,
        [p.id_pedido]
      );

      respuesta.push({
        ...p,
        items: detallesPorPedido[p.id_pedido] || [],
        total_pedido: resultTotal.total
      });
    }

    conn.release();
    return Response.json({ pedidos: respuesta });

  } catch (error) {
    console.error("Error en GET /admin/pedidos:", error);
    return Response.json(
      { message: "Error al obtener pedidos", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado del pedido
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id_pedido, estado, estado_pago } = body;

    if (!id_pedido) {
      return Response.json(
        { message: "id_pedido es requerido" },
        { status: 400 }
      );
    }

    const conn = await pool("admin").getConnection();

    // Se actualiza solo lo que llegó en el body
    if (estado) {
      await conn.query(
        `UPDATE pedido SET estado_pedido = ? WHERE id_pedido = ?`,
        [estado, id_pedido]
      );
    }

    if (estado_pago) {
      await conn.query(
        `UPDATE pedido SET estado_pago = ? WHERE id_pedido = ?`,
        [estado_pago, id_pedido]
      );
    }

    conn.release();
    return Response.json({ message: "Pedido actualizado correctamente" });

  } catch (error) {
    console.error("Error en PUT /admin/pedidos:", error);
    return Response.json(
      { message: "Error al actualizar el pedido", error: error.message },
      { status: 500 }
    );
  }
}
