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
        path: "animes",
        file: "routes/dashboard/animes.tsx", // Anime management route
      },
      {
        path: "questions",
        file: "routes/dashboard/questions.tsx",
      },
      {
        path: "games",
        file: "routes/dashboard/games.tsx",
      },
      {
        path: "products",
        file: "routes/dashboard/products.tsx",
      },
      {
        path: "redemptions",
        file: "routes/dashboard/redemptions.tsx",
      },
      {
        path: "leaderboard",
        file: "routes/dashboard/leaderboard.tsx",
      },
      {
        path: "settings",
        file: "routes/dashboard/settings.tsx",
      },
    ],
  },
] satisfies RouteConfig;
