"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const [usuario, setUsuario] = useState(null);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) setUsuario(JSON.parse(storedUser));
    // Trigger animaciones después de montar
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Chispas
  useEffect(() => {
    const createSpark = () => {
      const spark = document.createElement("div");
      spark.classList.add("spark");
      const colors = ["#e38ca9", "#ffb6c1", "#ffd700", "#a8e6cf", "#ff8e8e", "#d4a5a5"];
      const c = colors[Math.floor(Math.random() * colors.length)];
      spark.style.cssText = `
        background:${c};
        box-shadow:0 0 8px ${c};
        left:${Math.random() * window.innerWidth}px;
        top:${Math.random() * window.innerHeight}px;
      `;
      spark.style.setProperty("--tx", `${(Math.random() - 0.5) * 200}px`);
      spark.style.setProperty("--ty", `${(Math.random() - 0.5) * 200}px`);
      const dur = Math.random() * 1.5 + 0.5;
      spark.style.animation = `sparkAnimation ${dur}s forwards`;
      document.body.appendChild(spark);
      setTimeout(() => spark.parentNode?.removeChild(spark), dur * 1000);
    };

    const id = setInterval(createSpark, 120);
    const onClick = () => { for (let i = 0; i < 10; i++) setTimeout(createSpark, i * 50); };
    document.addEventListener("click", onClick);
    return () => { clearInterval(id); document.removeEventListener("click", onClick); };
  }, []);

  return (
    <div className="app-shell">
      <header className="header">
        <div className="logo"><span>SpookyCookie</span></div>
       <nav className="nav">
  <a className="pill ghost" href="/contact">Contacto</a>
  {usuario ? (
    <button className="pill primary" onClick={() => router.push("/perfil")}>
      {usuario.nombre}
    </button>
  ) : (
    <a className="pill primary" href="/login">Iniciar sesión</a>
  )}
</nav>
      </header>

      <main className="main-content" role="main">
        <section className={`hero-section ${visible ? "hero-visible" : ""}`}>

          {/* Texto izquierda */}
          <div className="hero-text">
            <p className="hero-eyebrow"> Galletas artesanales</p>
            <h1 className="hero-question">
              ¿Qué deseas<br />
              <em className="hero-em">pedir hoy?</em>
            </h1>
            <p className="hero-sub">
              Horneadas con ingredientes premium.<br />
              Elige tu favorita y la llevamos a tu puerta.
            </p>
            <a href="/menu" className="hero-btn">
              Ver el menú
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Imagen derecha */}
          <div className="hero-image-wrap">
            <div className="hero-image-ring">
              <Image
                src="/cookie.png"
                alt="Logo Spooky Cookie"
                width={260}
                height={260}
                className="hero-logo-img"
                priority
              />
            </div>
          </div>

        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SpookyCookie
      </footer>
    </div>
  );
}