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
        delta: "+3 últimos 7d",
      },
      {
        label: "Preguntas",
        value: questions.length,
        delta: `${questions.filter((q) => q.type === "multiple-choice").length} múltiple-choice`,
      },
      {
        label: "Apertura",
        value: `${Math.round((questions.filter((q) => q.type === "open").length / Math.max(questions.length, 1)) * 100)}%`,
        delta: "Preguntas abiertas",
      },
      {
        label: "Estado API",
        value: health?.status ?? "-",
        delta: health?.database ?? "-",
      },
    ],
    [users.length, questions]
  );

  const questionTypeDistribution = useMemo(() => {
    const totals = questions.reduce(
      (acc, q) => {
        acc[q.type === "open" ? "open" : "multiple"] += 1;
        return acc;
      },
      { open: 0, multiple: 0 }
    );
    const total = totals.open + totals.multiple;
    return [
      { label: "Opción múltiple", value: totals.multiple, pct: total ? Math.round((totals.multiple / total) * 100) : 0 },
      { label: "Abierta", value: totals.open, pct: total ? Math.round((totals.open / total) * 100) : 0 },
    ];
  }, [questions]);

  const topAnime = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach((q) => {
      const key = q.anime || "General";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [questions]);

  const activitySeries = useMemo(() => {
    const base = Math.max(4, Math.round((questions.length + users.length) / 2));
    return Array.from({ length: 7 }, (_, i) => Math.max(3, Math.round(base * (0.65 + i * 0.08))));
  }, [questions.length, users.length]);

  return (
    <div className="soft-grid">
      {error ? <div className="card p-4 text-red-700 bg-red-50 border-red-100">{error}</div> : null}

      <section className="grid md:grid-cols-4 gap-4">
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

      <section className="grid xl:grid-cols-[1.2fr,1fr,1fr] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Distribución de preguntas</p>
              <h3 className="text-xl font-semibold">Tipos</h3>
            </div>
            <span className="pill">{questions.length} totales</span>
          </div>
          <div className="space-y-3">
            {questionTypeDistribution.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="text-slate-900">{item.value} · {item.pct}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${item.pct}%`, background: item.label === "Abierta" ? "linear-gradient(90deg,#0ea5e9,#22d3ee)" : "linear-gradient(90deg,#10b981,#0f766e)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Temáticas</p>
              <h3 className="text-xl font-semibold">Top animes</h3>
            </div>
            <span className="pill">Top {topAnime.length || 1}</span>
          </div>
          <div className="space-y-3">
            {(loading ? Array.from({ length: 4 }) : topAnime).map((item, idx) => (
              <div key={item?.label ?? idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-semibold flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{(item as typeof topAnime[number])?.label || "..."}</p>
                  <div className="bar-track small">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.min(100, ((item as typeof topAnime[number])?.value || 0) * 12)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700">{(item as typeof topAnime[number])?.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Actividad</p>
              <h3 className="text-xl font-semibold">Semana</h3>
            </div>
            <span className="pill">{activitySeries.at(-1)} peak</span>
          </div>
          <div className="sparkline">
            {activitySeries.map((value, idx) => (
              <div key={idx} className="spark-bar" style={{ height: `${value * 3}px` }}>
                <span className="sr-only">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">Serie simulada con el volumen de usuarios y preguntas para visualizar tendencia semanal.</p>
        </div>
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
