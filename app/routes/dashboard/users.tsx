"use client";

import { useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, fetchUsers, updateUser, type UserRecord } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

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
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
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
      if (editingUser) {
        await updateUser(editingUser.id, form, token);
        setMessage("Usuario actualizado");
      } else {
        await createUser(form, token);
        setMessage("Usuario creado");
      }
      setForm({ email: "", password: "", fullName: "", cedula: "", phone: "" });
      setEditingUser(null);
      setIsModalOpen(false);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: UserRecord) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      fullName: user.fullName || "",
      cedula: user.cedula || "",
      phone: user.phone || "",
    });
    setIsModalOpen(true);
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
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingUser(null); setForm({ email: "", password: "", fullName: "", cedula: "", phone: "" }); }}>
                Crear usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar usuario" : "Crear usuario"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Correo"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                {!editingUser && (
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                )}
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Cédula"
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                />
                <Input
                  type="tel"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {error && <p className="text-red-600">{error}</p>}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    <TableCell colSpan={6}>
                      <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-1/4 bg-slate-200 rounded mt-2 animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-slate-600">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900 leading-snug">
                        {user.fullName || "Sin nombre"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">ID: {user.id.slice(0, 6)}...</p>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {(user.roles?.length ? user.roles : ["sin rol"]).map((role) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{user.cedula || "Sin dato"}</TableCell>
                    <TableCell>{user.phone || "Sin dato"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && users.length > 0 ? (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-600">
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
