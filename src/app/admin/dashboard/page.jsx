"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./calendar.css";  
/* ── Constantes del calendario ───────────── */
const MESES = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
               "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
const MESES_CORTOS = ["Ene","Feb","Mar","Abr","May","Jun",
                      "Jul","Ago","Sep","Oct","Nov","Dic"];

const ESTADO_PEDIDO_MAP = {
  PENDIENTE:      { label: "Pendiente",      pill: "status-pending",     chip: "chip-pending"   },
  CONFIRMADO:     { label: "Confirmado",     pill: "status-confirmed",   chip: "chip-confirmed" },
  EN_PREPARACION: { label: "En preparación", pill: "status-preparation", chip: "chip-confirmed" },
  LISTO:          { label: "Listo",          pill: "status-ready",       chip: "chip-ready"     },
  ENTREGADO:      { label: "Entregado",      pill: "status-delivered",   chip: "chip-more"      },
  CANCELADO:      { label: "Cancelado",      pill: "status-cancelled",   chip: "chip-more"      },
};

const ESTADO_PAGO_MAP = {
  NO_PAGADO: { label: "No pagado", pillClass: "payment-pending"  },
  PAGADO:    { label: "Pagado",    pillClass: "payment-paid"     },
  RECHAZADO: { label: "Rechazado", pillClass: "payment-rejected" },
};

/* ── Utilidades ──────────────────────────── */
function dateKey(dateStr) {
  return dateStr ? String(dateStr).split("T")[0] : null;
}

function groupByDate(pedidos) {
  const map = {};
  for (const p of pedidos) {
    const key = dateKey(p.fecha_pedido);
    if (!key) continue;
    if (!map[key]) map[key] = [];
    map[key].push(p);
  }
  return map;
}

function formatCurrency(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 2,
  }).format(n ?? 0);
}

