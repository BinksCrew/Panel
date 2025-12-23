import { useEffect, useMemo, useState } from "react";
import { createQuestion, deleteQuestion, fetchQuestions, type QuestionRecord } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta() {
  return [{ title: "Panel | Preguntas" }, { name: "description", content: "Gestión de preguntas" }];
}

export default function QuestionsRoute() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    question: "",
    type: "multiple-choice",
    anime: "",
    correctAnswer: "",
    options: "",
  });
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestions(token);
      setQuestions(data);
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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(questions.length / PAGE_SIZE)), [questions.length]);
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return questions.slice(start, start + PAGE_SIZE);
  }, [page, questions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const options = form.options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      await createQuestion(
        {
          question: form.question,
          type: form.type,
          anime: form.anime || undefined,
          correctAnswer: form.correctAnswer,
          options,
        },
        token
      );
      setMessage("Pregunta creada");
      setForm({ question: "", type: "multiple-choice", anime: "", correctAnswer: "", options: "" });
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
    const confirmed = window.confirm("¿Eliminar esta pregunta?");
    if (!confirmed) return;
    try {
      await deleteQuestion(id, token);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar";
      setError(message);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <section className="card p-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500">Crear pregunta</p>
            <h2 className="text-xl font-semibold text-slate-900">Nueva pregunta</h2>
          </div>
          <span className="pill">Tipo: {form.type}</span>
        </div>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            className="input-field"
            placeholder="Pregunta"
            required
            value={form.question}
            onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
          />
          <input
            className="input-field"
            placeholder="Anime"
            value={form.anime}
            onChange={(e) => setForm((p) => ({ ...p, anime: e.target.value }))}
          />
          <select
            className="input-field"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            <option value="multiple-choice">Multiple-choice</option>
            <option value="open">Abierta</option>
          </select>
          <input
            className="input-field"
            placeholder="Respuesta correcta"
            value={form.correctAnswer}
            onChange={(e) => setForm((p) => ({ ...p, correctAnswer: e.target.value }))}
          />
          <input
            className="input-field md:col-span-2"
            placeholder="Opciones separadas por coma"
            value={form.options}
            onChange={(e) => setForm((p) => ({ ...p, options: e.target.value }))}
          />
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar pregunta"}
          </button>
        </form>
        {message ? <p className="text-sm text-emerald-700 mt-3">{message}</p> : null}
        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
      </section>

      <section className="card p-5 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div>
            <p className="text-sm text-slate-500">Preguntas</p>
            <h2 className="text-xl font-semibold text-slate-900">Listado</h2>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              // Scroll to the create form or focus on it
              const formSection = document.querySelector('section:first-of-type');
              formSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Nueva pregunta
          </button>
        </div>
        <div className="table-wrapper flex-1 overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pregunta</th>
                <th>Tipo</th>
                <th>Anime</th>
                <th>Opciones</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td colSpan={5}>
                      <div className="h-4 w-1/3 bg-slate-200 rounded" />
                      <div className="h-3 w-1/4 bg-slate-200 rounded mt-2" />
                    </td>
                  </tr>
                ))
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-600">
                    No hay preguntas registradas. Crea la primera desde el formulario.
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((question) => (
                  <tr key={question.id}>
                    <td>
                      <p className="font-semibold text-slate-900 leading-snug">{question.question}</p>
                      <p className="text-xs text-slate-500 mt-1">Respuesta correcta: {question.correctAnswer}</p>
                    </td>
                    <td>
                      <span className="data-chip bg-emerald-100 text-emerald-800">
                        {question.type === "open" ? "Abierta" : "Opción múltiple"}
                      </span>
                    </td>
                    <td>
                      <span className="data-chip bg-slate-900 text-white">{question.anime || "General"}</span>
                    </td>
                    <td>
                      {question.options?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((opt) => (
                            <span
                              key={opt}
                              className="data-chip bg-white border border-emerald-100 text-slate-800 shadow-[0_1px_6px_rgba(16,185,129,0.15)]"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Sin opciones</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn-ghost text-xs" onClick={() => handleDelete(question.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && questions.length > 0 ? (
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
    </div>
  );
}
