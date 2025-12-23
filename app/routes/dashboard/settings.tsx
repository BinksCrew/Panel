import type { Route } from "./+types/dashboard-settings";
import { API_BASE } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Panel | Ajustes" }, { name: "description", content: "Preferencias del panel" }];
}

export default function SettingsRoute() {
  const { user } = useAuth();
  return (
    <div className="card p-6 space-y-4">
      <div>
        <p className="text-sm text-slate-500">Configuración</p>
        <h2 className="text-2xl font-semibold text-slate-900">Preferencias</h2>
      </div>
      <div className="ghost-divider" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500">API base</p>
          <p className="font-semibold text-slate-900 break-all">{API_BASE}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500">Usuario actual</p>
          <p className="font-semibold text-slate-900">{user?.email}</p>
          <p className="text-sm text-emerald-700">Roles: {user?.roles?.join(", ")}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        El panel aplica autenticación JWT, protege rutas para administradores y consume los
        endpoints de usuarios y preguntas.
      </p>
    </div>
  );
}
