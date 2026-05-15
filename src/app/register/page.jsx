"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rol, setRol] = useState("cliente");
  const [contraseña, setContraseña] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, correo, direccion, rol, contraseña }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Usuario registrado correctamente");
        router.push("/login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Registro </h2>
        <h1>Spooky Cookie</h1>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={e => setContraseña(e.target.value)}
          required
          disabled={isLoading}
        />

        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-primary ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push("/login")}
            disabled={isLoading}
          >
            Ya tengo cuenta
          </button>
        </div>
      </form>
    </div>
  );
}
