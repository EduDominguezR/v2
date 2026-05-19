"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ── Mini calendario ──────────────────────────────────────────
function DatePicker({ selectedDate, onSelectDate, diasNoDisponibles = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const toKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDayStatus = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    const key = toKey(date);

    if (date < today) return "pasado";

    const info = diasNoDisponibles.find((d) => d.fecha === key);
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
        <span className="dp-month">
          {MESES[viewMonth].toUpperCase()} {viewYear}
        </span>
        <button className="dp-arrow" onClick={nextMonth}>▶</button>
      </div>

      <div className="dp-grid">
        {DIAS.map((d) => (
          <div key={d} className="dp-weekday">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const status = getDayStatus(day);
          const date = new Date(viewYear, viewMonth, day);
          const key = toKey(date);
          const isSelected = selectedDate === key;
          const isDisabled =
            status === "pasado" || status === "festivo" || status === "cerrado";

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
                status === "festivo"
                  ? "Día festivo"
                  : status === "cerrado"
                  ? "Pedidos cerrados"
                  : status === "por_cerrar"
                  ? "Pocos lugares disponibles"
                  : ""
              }
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="dp-legend">
        <span className="dp-legend-item">
          <span className="dp-dot dot-porcerrar" />
          Pocos lugares
        </span>
        <span className="dp-legend-item">
          <span className="dp-dot dot-festivo" />
          Día festivo
        </span>
        <span className="dp-legend-item">
          <span className="dp-dot dot-cerrado" />
          Cerrado
        </span>
        <span className="dp-legend-item">
          <span className="dp-dot dot-disponible" />
          Disponible
        </span>
      </div>
    </div>
  );
}

// ── CartPage principal ───────────────────────────────────────
const WHATSAPP_NUMBER = "526641234567";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generando, setGenerando] = useState(false);

  const [fechaEntrega, setFechaEntrega] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const getItemPrice = (item) => item.precio || item.price || 0;
  const getItemName = (item) => item.nombre || item.name || "Producto sin nombre";
  const getItemDescription = (item) => item.descripcion || item.description || "";
  const getItemImage = (item) => item.imagen || item.image || "/cookie-placeholder.png";
  const getItemType = (item) => item.tipo || item.type || "";

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(itemId);

    const updated = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    setCart(updated);
    localStorage.setItem("spookyCart", JSON.stringify(updated));
  };

  const removeFromCart = (itemId) => {
    const updated = cart.filter((item) => item.id !== itemId);
    setCart(updated);
    localStorage.setItem("spookyCart", JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("spookyCart");
  };

  const cartSubtotal = cart.reduce(
    (t, item) => t + getItemPrice(item) * (item.quantity || 1),
    0
  );

  const totalItems = cart.reduce((t, item) => t + (item.quantity || 1), 0);

  const formatFecha = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const generarPDF = () => {
    return new Promise((resolve, reject) => {
      if (window.jspdf?.jsPDF) {
        resolve(window.jspdf.jsPDF);
        return;
      }

      const existing = document.querySelector('script[data-jspdf="true"]');
      if (existing) {
        existing.addEventListener("load", () => {
          if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
          else reject(new Error("jsPDF cargó pero no está disponible"));
        });
        existing.addEventListener("error", () =>
          reject(new Error("No se pudo cargar jsPDF"))
        );
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      script.dataset.jspdf = "true";
      script.onload = () => {
        if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error("jsPDF cargó pero no está disponible"));
      };
      script.onerror = () => reject(new Error("No se pudo cargar jsPDF"));
      document.head.appendChild(script);
    });
  };

  const handleGenerarPDF = async () => {
    if (cart.length === 0) {
      alert("Tu cesta está vacía");
      return;
    }

    if (!fechaEntrega) {
      alert("Selecciona una fecha de entrega primero");
      return;
    }

    setGenerando(true);

    try {
      const jsPDF = await generarPDF();
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentW = pageW - margin * 2;

      const colors = {
        primary: [211, 74, 130],
        primaryDark: [177, 50, 108],
        primarySoft: [244, 221, 232],
        rowAlt: [252, 247, 250],
        card: [250, 250, 250],
        line: [224, 224, 224],
        text: [32, 32, 32],
        muted: [110, 110, 110],
        totalBg: [249, 237, 243],
      };

      const money = (value) =>
        new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          minimumFractionDigits: 2,
        }).format(Number(value || 0));

      const safeText = (value) => {
        if (value === null || value === undefined) return "-";
        return String(value)
          .replace(/[^\u0000-\u00FF]/g, "")
          .replace(/\s+/g, " ")
          .trim() || "-";
      };

      let y = 0;

      const drawHeader = () => {
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageW, 34, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("SpookyCookie", margin, 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Cotización de pedido", margin, 21);
        doc.text(
          `Generada: ${new Date().toLocaleDateString("es-ES")}`,
          margin,
          27
        );

        y = 42;
      };

      const drawInfoBox = (title, rows) => {
        const boxX = margin;
        const boxY = y;
        const boxW = contentW;
        const lineH = 6;
        const titleH = 8;
        const padding = 5;
        const boxH = titleH + padding + rows.length * lineH + 4;

        doc.setFillColor(...colors.card);
        doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, "F");

        doc.setDrawColor(...colors.line);
        doc.setLineWidth(0.4);
        doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, "S");

        doc.setFillColor(...colors.primarySoft);
        doc.roundedRect(boxX, boxY, boxW, titleH, 3, 3, "F");
        doc.rect(boxX, boxY + titleH - 1.5, boxW, 1.5, "F");

        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(title, boxX + padding, boxY + 5.4);

        let rowY = boxY + titleH + 6;
        rows.forEach(({ label, value }) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(...colors.text);
          doc.text(`${label}:`, boxX + padding, rowY);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          doc.text(safeText(value), boxX + 34, rowY);

          rowY += lineH;
        });

        y += boxH + 8;
      };

      const drawTableHeader = () => {
        doc.setFillColor(...colors.primarySoft);
        doc.roundedRect(margin, y, contentW, 8, 2, 2, "F");

        doc.setTextColor(...colors.text);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);

        doc.text("Producto", margin + 3, y + 5.2);
        doc.text("Cant.", 132, y + 5.2, { align: "right" });
        doc.text("P. Unit.", 160, y + 5.2, { align: "right" });
        doc.text("Subtotal", 192, y + 5.2, { align: "right" });

        y += 10;
      };

      const ensureSpace = (required, repeatTableHeader = false) => {
        const footerReserve = 24;
        if (y + required > pageH - margin - footerReserve) {
          doc.addPage();
          y = margin;

          doc.setTextColor(...colors.muted);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("SpookyCookie", margin, y);
          y += 6;

          if (repeatTableHeader) drawTableHeader();
        }
      };

      const drawFooter = () => {
        const footerY = pageH - 18;

        doc.setDrawColor(...colors.line);
        doc.setLineWidth(0.4);
        doc.line(margin, footerY - 4, pageW - margin, footerY - 4);

        doc.setTextColor(...colors.muted);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.8);
        doc.text(
          "Esta cotización es válida por 7 días. Compártela por WhatsApp para confirmar tu pedido.",
          margin,
          footerY
        );

        doc.setFont("helvetica", "normal");
        doc.text(`Contacto: ${WHATSAPP_NUMBER}`, margin, footerY + 5);
      };

      drawHeader();

      drawInfoBox("Datos del cliente", [
        { label: "Nombre", value: user ? user.nombre || user.name || "-" : "Sin sesión iniciada" },
        { label: "Email", value: user ? user.email || "-" : "-" },
        { label: "Teléfono", value: user ? user.telefono || "-" : "-" },
      ]);

      drawInfoBox("Entrega", [
        { label: "Fecha", value: formatFecha(fechaEntrega) },
        { label: "Estado", value: "Pendiente de confirmación" },
      ]);

      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 2, pageW - margin, y - 2);
      y += 4;

      drawTableHeader();

      cart.forEach((item, idx) => {
        const cantidad = item.quantity || 1;
        const precio = getItemPrice(item);
        const subtotal = precio * cantidad;
        const nombre = safeText(getItemName(item));

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);

        const nameLines = doc.splitTextToSize(nombre, 92);
        const rowH = Math.max(8, nameLines.length * 4.6 + 2);

        ensureSpace(rowH + 2, true);

        if (idx % 2 === 0) {
          doc.setFillColor(...colors.rowAlt);
          doc.roundedRect(margin, y - 1.5, contentW, rowH, 1.5, 1.5, "F");
        }

        doc.setTextColor(...colors.text);
        doc.text(nameLines, margin + 3, y + 3.5);

        doc.setTextColor(...colors.muted);
        doc.text(String(cantidad), 132, y + 3.5, { align: "right" });
        doc.text(money(precio), 160, y + 3.5, { align: "right" });
        doc.text(money(subtotal), 192, y + 3.5, { align: "right" });

        y += rowH + 1.5;
      });

      ensureSpace(24);

      y += 4;
      doc.setDrawColor(...colors.primaryDark);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 6;

      doc.setFillColor(...colors.totalBg);
      doc.roundedRect(margin, y, contentW, 18, 3, 3, "F");

      doc.setDrawColor(...colors.primarySoft);
      doc.roundedRect(margin, y, contentW, 18, 3, 3, "S");

      doc.setTextColor(...colors.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Total de la cotización", margin + 4, y + 11);

      doc.setTextColor(...colors.primaryDark);
      doc.setFontSize(15);
      doc.text(money(cartSubtotal), pageW - margin - 4, y + 11, { align: "right" });

      drawFooter();

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${totalPages}`, pageW - margin, pageH - 8, {
          align: "right",
        });
      }

      doc.save(`cotizacion-spookycookie-${fechaEntrega}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error al generar el PDF. Intenta de nuevo.");
    } finally {
      setGenerando(false);
    }
  };

  const handleWhatsApp = () => {
    if (cart.length === 0) {
      alert("Tu cesta está vacía");
      return;
    }

    if (!fechaEntrega) {
      alert("Selecciona una fecha de entrega primero 📅");
      return;
    }

    const lineas = cart.map((item) => {
      const cantidad = item.quantity || 1;
      const precio = getItemPrice(item);
      return `• ${getItemName(item)} x${cantidad} = $${(precio * cantidad).toFixed(2)}`;
    });

    const nombre = user ? user.nombre || user.name || "Cliente" : "Cliente";

    const mensaje =
`🍪 *Cotización SpookyCookie*
━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${nombre}
📅 *Fecha de entrega:* ${formatFecha(fechaEntrega)}
━━━━━━━━━━━━━━━━━━
*Productos:*
${lineas.join("\n")}
━━━━━━━━━━━━━━━━━━
💰 *Total: $${cartSubtotal.toFixed(2)}*
━━━━━━━━━━━━━━━━━━
📎 También te adjunto el PDF con la cotización.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
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

  const puedeConfirmar = cart.length > 0 && fechaEntrega;

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
            <button
              className="pill ghost"
              onClick={() => router.push("/login?redirect=cart")}
            >
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
              <div className="cart-items-section">
                <div className="cart-items-header">
                  <h2>Productos ({totalItems})</h2>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={clearCart}
                  >
                    Vaciar Cesta
                  </button>
                </div>

                <div className="cart-items-list">
                  {cart.map((item) => {
                    const price = getItemPrice(item);
                    const quantity = item.quantity || 1;
                    const itemTotal = price * quantity;

                    return (
                      <div key={item.id} className="cart-item-card">
                        <div className="cart-item-image">
                          <Image
                            src={getItemImage(item)}
                            alt={getItemName(item)}
                            width={100}
                            height={100}
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
                            <button
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                            >
                              −
                            </button>
                            <span className="quantity-display">{quantity}</span>
                            <button
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-item-total">${itemTotal.toFixed(2)}</div>

                          <button
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                            title="Eliminar producto"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="delivery-section">
                  <div className="delivery-header">
                    <h2>📅 Fecha de entrega</h2>
                    <p className="delivery-hint">
                      Elige el día en que quieres recibir tu pedido
                    </p>
                  </div>

                  <button
                    className={`delivery-toggle-btn ${fechaEntrega ? "has-date" : ""}`}
                    onClick={() => setShowDatePicker((v) => !v)}
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
                        onClick={() => {
                          setFechaEntrega(null);
                          setShowDatePicker(true);
                        }}
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>
              </div>

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

                  {!fechaEntrega && (
                    <div className="date-required-hint">
                      📅 Selecciona una fecha de entrega para continuar
                    </div>
                  )}

                  <button
                    className="btn btn-primary checkout-btn"
                    onClick={handleGenerarPDF}
                    disabled={!puedeConfirmar || generando}
                    style={{ marginBottom: "0.75rem" }}
                  >
                    {generando ? "Generando PDF..." : "📄 Descargar Cotización PDF"}
                  </button>

                  <button
                    className="btn checkout-btn"
                    onClick={handleWhatsApp}
                    disabled={!puedeConfirmar}
                    style={{
                      backgroundColor: puedeConfirmar ? "#25D366" : "#ccc",
                      color: "white",
                      marginBottom: "0.75rem",
                    }}
                  >
                    💬 Enviar por WhatsApp
                  </button>

                  <button
                    className="btn btn-secondary continue-btn"
                    onClick={continueShopping}
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