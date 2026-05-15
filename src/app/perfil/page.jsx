"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const [usuario, setUsuario]     = useState(null);
  const [pedidos, setPedidos]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("datos");

  // ── Estado del modal de edición ──────────────
  const [editando, setEditando]   = useState(false);
  const [form, setForm]           = useState({ nombre: "", telefono: "", direccion: "" });
  const [guardando, setGuardando] = useState(false);
  const [editError, setEditError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.rol === "admin") {
            router.replace("/admin/dashboard");
            return;
          }
          setUsuario(userData);
          setForm({
            nombre:    userData.nombre    || "",
            telefono:  userData.telefono  || "",
            direccion: userData.direccion || "",
          });
          if (userData.id_cliente) await cargarPedidosUsuario(userData.id_cliente);
          setLoading(false);
          return;
        }
        router.replace("/login");
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    const cargarPedidosUsuario = async (idCliente) => {
      try {
        const response = await fetch(`/api/clientes/pedidos?id_cliente=${idCliente}`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) setPedidos(await response.json());
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      }
    };

    cargarPerfil();
  }, []);

  // ── Abrir / cerrar modal ─────────────────────
  const abrirEdicion = () => {
    setForm({
      nombre:    usuario.nombre    || "",
      telefono:  usuario.telefono  || "",
      direccion: usuario.direccion || "",
    });
    setEditError("");
    setEditando(true);
  };

  // ── Guardar cambios ──────────────────────────
  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setEditError("El nombre no puede estar vacío.");
      return;
    }
    setGuardando(true);
    setEditError("");

    try {
      const res = await fetch("/api/clientes/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: usuario.id_cliente,
          nombre:     form.nombre.trim(),
          telefono:   form.telefono.trim(),
          direccion:  form.direccion.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");

      // Actualizar estado y localStorage
      const usuarioActualizado = { ...usuario, ...form };
      setUsuario(usuarioActualizado);
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      setEditando(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("usuario");
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (_) {}
    router.push("/login");
  };

  // ── Loading / sin usuario ────────────────────
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="perfil-page">
        <div className="profile-login-prompt">
          <h1>Inicia sesión para ver tu perfil</h1>
          <p>Debes iniciar sesión para acceder a tu perfil y ver tus pedidos.</p>
          <button className="btn btn-primary" onClick={() => router.push("/login")}>
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      {/* ── Modal de edición ── */}
      {editando && (
        <div className="edit-overlay" onClick={() => setEditando(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Editar información</h2>
              <button className="edit-close-btn" onClick={() => setEditando(false)}>×</button>
            </div>

            <form className="edit-form" onSubmit={handleGuardar}>
              <div className="edit-field">
                <label htmlFor="edit-nombre">Nombre completo</label>
                <input
                  id="edit-nombre"
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  disabled={guardando}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="edit-telefono">Teléfono</label>
                <input
                  id="edit-telefono"
                  type="text"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  disabled={guardando}
                  placeholder="Ej. 6641234567"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="edit-direccion">Dirección</label>
                <input
                  id="edit-direccion"
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  disabled={guardando}
                  placeholder="Tu dirección"
                />
              </div>

              {editError && <p className="edit-error">{editError}</p>}

              <div className="edit-actions">
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditando(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Header del perfil ── */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-icon">
            {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
        <div className="profile-welcome">
          <h1>¡Hola, {usuario.nombre}!</h1>
          <p>Bienvenido a tu espacio personal de SpookyCookie</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "datos" ? "active" : ""}`}
          onClick={() => setActiveTab("datos")}
        >
          Mis Datos
        </button>
        <button
          className={`tab-btn ${activeTab === "pedidos" ? "active" : ""}`}
          onClick={() => setActiveTab("pedidos")}
        >
          Mis Pedidos
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "datos" && (
          <div className="profile-data-section">
            <div className="data-card">
              <h2>Información Personal</h2>
              <div className="data-grid">
                <div className="data-item">
                  <span className="data-label">Nombre completo:</span>
                  <span className="data-value">{usuario.nombre}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Correo electrónico:</span>
                  <span className="data-value">{usuario.correo}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Teléfono:</span>
                  <span className="data-value">{usuario.telefono || "No registrado"}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Dirección:</span>
                  <span className="data-value">{usuario.direccion || "No registrada"}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Tipo de cuenta:</span>
                  <span className="data-value role-badge">{usuario.rol}</span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn btn-secondary" onClick={abrirEdicion}>
                Editar información
              </button>
              <button className="btn btn-logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {activeTab === "pedidos" && (
          <div className="orders-section">
            <h2>Historial de Pedidos</h2>
            {pedidos.length > 0 ? (
              <div className="orders-container">
                {pedidos.map((pedido) => (
                  <div key={pedido.id_pedido} className="order-card">
                    <div className="order-header">
                      <div className="order-id">Pedido #{pedido.id_pedido}</div>
                      <div className="order-date">
                        {new Date(pedido.fecha_pedido).toLocaleDateString("es-ES", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge status-${(pedido.estado_pago || "pendiente").toLowerCase()}`}>
                        {pedido.estado_pago || "Pendiente"}
                      </span>
                      <span className={`status-badge status-${(pedido.estado_pedido || "pendiente").toLowerCase()}`}>
                        {pedido.estado_pedido || "Pendiente"}
                      </span>
                      <span className="order-total">
                        Total: ${pedido.total ? pedido.total.toFixed(2) : "0.00"}
                      </span>
                    </div>
                    <div className="order-products">
                      <h4>Productos:</h4>
                      {pedido.productos?.length > 0 ? (
                        <div className="productos-lista">
                          {pedido.productos.map((producto, index) => (
                            <div key={index} className="producto-item">
                              <span className="producto-nombre">{producto.nombre}</span>
                              <span className="producto-cantidad">x{producto.cantidad}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p>Sin productos</p>}
                    </div>
                    <div className="order-actions">
                      <button className="btn btn-small">Ver detalles</button>
                      <button className="btn btn-small btn-secondary">Repetir pedido</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-orders">
                <div className="no-orders-icon">🛒</div>
                <h3>No tienes pedidos realizados</h3>
                <p>¡Descubre nuestras deliciosas galletas y haz tu primer pedido!</p>
                <button className="btn btn-primary" onClick={() => router.push("/menu")}>
                  Ver menú
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}