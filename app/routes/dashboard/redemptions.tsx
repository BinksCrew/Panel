"use client";

import { useEffect, useState } from "react";
import {
  fetchRedemptions,
  updateRedemptionStatus,
  type RedemptionRecord
} from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta() {
  return [{ title: "Panel | Canjes" }, { name: "description", content: "Gestión de solicitudes de canje" }];
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  delivered: 'bg-green-100 text-green-800',
};

const statusLabels = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  delivered: 'Entregado',
};

export default function RedemptionsRoute() {
  const { token } = useAuth();
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const loadRedemptions = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRedemptions(token);
      setRedemptions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRedemptions();
  }, [token]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!token) return;

    try {
      await updateRedemptionStatus(id, newStatus, token, undefined);
      setMessage(`Canje ${statusLabels[newStatus as keyof typeof statusLabels].toLowerCase()} exitosamente`);
      loadRedemptions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar estado";
      setError(message);
    }
  };

  const filteredRedemptions = redemptions.filter(redemption =>
    filter === 'all' || redemption.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando canjes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Canjes</h1>
          <p className="text-slate-600">Gestiona las solicitudes de canje de puntos</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          Aprobados
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'delivered' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          Entregados
        </button>
      </div>

      {/* Redemptions List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Puntos Totales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRedemptions.map((redemption) => (
                <tr key={redemption.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {redemption.user.username || redemption.user.fullName}
                    </div>
                    <div className="text-sm text-slate-500">{redemption.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{redemption.product.name}</div>
                    <div className="text-sm text-slate-500">{redemption.product.price} pts c/u</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {redemption.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {redemption.totalPoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[redemption.status]
                    }`}>
                      {statusLabels[redemption.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(redemption.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {redemption.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(redemption.id, 'approved')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleStatusChange(redemption.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {redemption.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(redemption.id, 'delivered')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Entregar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRedemptions.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">
            {filter === 'all' ? 'No hay canjes registrados' : `No hay canjes ${statusLabels[filter as keyof typeof statusLabels].toLowerCase()}`}
          </div>
        )}
      </div>
    </div>
  );
}