/* ═══════════════════════════════════════════
   COMPONENTE CALENDARIO (interno)
═══════════════════════════════════════════ */
function CalendarioEntregas({ orders, onUpdateEstado }) {
  const [calDate, setCalDate]       = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(null);
  const [updatingId, setUpdatingId]   = useState(null);
  const [toast, setToast]             = useState(null);

  const y = calDate.getFullYear();
  const m = calDate.getMonth();
  const daysInMonth    = new Date(y, m + 1, 0).getDate();
  const firstDayOfWeek = new Date(y, m, 1).getDay();
  const startOffset    = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const today          = new Date();
  const isThisMonth    = today.getFullYear() === y && today.getMonth() === m;
  const yearMonth      = `${y}-${String(m + 1).padStart(2, "0")}`;

  // Filtrar solo pedidos del mes visible
  const pedidosMes = orders.filter(p =>
    dateKey(p.fecha_pedido)?.startsWith(yearMonth)
  );
  const byDate         = groupByDate(pedidosMes);
  const selectedOrders = selectedKey ? (byDate[selectedKey] ?? []) : [];
  const selectedDayNum = selectedKey ? parseInt(selectedKey.split("-")[2]) : null;

  // Estadísticas del mes
  const totalMes       = pedidosMes.length;
  const diasEntrega    = Object.keys(byDate).length;
  const pendientes     = pedidosMes.filter(p =>
    String(p.estado_pedido).toUpperCase() === "PENDIENTE").length;
  const listos         = pedidosMes.filter(p =>
    String(p.estado_pedido).toUpperCase() === "LISTO").length;

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleUpdateEstado(id_pedido, campo, valor) {
    setUpdatingId(id_pedido);
    try {
      await onUpdateEstado(id_pedido, campo, valor);
      showToast("✓ Estado actualizado");
    } catch {
      showToast("✗ Error al actualizar", true);
    } finally {
      setUpdatingId(null);
    }
  }

  function prevMonth() {
    setCalDate(new Date(y, m - 1, 1));
    setSelectedKey(null);
  }
  function nextMonth() {
    setCalDate(new Date(y, m + 1, 1));
    setSelectedKey(null);
  }

  return (
    <div className="cal-page-layout">

      {/* ── Calendario ─────────────────────── */}
      <div className="calendar-card">

        {/* Cabecera mes */}
        <div className="cal-month-header">
          <button className="cal-nav" onClick={prevMonth}>‹</button>
          <div className="cal-month-title">
            <div className="month-name">{MESES[m]}</div>
            <div className="year-label">{y}</div>
          </div>
          <button className="cal-nav" onClick={nextMonth}>›</button>
          {/* Deco floral */}
          <svg className="floral-deco" width="55" height="65" viewBox="0 0 55 65" fill="none">
            <circle cx="27" cy="18" r="9" stroke="white" strokeWidth="1.8"/>
            <line x1="27" y1="27" x2="27" y2="60" stroke="white" strokeWidth="2.2"/>
            <ellipse cx="16" cy="44" rx="7" ry="4.5" transform="rotate(-30 16 44)"
                     stroke="white" strokeWidth="1.4"/>
            <ellipse cx="38" cy="40" rx="7" ry="4.5" transform="rotate(30 38 40)"
                     stroke="white" strokeWidth="1.4"/>
            <circle cx="27" cy="18" r="3.5" fill="white" opacity="0.55"/>
            <circle cx="7"  cy="7"  r="2.5" stroke="white" strokeWidth="1.4"/>
            <circle cx="48" cy="55" r="2"   stroke="white" strokeWidth="1.4"/>
          </svg>
        </div>

        {/* Nombres de días */}
        <div className="cal-weekdays">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => (
            <div key={d} className="wd">{d}</div>
          ))}
        </div>

        {/* Días */}
        <div className="cal-days">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e-${i}`} className="cal-day empty" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day        = i + 1;
            const key        = `${yearMonth}-${String(day).padStart(2, "0")}`;
            const dayOrders  = byDate[key] || [];
            const hasDelivery = dayOrders.length > 0;
            const isToday    = isThisMonth && today.getDate() === day;
            const isSelected = selectedKey === key;
            const dow        = new Date(y, m, day).getDay();

            return (
              <div
                key={key}
                className={[
                  "cal-day",
                  hasDelivery ? "has-delivery" : "",
                  isToday    ? "today"        : "",
                  isSelected ? "selected"     : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedKey(key)}
              >
                <div className={`day-num${dow === 0 ? " sunday" : ""}`}>
                  {day}
                </div>
                {hasDelivery && (
                  <div className="delivery-chips">
                    {dayOrders.slice(0, 2).map(o => {
                      const est = String(o.estado_pedido || "").toUpperCase();
                      const s   = ESTADO_PEDIDO_MAP[est] ?? ESTADO_PEDIDO_MAP.PENDIENTE;
                      return (
                        <div key={o.id_pedido} className={`delivery-chip ${s.chip}`}>
                          {o.nombre_cliente?.split(" ")[0]}
                        </div>
                      );
                    })}
                    {dayOrders.length > 2 && (
                      <div className="delivery-chip chip-more">
                        +{dayOrders.length - 2} más
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sidebar ────────────────────────── */}
      <aside className="cal-sidebar">

        {/* Resumen mes */}
        <div className="summary-card">
          <h2 className="card-label">
            Resumen — {MESES_CORTOS[m]} {y}
          </h2>
          <div className="summary-stats">
            {[
              { num: totalMes,    label: "Pedidos"          },
              { num: diasEntrega, label: "Días con entrega" },
              { num: pendientes,  label: "Pendientes"       },
              { num: listos,      label: "Listos"           },
            ].map(s => (
              <div key={s.label} className="summary-stat">
                <span className="s-num">{s.num}</span>
                <span className="s-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle del día */}
        <div className="day-detail-card">
          <div className="day-detail-header">
            <h2>
              {selectedDayNum
                ? `${selectedDayNum} de ${MESES_CORTOS[m]}`
                : "Selecciona un día"}
            </h2>
            <span className="day-badge">
              {selectedKey
                ? `${selectedOrders.length} entrega${selectedOrders.length !== 1 ? "s" : ""}`
                : "—"}
            </span>
          </div>

          <div className="day-detail-body">
            {!selectedKey ? (
              <div className="no-deliveries">
                <div className="nd-icon">📅</div>
                Haz clic en un día<br />para ver sus entregas
              </div>
            ) : selectedOrders.length === 0 ? (
              <div className="no-deliveries">
                <div className="nd-icon"></div>
                Sin entregas para este día
              </div>
            ) : (
              selectedOrders.map(o => {
                const est = String(o.estado_pedido || "").toUpperCase();
                const pag = String(o.estado_pago   || "").toUpperCase();
                const sp  = ESTADO_PEDIDO_MAP[est] ?? ESTADO_PEDIDO_MAP.PENDIENTE;
                const pp  = ESTADO_PAGO_MAP[pag]   ?? ESTADO_PAGO_MAP.NO_PAGADO;
                const busy = updatingId === o.id_pedido;

                return (
                  <div key={o.id_pedido}
                       className={`order-item-card${busy ? " updating" : ""}`}>
                    <div className="order-item-top">
                      <div>
                        <div className="order-client">{o.nombre_cliente}</div>
                        <div className="order-id">
                          #{o.id_pedido} · {o.email_cliente}
                        </div>
                        {o.telefono_cliente && (
                          <div className="order-id">{o.telefono_cliente}</div>
                        )}
                      </div>
                      <span className={`status-pill ${sp.pill}`}>{sp.label}</span>
                    </div>

                    {/* Productos */}
                    {o.items?.length > 0 && (
                      <div className="order-items-list">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="order-item-row">
                            <span>{it.nombre_producto}</span>
                            <span className="item-qty">×{it.cantidad}</span>
                            <span className="item-price">
                              {formatCurrency(it.precio_unitario)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="order-totals-row">
                      <span className={`pay-pill ${pp.pillClass}`}>{pp.label}</span>
                      <span className="order-total">
                        {formatCurrency(o.total_pedido)}
                      </span>
                    </div>

                    {/* Selectores de estado */}
                    <div className="order-controls">
                      <div className="control-group">
                        <label className="control-label">Pedido</label>
                        <select
                          className={`status-select ${sp.pill}`}
                          value={est}
                          disabled={busy}
                          onChange={e =>
                            handleUpdateEstado(o.id_pedido, "estado_pedido", e.target.value)
                          }
                        >
                          {Object.entries(ESTADO_PEDIDO_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="control-group">
                        <label className="control-label">Pago</label>
                        <select
                          className={`status-select ${pp.pillClass}`}
                          value={pag}
                          disabled={busy}
                          onChange={e =>
                            handleUpdateEstado(o.id_pedido, "estado_pago", e.target.value)
                          }
                        >
                          {Object.entries(ESTADO_PAGO_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Leyenda */}
        <div className="legend-card">
          <h3 className="card-label">Leyenda</h3>
          <div className="legend-items">
            {[
              { color: "#fde68a", border: "#ca8a00", label: "Pendiente"      },
              { color: "#bfdbfe", border: "#2563eb", label: "Confirmado"     },
              { color: "#d8b4fe", border: "#7c3aed", label: "En preparación" },
              { color: "#bbf7d0", border: "#16a34a", label: "Listo"          },
              { color: "#e5e7eb", border: "#9ca3af", label: "Entregado"      },
              { color: "#fce8f0", border: "#c1476a", label: "Cancelado"      },
            ].map(l => (
              <div key={l.label} className="legend-item">
                <div style={{
                  width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                  background: l.color, border: `1px solid ${l.border}`
                }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* Toast */}
      {toast && (
        <div className={`toast-notification${toast.isError ? " toast-error" : ""}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PÁGINA PRINCIPAL — Admin Dashboard
