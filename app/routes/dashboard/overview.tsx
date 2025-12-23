import { useEffect, useMemo, useState } from "react";
import {
  fetchHealth,
  fetchQuestions,
  fetchUsers,
  type QuestionRecord,
  type UserRecord,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta() {
  return [
    { title: "Panel | Visión" },
    { name: "description", content: "Métricas generales del panel" },
  ];
}

export default function OverviewRoute() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<{ status?: string; database?: string } | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [healthRes, usersRes, questionsRes] = await Promise.all([
          fetchHealth(token).catch(() => ({ status: "desconocido" })),
          fetchUsers(token),
          fetchQuestions(token),
        ]);
        setHealth(healthRes);
        setUsers(usersRes);
        setQuestions(questionsRes);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const metrics = useMemo(
    () => [
      {
        label: "Usuarios",
        value: users.length,
        delta: "+3 nuevos",
      },
      {
        label: "Preguntas",
        value: questions.length,
        delta: "Gestión activa",
      },
      {
        label: "Estado API",
        value: health?.status ?? "-",
        delta: health?.database ?? "-",
      },
    ],
    [users.length, questions.length, health]
  );

  return (
    <div className="soft-grid">
      {error ? <div className="card p-4 text-red-700 bg-red-50 border-red-100">{error}</div> : null}

      <section className="grid md:grid-cols-3 gap-4">
        {metrics.map((item) => (
          <div key={item.label} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
              </div>
              <span className="badge-soft">{item.delta}</span>
            </div>
            <div className="ghost-divider my-3" />
            <div className="h-2 rounded-full bg-emerald-50 overflow-hidden">
              <div className="h-full w-3/4 bg-linear-to-r from-emerald-500 to-cyan-400" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-[2fr,1.2fr] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Usuarios</p>
              <h3 className="text-xl font-semibold">Últimos registros</h3>
            </div>
            <span className="pill">{users.length} activos</span>
          </div>
          <div className="table-card">
            <div className="grid grid-cols-[1.2fr,1fr,1fr] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
            </div>
            <div className="divide-y divide-slate-100">
              {(loading ? Array.from({ length: 4 }) : users.slice(0, 6)).map((user, idx) => (
                <div
                  key={(user as UserRecord)?.id ?? idx}
                  className="grid grid-cols-[1.2fr,1fr,1fr] px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-slate-800">
                    {(user as UserRecord)?.fullName || "..."}
                  </span>
                  <span className="text-slate-600 wrap-break-word">
                    {(user as UserRecord)?.email || "cargando"}
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    {(user as UserRecord)?.roles?.join(", ") || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Preguntas</p>
              <h3 className="text-xl font-semibold">Actividad reciente</h3>
            </div>
            <span className="pill">{questions.length} totales</span>
          </div>
          <div className="space-y-3">
            {(loading ? Array.from({ length: 5 }) : questions.slice(0, 8)).map((question, idx) => (
              <div
                key={(question as QuestionRecord)?.id ?? idx}
                className="p-3 rounded-xl border border-slate-200"
              >
                <p className="font-semibold text-slate-900">
                  {(question as QuestionRecord)?.question || "cargando"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Tipo {(question as QuestionRecord)?.type || "-"} · Anime{" "}
                  {(question as QuestionRecord)?.anime || "general"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
