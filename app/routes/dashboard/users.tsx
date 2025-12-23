"use client";

import { useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, fetchUsers, type UserRecord } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta() {
  return [{ title: "Panel | Usuarios" }, { name: "description", content: "Gestión de usuarios" }];
}

export default function UsersRoute() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    cedula: "",
    phone: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchUsers(token);
      setUsers(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / PAGE_SIZE)),
    [users.length]
  );
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [page, users]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await createUser(form, token);
      setMessage("Usuario creado");
      setForm({ email: "", password: "", fullName: "", cedula: "", phone: "" });
      setIsModalOpen(false);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    const confirmed = window.confirm("¿Eliminar este usuario?");
    if (!confirmed) return;
    try {
      await deleteUser(id, token);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar";
      setError(message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <section className="card p-5 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div>
            <p className="text-sm text-slate-500">Usuarios</p>
            <h2 className="text-xl font-semibold text-slate-900">Listado</h2>
          </div>
          <button type="button" className="btn-primary" onClick={() => setIsModalOpen(true)}>
            Crear usuario
          </button>
        </div>
        <div className="table-wrapper flex-1 overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Roles</th>
                <th>Identificación</th>
                <th>Teléfono</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td colSpan={6}>
                      <div className="h-4 w-1/3 bg-slate-200 rounded" />
                      <div className="h-3 w-1/4 bg-slate-200 rounded mt-2" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-600">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <p className="font-semibold text-slate-900 leading-snug">
                        {user.fullName || "Sin nombre"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ID: {user.id.slice(0, 6)}...</p>
                    </td>
                    <td>
                      <p className="text-slate-800 wrap-break-word">{user.email}</p>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {(user.roles?.length ? user.roles : ["sin rol"]).map((role) => (
                          <span
                            key={role}
                            className="data-chip bg-emerald-100 text-emerald-800 border border-emerald-100"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {user.cedula ? (
                        <span className="data-chip bg-white border border-slate-200 text-slate-800">
                          {user.cedula}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Sin dato</span>
                      )}
                    </td>
                    <td>
                      {user.phone ? (
                        <span className="data-chip bg-white border border-slate-200 text-slate-800">
                          {user.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Sin dato</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn-ghost text-xs" onClick={() => handleDelete(user.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && users.length > 0 ? (
          <div className="pagination-bar">
            <div className="text-sm text-slate-600">
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="pager-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <button
                type="button"
                className="pager-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Crear usuario</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <input
                  className="input-field"
                  placeholder="Nombre completo"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="Correo"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="Contraseña"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="Cédula"
                  value={form.cedula}
                  onChange={(e) => setForm((p) => ({ ...p, cedula: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Guardando..." : "Crear usuario"}
                  </button>
                </div>
              </form>
              {message ? <p className="text-sm text-emerald-700 mt-3">{message}</p> : null}
              {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
