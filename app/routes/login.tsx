"use client";

import { useEffect, useState } from "react";
import { Form, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { useAuth } from "../lib/auth";
import { API_BASE } from "../lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Panel Admin | Login" },
    { name: "description", content: "Acceso seguro al panel administrativo" },
  ];
}

export default function LoginRoute() {
  const navigate = useNavigate();
  const { login, token, ready, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && token && user?.roles?.includes("admin")) {
      navigate("/app", { replace: true });
    }
  }, [ready, token, user, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/app", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="glass-panel w-full max-w-xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <p className="pill mx-auto">Panel administrativo</p>
          <h1 className="text-3xl font-semibold text-slate-900">Inicia sesión</h1>
          <p className="text-slate-600">Autenticación contra la API: {API_BASE}</p>
        </div>
        <Form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-field"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            required
          />
          <input
            className="input-field"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
          {error ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Validando..." : "Entrar"}
          </button>
        </Form>
      </div>
    </div>
  );
}
