import { useEffect, useMemo, useState } from "react";
import { createAnime, deleteAnime, fetchAnimes, type AnimeRecord } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta() {
  return [{ title: "Panel | Animes" }, { name: "description", content: "Gestión de animes" }];
}

export default function AnimesRoute() {
  const { token } = useAuth();
  const [animes, setAnimes] = useState<AnimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    coverImage: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnimes(token);
      setAnimes(data);
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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(animes.length / PAGE_SIZE)), [animes.length]);
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedAnimes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return animes.slice(start, start + PAGE_SIZE);
  }, [page, animes]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await createAnime(
        {
          name: form.name,
          description: form.description || undefined,
          coverImage: form.coverImage || undefined,
        },
        token
      );
      setMessage("Anime creado");
      setForm({ name: "", description: "", coverImage: "" });
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
    const confirmed = window.confirm("¿Eliminar este anime?");
    if (!confirmed) return;
    try {
      await deleteAnime(id, token);
      setAnimes((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar";
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Animes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>+ Nuevo Anime</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg border border-green-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Descripción</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAnimes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No hay animes registrados
                    </td>
                  </tr>
                ) : (
                  paginatedAnimes.map((anime) => (
                    <tr key={anime.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{anime.name}</td>
                      <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{anime.description || "-"}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(anime.id)}
                          className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Nuevo Anime</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej: Naruto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Breve descripción..."
                  rows={3}
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  {submitting ? "Guardando..." : "Guardar Anime"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
