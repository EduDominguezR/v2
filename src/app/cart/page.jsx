"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ── Mini calendario ──────────────────────────────────────────
function DatePicker({ selectedDate, onSelectDate, diasNoDisponibles = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                 "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DIAS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

  const firstDay    = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const toKey = (d) => d.toISOString().split("T")[0];

  const getDayStatus = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    const key  = toKey(date);
    if (date < today) return "pasado";
    const info = diasNoDisponibles.find(d => d.fecha === key);
    if (!info) return "disponible";
    return info.tipo;
  };

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="datepicker">
      <div className="dp-nav">
        <button className="dp-arrow" onClick={prevMonth}>◀</button>
        <span className="dp-month">{MESES[viewMonth].toUpperCase()} {viewYear}</span>
        <button className="dp-arrow" onClick={nextMonth}>▶</button>
      </div>

      <div className="dp-grid">
        {DIAS.map(d => (
          <div key={d} className="dp-weekday">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const status     = getDayStatus(day);
          const date       = new Date(viewYear, viewMonth, day);
          const key        = toKey(date);
          const isSelected = selectedDate === key;
          const isDisabled = status === "pasado" || status === "festivo" || status === "cerrado";

          return (
            <button
              key={key}
              className={[
                "dp-day",
                `dp-day--${status}`,
                isSelected ? "dp-day--selected" : "",
                isDisabled ? "dp-day--disabled" : "",
              ].join(" ")}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectDate(key)}
              title={
                status === "festivo"    ? "Día festivo" :
                status === "cerrado"    ? "Pedidos cerrados" :
                status === "por_cerrar" ? "Pocos lugares disponibles" : ""
              }
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="dp-legend">
        <span className="dp-legend-item"><span className="dp-dot dot-porcerrar"/>Pocos lugares</span>
        <span className="dp-legend-item"><span className="dp-dot dot-festivo"/>Día festivo</span>
        <span className="dp-legend-item"><span className="dp-dot dot-cerrado"/>Cerrado</span>
        <span className="dp-legend-item"><span className="dp-dot dot-disponible"/>Disponible</span>
      </div>
    </div>
  );
}

// ── CartPage principal ───────────────────────────────────────
export default function CartPage() {
  const [cart, setCart]           = useState([]);
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fechaEntrega, setFechaEntrega]           = useState(null);
  const [showDatePicker, setShowDatePicker]       = useState(false);
  const [diasNoDisponibles, setDiasNoDisponibles] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedCart = localStorage.getItem("spookyCart");
        const storedUser = localStorage.getItem("usuario");
        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedUser) setUser(JSON.parse(storedUser));
        try {
          const res = await fetch("/api/disponibilidad");
          if (res.ok) setDiasNoDisponibles(await res.json());
        } catch (_) {}
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const getItemPrice       = (item) => item.precio      || item.price       || 0;
  const getItemName        = (item) => item.nombre       || item.name        || "Producto sin nombre";
  const getItemDescription = (item) => item.descripcion  || item.description || "";
  const getItemImage       = (item) => item.imagen       || item.image       || "/cookie-placeholder.png";
  const getItemType        = (item) => item.tipo         || item.type        || "";

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(itemId);
    const updated = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updated);
    localStorage.setItem("spookyCart", JSON.stringify(updated));
  };

  const removeFromCart = (itemId) => {
    const updated = cart.filter(item => item.id !== itemId);
    setCart(updated);
    localStorage.setItem("spookyCart", JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("spookyCart");
  };

  const cartSubtotal = cart.reduce((t, item) =>
    t + getItemPrice(item) * (item.quantity || 1), 0);
  const totalItems = cart.reduce((t, item) =>
    t + (item.quantity || 1), 0);

  const formatFecha = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const handleCheckout = async () => {
    if (!user) { router.push("/login?redirect=cart"); return; }
    if (cart.length === 0) { alert("Tu cesta está vacía"); return; }
    if (!fechaEntrega) {
      setShowDatePicker(true);
      alert("Por favor selecciona una fecha de entrega 📅");
      return;
    }

    try {
      setIsLoading(true);
      const pedidoData = {
        id_cliente:    user.id_cliente,
        fecha_pedido:  new Date().toISOString().split("T")[0],
        fecha_entrega: fechaEntrega,
        estado_pago:   "NO_PAGADO",
        detalles: cart.map(item => ({
          id_producto:     item.id,
          cantidad:        item.quantity || 1,
          precio_unitario: getItemPrice(item),
        })),
      };

      const response = await fetch("/api/clientes/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error en el servidor");

      clearCart();
      alert(`¡Cotización confirmada! #${data.id_pedido}\nEntrega: ${formatFecha(fechaEntrega)}\nTotal: $${cartSubtotal.toFixed(2)}`);
    } catch (error) {
      console.error("Error durante el checkout:", error);
      alert("Error al procesar la cotización. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const continueShopping = () => router.push("/menu");

  if (isLoading) {
    return (
      <div className="app-shell">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Cargando cesta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="header">
        <Link href="/" className="logo">
          <Image src="/cookie.png" alt="SpookyCookie Logo" width={50} height={50} />
          <span>SpookyCookie</span>
        </Link>
        <nav className="nav">
          <Link href="/menu" className="pill ghost">Volver al Menú</Link>
          {user ? (
            <div className="user-section">
              <span className="user-greeting">Hola, {user.nombre}</span>
            </div>
          ) : (
            <button className="pill ghost"
              onClick={() => router.push("/login?redirect=cart")}>
              Iniciar sesión
            </button>
          )}
        </nav>
      </header>

      <main className="cart-page">
        <div className="cart-header">
          <h1 className="cart-title">🧺 Tu Cesta de Cotización</h1>
          <p className="cart-subtitle">
            {totalItems > 0
              ? `Tienes ${totalItems} producto${totalItems !== 1 ? "s" : ""} en tu cesta`
              : "Tu cesta está vacía"}
          </p>
        </div>

        <div className="cart-container">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🧺</div>
              <h2>Tu cesta está vacía</h2>
              <p>¡Descubre nuestras deliciosas galletas Spooky!</p>
              <button className="btn btn-primary" onClick={continueShopping}>
                Explorar Menú
              </button>
            </div>
          ) : (
            <>
              {/* ── Lista de productos ── */}
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <h2>Productos ({totalItems})</h2>
                  <button className="btn btn-secondary btn-small" onClick={clearCart}>
                    Vaciar Cesta
                  </button>
                </div>

                <div className="cart-items-list">
                  {cart.map((item) => {
                    const price     = getItemPrice(item);
                    const quantity  = item.quantity || 1;
                    const itemTotal = price * quantity;
                    return (
                      <div key={item.id} className="cart-item-card">
                        <div className="cart-item-image">
                          <Image
                            src={getItemImage(item)}
                            alt={getItemName(item)}
                            width={100} height={100}
                            className="item-image"
                          />
                        </div>
                        <div className="cart-item-details">
                          <h3 className="cart-item-name">{getItemName(item)}</h3>
                          <p className="cart-item-description line-clamp-2">
                            {getItemDescription(item)}
                          </p>
                          <div className="cart-item-type">{getItemType(item)}</div>
                          <div className="cart-item-price">${price.toFixed(2)} c/u</div>
                        </div>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button className="quantity-btn"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              disabled={isLoading}>−</button>
                            <span className="quantity-display">{quantity}</span>
                            <button className="quantity-btn"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              disabled={isLoading}>+</button>
                          </div>
                          <div className="cart-item-total">${itemTotal.toFixed(2)}</div>
                          <button className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isLoading} title="Eliminar producto">×</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Selector de fecha ── */}
                <div className="delivery-section">
                  <div className="delivery-header">
                    <h2>📅 Fecha de entrega</h2>
                    <p className="delivery-hint">
                      Elige el día en que quieres recibir tu pedido
                    </p>
                  </div>

                  <button
                    className={`delivery-toggle-btn ${fechaEntrega ? "has-date" : ""}`}
                    onClick={() => setShowDatePicker(v => !v)}
                  >
                    {fechaEntrega
                      ? `📦 Entrega: ${formatFecha(fechaEntrega)}`
                      : "Seleccionar fecha de entrega"}
                    <span className="toggle-chevron">{showDatePicker ? "▲" : "▼"}</span>
                  </button>

                  {showDatePicker && (
                    <div className="datepicker-wrapper">
                      <DatePicker
                        selectedDate={fechaEntrega}
                        onSelectDate={(date) => {
                          setFechaEntrega(date);
                          setShowDatePicker(false);
                        }}
                        diasNoDisponibles={diasNoDisponibles}
                      />
                    </div>
                  )}

                  {fechaEntrega && (
                    <div className="delivery-confirmed">
                      <span className="delivery-confirmed-icon">✅</span>
                      <div>
                        <strong>{formatFecha(fechaEntrega)}</strong>
                        <p>Tu pedido llegará este día</p>
                      </div>
                      <button
                        className="delivery-change-btn"
                        onClick={() => { setFechaEntrega(null); setShowDatePicker(true); }}
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Resumen ── */}
              <div className="cart-summary">
                <div className="summary-card">
                  <h3>Resumen de Cotización</h3>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Envío:</span>
                      <span>Gratis</span>
                    </div>
                    {fechaEntrega && (
                      <div className="summary-row">
                        <span>Entrega:</span>
                        <span className="summary-date">{formatFecha(fechaEntrega)}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {!user && (
                    <div className="login-prompt">
                      <p>💡 Inicia sesión para completar tu cotización</p>
                    </div>
                  )}

                  {!fechaEntrega && cart.length > 0 && (
                    <div className="date-required-hint">
                      📅 Selecciona una fecha de entrega para continuar
                    </div>
                  )}

                  <button
                    className={`btn ${
                      cart.length === 0 || !fechaEntrega ? "btn-disabled" : "btn-primary"
                    } checkout-btn`}
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isLoading || !fechaEntrega}
                  >
                    {isLoading
                      ? "Procesando..."
                      : !user
                      ? "Inicia Sesión para Cotizar"
                      : !fechaEntrega
                      ? "Elige una fecha primero"
                      : "Confirmar Cotización"}
                  </button>

                  <button
                    className="btn btn-secondary continue-btn"
                    onClick={continueShopping}
                    disabled={isLoading}
                  >
                    Seguir Explorando
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SpookyCookie
      </footer>
    </div>
  );
}