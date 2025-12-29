"use client";

import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  fetchWeeklyLeaderboard,
  type LeaderboardRecord
} from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta() {
  return [{ title: "Panel | Rankings" }, { name: "description", content: "Ver rankings de usuarios" }];
}

export default function LeaderboardRoute() {
  const { token } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'weekly'>('global');

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [globalData, weeklyData] = await Promise.all([
        fetchLeaderboard(token, 50),
        fetchWeeklyLeaderboard(token, 50)
      ]);
      setLeaderboard(globalData);
      setWeeklyLeaderboard(weeklyData);
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

  const currentData = activeTab === 'global' ? leaderboard : weeklyLeaderboard;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando rankings...</div>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rankings</h1>
          <p className="text-slate-600">Ver los mejores jugadores de Binks Crew</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === 'global'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Ranking Global
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-3 rounded-lg font-medium ${
            activeTab === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Ranking Semanal
        </button>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">
            {activeTab === 'global' ? 'Ranking Global' : 'Ranking Semanal'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentData.map((user, index) => (
                <tr key={user.id} className={`hover:bg-slate-50 ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-slate-300 text-slate-800' :
                        index === 2 ? 'bg-amber-600 text-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <span className="ml-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.photo_url && (
                        <img
                          src={user.photo_url}
                          alt={user.username || user.fullName || 'Usuario'}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {user.username || user.fullName || 'Usuario'}
                        </div>
                        {user.username && user.fullName && (
                          <div className="text-sm text-slate-500">{user.fullName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">
                      {user.points.toLocaleString()} puntos
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {currentData.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">
            No hay datos de ranking disponibles
          </div>
        )}
      </div>

      {/* Top 3 Podium */}
      {currentData.length >= 3 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 text-center">Podio</h3>
          <div className="flex justify-center items-end gap-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-300 text-slate-800 font-bold text-lg mb-2">
                {currentData[1]?.photo_url ? (
                  <img
                    src={currentData[1].photo_url}
                    alt={currentData[1].username || currentData[1].fullName || 'Usuario'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  '2'
                )}
              </div>
              <div className="w-20 h-24 bg-slate-300 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-slate-700 font-semibold">🥈</span>
              </div>
              <div className="text-center mt-2">
                <div className="text-sm font-medium text-slate-900">
                  {currentData[1]?.username || currentData[1]?.fullName || 'Usuario'}
                </div>
                <div className="text-xs text-slate-500">
                  {currentData[1]?.points.toLocaleString()} pts
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400 text-yellow-900 font-bold text-xl mb-2">
                {currentData[0]?.photo_url ? (
                  <img
                    src={currentData[0].photo_url}
                    alt={currentData[0].username || currentData[0].fullName || 'Usuario'}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  '1'
                )}
              </div>
              <div className="w-24 h-32 bg-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-yellow-900 font-semibold text-lg">🥇</span>
              </div>
              <div className="text-center mt-2">
                <div className="text-sm font-medium text-slate-900">
                  {currentData[0]?.username || currentData[0]?.fullName || 'Usuario'}
                </div>
                <div className="text-xs text-slate-500">
                  {currentData[0]?.points.toLocaleString()} pts
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-600 text-amber-100 font-bold text-lg mb-2">
                {currentData[2]?.photo_url ? (
                  <img
                    src={currentData[2].photo_url}
                    alt={currentData[2].username || currentData[2].fullName || 'Usuario'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  '3'
                )}
              </div>
              <div className="w-20 h-20 bg-amber-600 rounded-t-lg flex items-end justify-center pb-2">
                <span className="text-amber-100 font-semibold">🥉</span>
              </div>
              <div className="text-center mt-2">
                <div className="text-sm font-medium text-slate-900">
                  {currentData[2]?.username || currentData[2]?.fullName || 'Usuario'}
                </div>
                <div className="text-xs text-slate-500">
                  {currentData[2]?.points.toLocaleString()} pts
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}