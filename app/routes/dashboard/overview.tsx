import { useEffect, useMemo, useState } from "react";
import {
  fetchHealth,
  fetchQuestions,
  fetchUsers,
  type QuestionRecord,
  type UserRecord,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
        delta: "",
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

  // Datos para gráficas
  const userGrowthData = useMemo(() => {
    // Simular crecimiento de usuarios en las últimas 7 semanas
    const baseUsers = users.length;
    return Array.from({ length: 7 }, (_, i) => ({
      week: `Sem ${i + 1}`,
      usuarios: Math.max(0, baseUsers - Math.floor(Math.random() * 5) + i * 2),
      preguntas: Math.max(0, questions.length - Math.floor(Math.random() * 10) + i * 3),
    }));
  }, [users.length, questions.length]);

  const weeklyActivityData = useMemo(() => {
    // Simular actividad semanal
    return [
      { day: "Lun", usuarios: Math.floor(Math.random() * 20) + 5 },
      { day: "Mar", usuarios: Math.floor(Math.random() * 20) + 5 },
      { day: "Mié", usuarios: Math.floor(Math.random() * 20) + 5 },
      { day: "Jue", usuarios: Math.floor(Math.random() * 20) + 5 },
      { day: "Vie", usuarios: Math.floor(Math.random() * 20) + 5 },
      { day: "Sáb", usuarios: Math.floor(Math.random() * 20) + 5 },
      { day: "Dom", usuarios: Math.floor(Math.random() * 20) + 5 },
    ];
  }, []);

  const userRolesData = useMemo(() => {
    const roles = users.reduce((acc, user) => {
      user.roles.forEach((role) => {
        acc[role] = (acc[role] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const colors = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];
    return Object.entries(roles).map(([role, count], index) => ({
      name: role,
      value: count,
      color: colors[index % colors.length],
    }));
  }, [users]);

  const questionGrowthData = useMemo(() => {
    // Simular crecimiento de preguntas por mes
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    return months.map((month, i) => ({
      month,
      preguntas: Math.max(0, questions.length - Math.floor(Math.random() * 20) + i * 5),
    }));
  }, [questions.length]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {error ? <div className="card p-4 text-red-700 bg-red-50 border-red-100">{error}</div> : null}

      <section className="grid md:grid-cols-4 gap-4 flex-shrink-0">
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

      <section className="grid xl:grid-cols-[1.2fr,1fr] gap-4 flex-1 min-h-0">
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <p className="text-sm text-slate-500">Distribución de preguntas</p>
              <h3 className="text-xl font-semibold">Tipos</h3>
            </div>
            <span className="pill">{questions.length} totales</span>
          </div>
          <div className="space-y-3 flex-1 overflow-auto">
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

        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <p className="text-sm text-slate-500">Temáticas</p>
              <h3 className="text-xl font-semibold">Top animes</h3>
            </div>
            <span className="pill">Top {topAnime.length || 1}</span>
          </div>
          <div className="space-y-3 flex-1 overflow-auto">
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
      </section>

      <section className="grid lg:grid-cols-[2fr,1.2fr] gap-4 flex-1 min-h-0">
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <p className="text-sm text-slate-500">Usuarios</p>
              <h3 className="text-xl font-semibold">Últimos registros</h3>
            </div>
            <span className="pill">{users.length} activos</span>
          </div>
          <div className="table-card flex-1 overflow-auto">
            <div className="grid grid-cols-[1.2fr,1fr,1fr] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 flex-shrink-0">
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

        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <p className="text-sm text-slate-500">Preguntas</p>
              <h3 className="text-xl font-semibold">Actividad reciente</h3>
            </div>
            <span className="pill">{questions.length} totales</span>
          </div>
          <div className="space-y-3 overflow-auto flex-1">
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

      {/* Nueva sección con gráficas de tendencias */}
      <section className="grid xl:grid-cols-2 gap-4 flex-shrink-0">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Tendencias</p>
              <h3 className="text-xl font-semibold">Crecimiento semanal</h3>
            </div>
            <span className="pill">7 semanas</span>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usuarios"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Usuarios"
                />
                <Line
                  type="monotone"
                  dataKey="preguntas"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Preguntas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Actividad</p>
              <h3 className="text-xl font-semibold">Esta semana</h3>
            </div>
            <span className="pill">Diaria</span>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="usuarios" fill="#10b981" radius={[4, 4, 0, 0]} name="Actividad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Nueva sección con distribuciones */}
      <section className="grid xl:grid-cols-3 gap-4 flex-shrink-0">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Usuarios</p>
              <h3 className="text-xl font-semibold">Roles</h3>
            </div>
            <span className="pill">{userRolesData.length} tipos</span>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={userRolesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRolesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Preguntas</p>
              <h3 className="text-xl font-semibold">Crecimiento mensual</h3>
            </div>
            <span className="pill">6 meses</span>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={questionGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="preguntas"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.3}
                  name="Preguntas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Sistema</p>
              <h3 className="text-xl font-semibold">Estado general</h3>
            </div>
            <span className="pill">En tiempo real</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">API Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                health?.status === "ok" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}>
                {health?.status || "Desconocido"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Base de datos</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                health?.database === "connected" ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                {health?.database || "Desconocido"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Usuarios activos</span>
              <span className="text-sm font-semibold text-slate-900">{users.filter(u => u.isActive !== false).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Preguntas activas</span>
              <span className="text-sm font-semibold text-slate-900">{questions.length}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uso del sistema</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