═══════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const [menuItems, setMenuItems]   = useState([]);
  const [orders, setOrders]         = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading]   = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  // ✅ Nueva pestaña "calendario"
  const [activeTab, setActiveTab]   = useState("products");
  const [formData, setFormData]     = useState({
    name: "", price: "", category: "",
    description: "", ingredients: "", image: ""
  });

  const router = useRouter();

  /* Auth */
  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem("usuario");
      const storedToken = localStorage.getItem("token");
      if (!storedUser || !storedToken) { router.replace("/login"); return; }
      const user  = JSON.parse(storedUser);
      const token = JSON.parse(atob(storedToken));
      if (user?.rol !== "admin" || token?.rol !== "admin") {
        router.replace("/"); return;
      }
      setCheckingAuth(false);
    } catch {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!checkingAuth) {
      loadMenuItems();
      loadOrders();
    }
  }, [checkingAuth]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const res  = await fetch("/api/admin/productos");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMenuItems(data.productos || []);
    } catch {
      alert("No se pudieron cargar los productos");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res  = await fetch("/api/admin/pedidos");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.pedidos || []);
    } catch {
      alert("No se pudieron cargar los pedidos");
    }
  };

  /* ── Actualizar estado (usado por tabla Y calendario) ── */
  const handleUpdateEstado = useCallback(async (id_pedido, campo, valor) => {
    const body = campo === "estado_pedido"
      ? { id_pedido, estado: valor }
      : { id_pedido, estado_pago: valor };

    const res = await fetch("/api/admin/pedidos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Error al actualizar");

    // Actualización optimista local
    setOrders(prev =>
      prev.map(p =>
        p.id_pedido === id_pedido ? { ...p, [campo]: valor } : p
      )
    );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name:"", price:"", category:"", description:"", ingredients:"", image:"" });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name:        item.name        || "",
      price:       String(item.price ?? ""),
      category:    item.category    || "",
      description: item.description || "",
      ingredients: Array.isArray(item.ingredients)
        ? item.ingredients.join(", ") : (item.ingredients || ""),
      image:       item.image || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      const res = await fetch("/api/admin/productos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: id })
      });
      if (!res.ok) throw new Error();
      await loadMenuItems();
    } catch {
      alert("Error al eliminar el producto");
    }
  };

  const handleOrderStatusChange = (orderId, newStatus) =>
    handleUpdateEstado(orderId, "estado_pedido", newStatus)
      .then(() => {})
      .catch(() => alert("Error al actualizar estado"));

  const handlePaymentStatusChange = (orderId, newStatus) =>
    handleUpdateEstado(orderId, "estado_pago", newStatus)
      .then(() => {})
      .catch(() => alert("Error al actualizar pago"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ingredientesArray = formData.ingredients
      .split(",").map(i => i.trim()).filter(Boolean);
    const body = {
      nombre: formData.name, descripcion: formData.description,
      precio_base: Number(formData.price), tipo: formData.category,
      ingredientes: ingredientesArray, imagen: formData.image
    };
    try {
      if (editingItem) {
        const res = await fetch("/api/admin/productos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_producto: editingItem.id, ...body })
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/admin/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error();
      }
      setIsModalOpen(false);
      await loadMenuItems();
      setEditingItem(null);
    } catch {
      alert("Error al guardar el producto");
    }
  };

  const formatDate = (ds) =>
    new Date(ds).toLocaleDateString("es-ES", {
      year:"numeric", month:"long", day:"numeric",
      hour:"2-digit", minute:"2-digit"
    });

  const getStatusClass = (s) => ({
    PENDIENTE: "status-pending", CONFIRMADO: "status-confirmed",
    EN_PREPARACION: "status-preparation", LISTO: "status-ready",
    ENTREGADO: "status-delivered", CANCELADO: "status-cancelled"
  })[String(s||"").toUpperCase()] || "status-pending";

  const getPaymentStatusClass = (s) => ({
    NO_PAGADO: "payment-pending", PAGADO: "payment-paid", RECHAZADO: "payment-rejected"
  })[String(s||"").toUpperCase()] || "payment-pending";

  if (checkingAuth || isLoading) {
    return (
      <div className="admin-crud-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{checkingAuth ? "Verificando acceso..." : "Cargando..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-crud-container">
      <header className="admin-header">
  <div className="header-content">
    <h1>Panel de Administración — Spooky Cookie</h1>
    <div className="admin-header-actions">
      <button className="btn-secondary" onClick={() => router.push("/")}>
        Volver al Inicio
      </button>
      <button
        className="btn-logout-admin"
        onClick={() => {
          localStorage.removeItem("usuario");
          localStorage.removeItem("token");
          router.push("/login");
        }}
      >
        Cerrar sesión
      </button>
    </div>
  </div>
</header>

      {/* ── Pestañas — ahora 3 ──────────────── */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Gestión de Productos
        </button>
        <button
          className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Gestión de Pedidos ({orders.length})
        </button>
        {/* ✅ Nueva pestaña */}
        <button
          className={`tab-button ${activeTab === "calendario" ? "active" : ""}`}
          onClick={() => setActiveTab("calendario")}
        >
          📅 Calendario de Entregas
        </button>
      </div>

      {/* ── Stats (solo en productos y pedidos) ── */}
      {activeTab !== "calendario" && (
        <main className="admin-main">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Productos</h3>
              <p className="stat-number">{menuItems.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Pedidos</h3>
              <p className="stat-number">{orders.length}</p>
            </div>
            <div className="stat-card">
              <h3>Pedidos Pendientes</h3>
              <p className="stat-number">
                {orders.filter(o =>
                  !["LISTO","ENTREGADO"].includes(String(o.estado_pedido||"").toUpperCase())
                ).length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Pagos Pendientes</h3>
              <p className="stat-number">
                {orders.filter(o =>
                  String(o.estado_pago||"").toUpperCase() === "NO_PAGADO"
                ).length}
              </p>
            </div>
          </div>

          {/* ── PRODUCTOS ────────────────────── */}
          {activeTab === "products" && (
            <>
              <div className="action-bar">
                <button className="btn-primary" onClick={handleCreate}>
                  + Agregar Producto
                </button>
                <div className="search-bar">
                  <input type="text" placeholder="Buscar productos..."
                         className="search-input" />
                </div>
              </div>
              <div className="table-container">
                {menuItems.length === 0 ? (
                  <div className="empty-state">
                    <h3>No hay productos registrados</h3>
                    <p>Comienza agregando tu primer producto</p>
                  </div>
                ) : (
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Imagen</th><th>Nombre</th><th>Precio</th>
                        <th>Categoría</th><th>Descripción</th>
                        <th>Ingredientes</th><th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div className="product-image-cell">
                              <Image src={item.image || "/default-cookie.png"}
                                     alt={item.name || "Producto"}
                                     width={100} height={100}
                                     className="product-thumbnail" />
                            </div>
                          </td>
                          <td><strong>{item.name}</strong></td>
                          <td><span className="price-tag">
                            ${Number(item.price||0).toFixed(2)}
                          </span></td>
                          <td><span className={`category-tag ${item.category||""}`}>
                            {item.category}
                          </span></td>
                          <td><div className="description-cell">{item.description}</div></td>
                          <td><div className="ingredients-cell">
                            {Array.isArray(item.ingredients)
                              ? item.ingredients.slice(0,2).join(", ")
                              : item.ingredients}
                            {Array.isArray(item.ingredients) && item.ingredients.length > 2 && "..."}
                          </div></td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-edit" onClick={() => handleEdit(item)}>
                                Editar
                              </button>
                              <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── PEDIDOS ──────────────────────── */}
          {activeTab === "orders" && (
            <>
              <div className="action-bar">
                <button className="btn-secondary" onClick={loadOrders}>
                  ↻ Actualizar Pedidos
                </button>
              </div>
              <div className="table-container">
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <h3>No hay pedidos registrados</h3>
                    <p>Los pedidos aparecerán aquí cuando los clientes compren</p>
                  </div>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Fecha</th><th>Cliente</th>
                        <th>Productos</th><th>Total</th>
                        <th>Estado Pedido</th><th>Estado Pago</th><th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id_pedido}>
                          <td><strong>#{order.id_pedido}</strong></td>
                          <td>{formatDate(order.fecha_pedido)}</td>
                          <td>
                            <strong>{order.nombre_cliente}</strong><br/>
                            {order.email_cliente}<br/>
                            {order.telefono_cliente}
                          </td>
                          <td>
                            <div className="order-items">
                              {order.items?.map((it,idx) => (
                                <div key={idx} className="order-item">
                                  {it.cantidad}x {it.nombre_producto}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className="price-tag">
                              ${Number(order.total_pedido||0).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <select
                              value={String(order.estado_pedido||"PENDIENTE").toUpperCase()}
                              className={`status-select ${getStatusClass(order.estado_pedido)}`}
                              onChange={e => handleOrderStatusChange(order.id_pedido, e.target.value)}
                            >
                              {Object.entries(ESTADO_PEDIDO_MAP).map(([k,v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={String(order.estado_pago||"NO_PAGADO").toUpperCase()}
                              className={`status-select ${getPaymentStatusClass(order.estado_pago)}`}
                              onChange={e => handlePaymentStatusChange(order.id_pedido, e.target.value)}
                            >
                              {Object.entries(ESTADO_PAGO_MAP).map(([k,v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button className="btn-edit"
                              onClick={() => setActiveTab("calendario")}>
                              📅 Ver en calendario
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      )}

      {/* ── CALENDARIO ───────────────────────── */}
      {activeTab === "calendario" && (
        <CalendarioEntregas
          orders={orders}
          onUpdateEstado={handleUpdateEstado}
        />
      )}

      {/* Modal productos */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h2>{editingItem ? "Editar Producto" : "Crear Producto"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input type="text" name="name" value={formData.name}
                         onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Precio ($) *</label>
                  <input type="number" name="price" step="0.01" min="0"
                         value={formData.price} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría *</label>
                  <select name="category" value={formData.category}
                          onChange={handleInputChange} required>
                    <option value="">Seleccionar categoría</option>
                    <option value="clasicas">Clásicas</option>
                    <option value="especiales">Especiales</option>
                    <option value="halloween">Halloween</option>
                    <option value="navidenas">Navideñas</option>
                    <option value="veganas">Veganas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>URL de la Imagen *</label>
                  <input type="url" name="image" value={formData.image}
                         onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Descripción *</label>
                <textarea name="description" value={formData.description}
                          onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Ingredientes *</label>
                <textarea name="ingredients" value={formData.ingredients}
                          onChange={handleInputChange} required />
                <small>Separar con comas (,)</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary"
                        onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? "Actualizar" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}