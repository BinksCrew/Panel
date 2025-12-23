import { type RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/login.tsx",
  },
  {
    path: "/app",
    file: "routes/dashboard/layout.tsx",
    children: [
      {
        index: true,
        file: "routes/dashboard/overview.tsx",
      },
      {
        path: "users",
        file: "routes/dashboard/users.tsx",
      },
      {
        path: "questions",
        file: "routes/dashboard/questions.tsx",
      },
      {
        path: "settings",
        file: "routes/dashboard/settings.tsx",
      },
    ],
  },
] satisfies RouteConfig;
