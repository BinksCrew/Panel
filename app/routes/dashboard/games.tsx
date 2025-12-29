"use client";

import { useEffect, useState } from "react";
import { fetchGameSessions, fetchGameStats, type GameSessionRecord, type GameStatsRecord } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta() {
  return [{ title: "Panel | Juegos" }, { name: "description", content: "Gestión de sesiones de juego" }];
}

export default function GamesRoute() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<GameSessionRecord[]>([]);
  const [stats, setStats] = useState<GameStatsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [sessionsData, statsData] = await Promise.all([
        fetchGameSessions(token),
        fetchGameStats(token)
      ]);
      setSessions(sessionsData);
      setStats(statsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando sesiones de juego...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">Total Juegos</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.totalGames}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">Respuestas Correctas</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.totalCorrect}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">Puntos Totales</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.totalPoints}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-sm font-medium text-slate-500">Promedio de Aciertos</h3>
            <p className="text-2xl font-bold text-slate-900">{stats.averageScore.toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Lista de sesiones recientes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">Sesiones Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Preguntas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Correctas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {session.user.username || session.user.fullName || 'Usuario'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {session.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {session.correctAnswers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {session.pointsEarned}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.isCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.isCompleted ? 'Completado' : 'En Progreso'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sessions.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">
            No hay sesiones de juego registradas
          </div>
        )}
      </div>
    </div>
  );
}