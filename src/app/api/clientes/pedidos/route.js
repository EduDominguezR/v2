import pool from "@/utils/db";

export async function POST(req) {
  let conn;
  try {
    const body = await req.json();
    const { id_cliente, fecha_pedido, estado_pago, detalles } = body;

    if (!id_cliente || !detalles || detalles.length === 0) {
      return new Response(
        JSON.stringify({ message: "Faltan datos del pedido o está vacío." }),
        { status: 400 }
      );
    }

    conn = await pool("cliente").getConnection();

    const [resultPedido] = await conn.query(
      `CALL crear_pedido(?, ?, ?);`,
      [id_cliente, fecha_pedido, estado_pago]
    );

    const id_pedido = resultPedido[0].id_pedido_creado;

    for (const det of detalles) {
      await conn.query(
        `CALL agregar_detalle_pedido(?, ?, ?, ?)`,
        [id_pedido, det.id_producto, det.cantidad, det.precio_unitario]
      );
    }

    return new Response(
      JSON.stringify({
        message: "Pedido creado correctamente",
        id_pedido,
        estado: estado_pago || "NO_PAGADO",
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error("Error al crear pedido:", error);
    return new Response(
      JSON.stringify({ message: "Error al crear el pedido", error: error.message }),
      { status: 500 }
    );

  } finally {
    if (conn) conn.release(); 
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id_cliente = url.searchParams.get("id_cliente");

    if (!id_cliente) {
      return new Response(
        JSON.stringify({ message: "Debes enviar id_cliente en la URL" }),
        { status: 400 }
      );
    }

    const conn = await pool("cliente").getConnection();

    const rows = await conn.query(
      `
      SELECT 
        p.id_pedido,
        p.fecha_pedido,
        p.estado_pago,
        p.estado_pedido,
        dp.id_producto,
        pr.nombre AS producto_nombre,
        dp.cantidad,
        dp.precio_unitario
      FROM pedido p
      LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      LEFT JOIN producto pr ON dp.id_producto = pr.id_producto
      WHERE p.id_cliente = ?
      ORDER BY p.id_pedido DESC;
      `,
      [id_cliente]
    );

    // Agrupación de pedidos
    const pedidosMap = {};

    for (const row of rows) {
      if (!pedidosMap[row.id_pedido]) {
        pedidosMap[row.id_pedido] = {
          id_pedido: row.id_pedido,
          fecha_pedido: row.fecha_pedido,
          estado_pago: row.estado_pago,
          estado_pedido: row.estado_pedido,
          total: 0, // temporal hasta calcularlo
          productos: [],
        };
      }

      if (row.id_producto) {
        pedidosMap[row.id_pedido].productos.push({
          id_producto: row.id_producto,
          nombre: row.producto_nombre,
          cantidad: row.cantidad,
          precio_unitario: row.precio_unitario,
        });
      }
    }

    // Calcular los totales usando tu función SQL
    const pedidos = Object.values(pedidosMap);

    for (const pedido of pedidos) {
      const [rowTotal] = await conn.query(
        "SELECT calcular_total_pedido(?) AS total",
        [pedido.id_pedido]
      );

      pedido.total = Number(rowTotal.total) || 0;
    }

    conn.release();

    return new Response(JSON.stringify(pedidos), {
      status: 200,
    });

  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return new Response(
      JSON.stringify({ message: "Error al obtener pedidos", error: error.message }),
      { status: 500 }
    );
  }
}
