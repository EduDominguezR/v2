"use client";
import { useState } from "react";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: ""
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    setSent(true);
    setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div className="logo"><span>SpookyCookie</span></div>
        <nav className="nav">
          <a className="pill ghost" href="/menu">Menú</a>
          <a className="pill primary" href="/">Inicio</a>
        </nav>
      </header>

      <main className="contacto-main">
        <div className="contacto-wrapper">
          <aside className="contacto-info-col">
            <div className="contacto-eyebrow">Hablemos</div>
            <h1 className="contacto-heading">
              ¿Tienes un antojo<br />
              <span className="contacto-accent">o una pregunta?</span>
            </h1>
            <p className="contacto-desc">
              Estamos aquí para ayudarte con tu pedido, resolver dudas
              o simplemente charlar sobre galletas.
            </p>

            <div className="info-list">
              <div className="info-row">
                <span className="info-icon-wrap" aria-hidden>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <span>contacto@spookycookie.com</span>
              </div>

              <div className="info-row">
                <span className="info-icon-wrap" aria-hidden>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span>Ensenada,Baja California,Mexico</span>
              </div>

              <div className="info-row">
                <span className="info-icon-wrap" aria-hidden>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                <span>Lun–Vie: 9:00 – 18:00</span>
              </div>
            </div>

            <div className="redes">
              <span className="redes-label">Síguenos</span>
              <div className="redes-row">
                <a
                  href="https://www.instagram.com/spookycookie_ens/"
                  className="red-btn"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.75">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              </div>
            </div>
          </aside>

          <section className="contacto-form-col">
            <div className="form-card">
              <h2 className="form-title">Envíanos un mensaje</h2>
              <p className="form-subtitle">También puedes escribirnos directamente y te respondemos pronto.</p>

              {sent && (
                <div className="form-success" role="alert">
                  ✓ ¡Mensaje enviado! Te responderemos a más tardar en 24 h.
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <div className="form-row-2">
                  <div className="form-field">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="662 000 0000"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="mensaje">¿Cómo podemos ayudarte?</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    placeholder="Cuéntanos sobre tu pedido, evento especial o cualquier duda..."
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="form-submit">
                  Enviar mensaje
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} SpookyCookie
      </footer>
    </div>
  );
}