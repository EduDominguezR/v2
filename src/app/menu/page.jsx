"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("todas");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Obtener productos desde la API
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("/api/clientes/productos");
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        setMenuItems(data.productos || []);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProductos();
  }, []);

  // Verificar si el usuario está logueado y cargar el carrito al cargar el componente
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("usuario");
      const storedCart = localStorage.getItem("spookyCart");
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    };
    checkAuth();
  }, []);

  const categories = [
    { id: "todas", name: "Todas" },
    { id: "clasicas", name: "Clásicas" },
    { id: "especiales", name: "Especiales" },
    { id: "festivas", name: "Festivas" },
    { id: "veganas", name: "Veganas" }
  ];

  const filteredItems = activeCategory === "todas" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const addToCart = (item) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updatedCart.push({ 
        ...item, 
        quantity: 1,
        precio: item.price,
        nombre: item.name,
        descripcion: item.description,
        imagen: item.image,
        tipo: item.category
      });
    }
    
    setCart(updatedCart);
    localStorage.setItem("spookyCart", JSON.stringify(updatedCart));
    
    // Efecto visual de añadir al carrito
    const button = document.querySelector(`[data-item-id="${item.id}"]`);
    if (button) {
      button.classList.add('added-to-cart');
      setTimeout(() => {
        button.classList.remove('added-to-cart');
      }, 1000);
    }
  };

  const totalItemsInCart = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUser(null);
    setCart([]);
    localStorage.removeItem("spookyCart");
  };

  return (
    <div className="app-shell">
      <header className="header">
        <a href="/" className="logo">
          <Image src="/cookie.png" alt="SpookyCookie Logo" width={50} height={50} />
          <span>SpookyCookie</span>
        </a>
        <nav className="nav">
          <button className="pill primary">Menu</button>
          <button 
            className="pill ghost"
            onClick={() => router.push("/contact")}
          >
            Contacto
          </button>
          
          <button 
            className="cart-icon-btn"
            onClick={() => router.push("/cart")}
            title="Ver carrito"
          >
            <span className="cart-icon">🛒</span>
            {totalItemsInCart > 0 && (
              <span className="cart-badge">
                {totalItemsInCart > 99 ? '99+' : totalItemsInCart}
              </span>
            )}
          </button>

          {user ? (
            <div className="user-section">
              <span className="user-greeting">Hola, {user.nombre ?? user.email ?? "Usuario"}</span>
              <button 
                className="pill ghost"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button 
              className="pill ghost"
              onClick={() => router.push("/login")}
            >
              Iniciar sesión
            </button>
          )}
        </nav>
      </header>

      <main className="menu-page">
        <div className="menu-header">
          <h1 className="menu-title">SPOOKY COOKIE</h1>
          <div className="menu-subtitle">
            Delicias horneadas con un toque misterioso y mucho sabor
          </div>
        </div>

        <div className="menu-categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentPage(1);
              }}
              data-category={category.id}
            >
              {category.name}
            </button>
          ))}
        </div>

        <section className="special-section">
          <div className="special-badge">OFERTA</div>
          <h2 className="special-title">🎃 Combo Halloween 🎃</h2>
          <p className="special-description">
            Consigue nuestro pack especial de 6 galletas surtidas por solo $24.99. 
            Incluye una galleta misteriosa de edición limitada.
          </p>
          <button className="btn btn-primary">Añadir Combo Especial</button>
        </section>

        <div className="menu-grid">
          {paginatedItems.map(item => (
            <div key={item.id} className="menu-item fade-in">
              <div className="item-image-container">
                <Image 
                  src={item.image || "/placeholder.png"} 
                  alt={item.name || "Producto"} 
                  width={300} 
                  height={200} 
                  className="item-image"
                />
              </div>

              <div className="item-content">
                <div className="item-header">
                  <h3 className="item-name">{item.name || "Producto"}</h3>
                  <div className="item-price">${(parseFloat(item.price) || 0).toFixed(2)}</div>
                </div>
                <p className="item-description">{item.description}</p>
                <div className="item-ingredients">
                  {item.ingredients?.map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">{ingredient}</span>
                  ))}
                </div>
                <div className="item-actions">
                  <button 
                    className="btn btn-primary btn-small"
                    onClick={() => addToCart(item)}
                    data-item-id={item.id}
                  >
                    Añadir al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '1rem 1.5rem', backgroundColor: '#0f172a', borderRadius: '0.5rem', color: '#cbd5e1', border: '1px solid #1e293b', fontFamily: 'system-ui, sans-serif' }}>
            <span style={{ fontSize: '14px' }}>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} results</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1} 
                style={{ padding: '0.5rem 1rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.25rem', color: currentPage === 1 ? '#475569' : '#e2e8f0', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{ padding: '0.5rem 0.75rem', backgroundColor: currentPage === i + 1 ? '#334155' : 'transparent', border: 'none', borderRadius: '0.25rem', color: currentPage === i + 1 ? '#fff' : '#cbd5e1', cursor: 'pointer', fontSize: '14px', minWidth: '32px' }}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages} 
                style={{ padding: '0.5rem 1rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.25rem', color: currentPage === totalPages ? '#475569' : '#e2e8f0', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SpookyCookie 
      </footer>
    </div>
  );
}
