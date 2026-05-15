"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedCart = localStorage.getItem("spookyCart");
        const storedUser = localStorage.getItem("usuario");

        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedUser) setUser(JSON.parse(storedUser));
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
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("spookyCart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("spookyCart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("spookyCart");
  };

  const cartSubtotal = cart.reduce((total, item) => {
    const price = getItemPrice(item);
    const quantity = item.quantity || 1;
    return total + price * quantity;
  }, 0);

  const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login?redirect=cart");
      return;
    }

    if (cart.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    try {
      setIsLoading(true);

      // Datos del pedido
      const pedidoData = {
        id_cliente: user.id_cliente,
        fecha_pedido: new Date().toISOString().split("T")[0],
        estado_pago: "NO_PAGADO",
        detalles: cart.map((item) => ({
          id_producto: item.id,
          cantidad: item.quantity || 1,
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

      // Confirmación
      clearCart();
      alert(
        `¡Pedido confirmado! #${data.id_pedido}\nTotal: $${cartSubtotal.toFixed(
          2
        )}`
      );
    } catch (error) {
      console.error("Error durante el checkout:", error);
      alert("Error al procesar el pedido. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };


  const continueShopping = () => router.push("/menu");

  if (isLoading) {
    return (
      <div className="app-shell">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando carrito...</p>
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
          <Link href="/menu" className="pill ghost">
            Volver al Menú
          </Link>
          {user ? (
            <div className="user-section">
              <span className="user-greeting">Hola, {user.nombre}</span>
            </div>
          ) : (
            <button className="pill ghost" onClick={() => router.push("/login?redirect=cart")}>
              Iniciar sesión
            </button>
          )}
        </nav>
      </header>

      <main className="cart-page">
        <div className="cart-header">
          <h1 className="cart-title">Tu Carrito de Compras</h1>
          <p className="cart-subtitle">
            {totalItems > 0
              ? `Tienes ${totalItems} producto${totalItems !== 1 ? "s" : ""} en tu carrito`
              : "Tu carrito está vacío"}
          </p>
        </div>

        <div className="cart-container">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Tu carrito está vacío</h2>
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
                  <button className="btn btn-secondary btn-small" onClick={clearCart}>
                    Vaciar Carrito
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
                              disabled={isLoading}
                            >
                              -
                            </button>
                            <span className="quantity-display">{quantity}</span>
                            <button
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              disabled={isLoading}
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-item-total">${itemTotal.toFixed(2)}</div>

                          <button
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isLoading}
                            title="Eliminar producto"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="cart-summary">
                <div className="summary-card">
                  <h3>Resumen del Pedido</h3>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Envío:</span>
                      <span>Gratis</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {!user && (
                    <div className="login-prompt">
                      <p>💡 Inicia sesión para completar tu compra</p>
                    </div>
                  )}

                  <button
                    className={`btn ${
                      cart.length === 0 ? "btn-disabled" : "btn-primary"
                    } checkout-btn`}
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isLoading}
                  >
                    {isLoading
                      ? "Procesando..."
                      : user
                      ? "Finalizar Compra"
                      : "Iniciar Sesión para Comprar"}
                  </button>

                  <button
                    className="btn btn-secondary continue-btn"
                    onClick={continueShopping}
                    disabled={isLoading}
                  >
                    Seguir Comprando
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
