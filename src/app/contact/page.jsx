"use client";
import { useState } from "react";

// Cambia este número por el real de WhatsApp (con código de país)
const WHATSAPP_NUMBER = "526621234567";
const WHATSAPP_MSG = encodeURIComponent("Hola! Me gustaría hacer un pedido ");

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
      {/* Header */}
      <header className="header">
        <div className="logo"><span>SpookyCookie</span></div>
        <nav className="nav">
          <a className="pill ghost" href="/menu">Menú</a>
          <a className="pill primary" href="/">Inicio</a>
        </nav>
      </header>

      <main className="contacto-main">
        <div className="contacto-wrapper">

          {/* ── Columna izquierda: info ── */}
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

            {/* WhatsApp — acción principal */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-cta"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escríbenos por WhatsApp
            </a>

            <p className="whatsapp-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
              Respondemos a más tardar en 24 horas
            </p>

            {/* Info adicional */}
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
                <span>Calle Dulce 123, Ciudad Galleta</span>
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

            {/* Redes sociales */}
            <div className="redes">
              <span className="redes-label">Síguenos</span>
              <div className="redes-row">
                <a href="#" className="red-btn" aria-label="Instagram">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.75">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a href="#" className="red-btn" aria-label="Facebook">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.75">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="red-btn" aria-label="TikTok">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.78a4.85 4.85 0 01-1.02-.09z"/>
                  </svg>
                </a>
              </div>
            </div>
          </aside>

          {/* ── Columna derecha: formulario ── */}
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