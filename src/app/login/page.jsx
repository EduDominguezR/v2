"use client";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showChangePass, setShowChangePass] = useState(false);
  const [changePassData, setChangePassData] = useState({
    email: "",
    nuevaContrasena: "",
    confirmarContrasena: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login:", formData);
  };

  const handleChangePassInput = (e) =>
    setChangePassData({ ...changePassData, [e.target.name]: e.target.value });

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (changePassData.nuevaContrasena !== changePassData.confirmarContrasena) {
      alert("Las contraseñas no coinciden");
      return;
    }

   const handleChangePassword = async (e) => {
  e.preventDefault();

  if (changePassData.nuevaContrasena !== changePassData.confirmarContrasena) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: changePassData.email,
        nuevaContrasena: changePassData.nuevaContrasena,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Contraseña actualizada correctamente");
      setShowChangePass(false);
      setChangePassData({ email: "", nuevaContrasena: "", confirmarContrasena: "" });
    } else {
      alert(data.message || "Error al cambiar contraseña");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión");
  }
};
  };

  return (
    <div className="login-page-wrapper">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Bienvenido</h2>
        <h1>Iniciar sesión</h1>

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowChangePass(true)}
          >
            Cambiar contraseña
          </button>
        </div>
      </form>

      {showChangePass && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Cambiar contraseña</h2>
              <button
                type="button"
                className="edit-close-btn"
                onClick={() => setShowChangePass(false)}
              >
                ×
              </button>
            </div>

            <form className="edit-form" onSubmit={handleChangePassword}>
              <div className="edit-field">
                <label htmlFor="cp-email">Correo electrónico</label>
                <input
                  id="cp-email"
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  value={changePassData.email}
                  onChange={handleChangePassInput}
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="cp-pass">Nueva contraseña</label>
                <input
                  id="cp-pass"
                  type="password"
                  name="nuevaContrasena"
                  placeholder="Nueva contraseña"
                  value={changePassData.nuevaContrasena}
                  onChange={handleChangePassInput}
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="cp-pass2">Confirmar contraseña</label>
                <input
                  id="cp-pass2"
                  type="password"
                  name="confirmarContrasena"
                  placeholder="Confirmar contraseña"
                  value={changePassData.confirmarContrasena}
                  onChange={handleChangePassInput}
                  required
                />
              </div>

              <div className="edit-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowChangePass(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}