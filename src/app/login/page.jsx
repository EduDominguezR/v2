"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Login de prueba para admin
      if (usuario === "admin" && password === "admin123") {
        const adminFake = {
          id: 1,
          nombre: "Administrador",
          usuario: "admin",
          correo: "admin@spookycookie.com",
          rol: "admin",
        };

        const token = btoa(
          JSON.stringify({
            rol: adminFake.rol,
            timestamp: Date.now(),
          })
        );

        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(adminFake));
        router.push("/admin/dashboard");
        return;
      }

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();

      if (data.success) {
        const rol = data.cliente?.rol;
        const token = btoa(
          JSON.stringify({
            rol,
            timestamp: Date.now(),
          })
        );

        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(data.cliente));

        if (data.cliente?.rol === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      alert("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>
          Inicia Sesión <span role="img" aria-label="cookie"></span>
        </h2>
        <h1>Spooky Cookie</h1>

        <input
          type="text"
          placeholder="Usuario o correo"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />

        <div className="form-actions">
          <button
            className={`btn btn-primary ${isLoading ? "loading" : ""}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "VERIFICANDO..." : "Entrar"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push("/register")}
            disabled={isLoading}
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>

        <p style={{ marginTop: "12px", fontSize: "14px", opacity: 0.8 }}>
          Admin de prueba: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </form>
    </div>
  );
}