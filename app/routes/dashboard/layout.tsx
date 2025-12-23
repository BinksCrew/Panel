import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router";
import { useAuth } from "../../lib/auth";
import type { SVGProps } from "react";

export function meta() {
  return [{ title: "Panel Admin" }, { name: "description", content: "Dashboard administrativo" }];
}

const navItems = [
  { to: "/app", label: "Dashboard", icon: DashboardIcon },
  { to: "/app/users", label: "Usuarios", icon: UsersIcon },
  { to: "/app/questions", label: "Preguntas", icon: QuestionsIcon },
  { to: "/app/settings", label: "Ajustes", icon: SettingsIcon },
];

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 13h6V4H4zM14 20h6V10h-6z" />
      <path d="M4 20h6v-4H4zM14 4v4h6V4z" />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="3" />
      <path d="M5 20v-1a4 4 0 0 1 4-4h0" />
      <circle cx="17" cy="8" r="3" />
      <path d="M14 20v-1a4 4 0 0 1 4-4h0" />
    </svg>
  );
}

function QuestionsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
      <line x1="12" x2="12" y1="17" y2="17" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.58.2 1.22 0 1.8-.2.58-.2 1.22 0 1.8Z" />
    </svg>
  );
}
export default function DashboardLayout() {
  const { user, token, ready, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!token || !user?.roles?.includes("admin")) {
      navigate("/", { replace: true, state: { from: location } });
    }
  }, [ready, token, user, navigate, location]);

  const sidebar = useMemo(
    () => (
      <aside
        className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg font-bold">
              B
            </div>
            <div className="sidebar-brand">
              <p className="text-sm opacity-80">Admin Board</p>
              <p className="font-semibold">Binks Control</p>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {collapsed ? "«" : "»"}
          </button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl transition text-sm font-semibold ${
                  isActive ? "active" : "hover:bg-white/10"
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <item.icon />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="ghost-divider my-6" />
        <div className="space-y-2 text-sm sidebar-meta">
          <p className="text-white/70">Rol</p>
          <p className="font-semibold">{user?.roles?.join(", ")}</p>
          <p className="text-white/70">Correo</p>
          <p className="font-semibold wrap-break-word">{user?.email}</p>
        </div>
        <button
          className="btn-ghost w-full mt-8"
          onClick={() => {
            logout();
            navigate("/", { replace: true });
          }}
        >
          Cerrar sesión
        </button>
      </aside>
    ),
    [collapsed, navigate, user?.roles, user?.email, logout]
  );

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      {!ready ? (
        <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
          Cargando sesión...
        </div>
      ) : (
        <>
          <button
            type="button"
            className="btn-ghost fixed top-4 left-4 z-40 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir navegación"
          >
            Menú
          </button>

          <div
            className={`fixed inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
              mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileOpen(false)}
          />

          <div
            className="lg:grid lg:gap-6"
            style={{ gridTemplateColumns: collapsed ? "110px 1fr" : "280px 1fr" }}
          >
            <div
              className={`fixed inset-y-0 left-0 z-50 max-w-[85vw] transition-transform duration-200 lg:static lg:translate-x-0 ${
                mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              }`}
              style={{ width: collapsed ? "110px" : "260px" }}
            >
              {sidebar}
            </div>

            <main className="glass-panel p-6 lg:p-8 mt-16 lg:mt-0">
              <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-500">Panel administrativo</p>
                  <h1 className="text-3xl font-semibold text-slate-900">Visión general</h1>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="search"
                    className="input-field w-64"
                    placeholder="Buscar en el panel"
                  />
                  <button
                    type="button"
                    className="btn-ghost hidden lg:inline-flex"
                    onClick={() => setCollapsed((v) => !v)}
                    aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                  >
                    {collapsed ? "Expandir" : "Colapsar"}
                  </button>
                  <Link to="/app/questions" className="btn-primary hidden sm:inline-flex">
                    Nueva pregunta
                  </Link>
                </div>
              </header>
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
