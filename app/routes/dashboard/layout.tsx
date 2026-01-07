"use client";

import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../lib/auth";
import type { SVGProps } from "react";

export function meta() {
  return [{ title: "Panel Admin" }, { name: "description", content: "Dashboard administrativo" }];
}

const navItems = [
  { to: "/app", label: "Dashboard", icon: DashboardIcon },
  { to: "/app/users", label: "Usuarios", icon: UsersIcon },
  { to: "/app/animes", label: "Animes", icon: AnimesIcon },
  { to: "/app/questions", label: "Preguntas", icon: QuestionsIcon },
  { to: "/app/games", label: "Juegos", icon: GamesIcon },
  { to: "/app/products", label: "Productos", icon: ProductsIcon },
  { to: "/app/redemptions", label: "Canjes", icon: RedemptionsIcon },
  { to: "/app/leaderboard", label: "Rankings", icon: LeaderboardIcon },
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

function AnimesIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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

function GamesIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ProductsIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function RedemptionsIcon(props: SVGProps<SVGSVGElement>) {
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
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function LeaderboardIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 2H2v2h20z" />
      <path d="M22 8H2v2h20z" />
      <path d="M22 14H2v2h20z" />
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!token || !user?.roles?.includes("admin")) {
      navigate("/", { replace: true, state: { from: location } });
    }
  }, [ready, token, user, navigate, location]);

  const sidebar = useMemo(
    () => (
      <aside className="sidebar" aria-label="Navegación principal">
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
            className="lg:hidden text-white hover:text-white/80"
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar navegación"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
    [navigate, user?.roles, user?.email, logout]
  );

  return (
    <div className="h-screen overflow-hidden px-4 lg:px-8">
      {!ready ? (
        <div className="h-full flex items-center justify-center text-slate-600">
          Cargando sesión...
        </div>
      ) : (
        <>
          <button
            type="button"
            className="btn-ghost fixed top-4 left-4 z-40 lg:hidden p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir navegación"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div
            className={`fixed inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
              mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileOpen(false)}
          />

          <div className="h-full lg:grid lg:grid-cols-[280px_1fr]">
            <div
              className={`fixed inset-y-0 left-0 z-50 max-w-[85vw] transition-transform duration-200 lg:static lg:translate-x-0 lg:h-full ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {sidebar}
            </div>

            <main className="glass-panel p-6 lg:p-8 flex flex-col h-full lg:h-auto overflow-hidden">
              <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6 flex-shrink-0">
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
                </div>
              </header>
              <div className="flex-1 overflow-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
