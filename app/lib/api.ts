const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.DEV ? "http://localhost:3000/api" : "https://serverbinks.onrender.com/api");
const API_BASE = normalizeBase(rawBase);

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiError {
  status: number;
  message: string;
}

async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    token?: string | null;
    body?: BodyInit | null;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = "GET", token, body, headers = {} } = options;
  const res = await fetch(`${API_BASE}${path}`.replace(/\/$/, ""), {
    method,
    headers: {
      Accept: "application/json",
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch (_) {
      /* ignore json parse errors */
    }
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function normalizeBase(base: string) {
  const trimmed = base.replace(/\/$/, "");
  if (/\/api$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api`;
}

export interface LoginResponse {
  id: string;
  email: string;
  fullName?: string;
  roles: string[];
  isActive: boolean;
  token: string;
}

export async function loginRequest(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export interface HealthResponse {
  status: string;
  database?: string;
  timestamp?: string;
}

export function fetchHealth(token?: string | null) {
  return request<HealthResponse>("/health", { token });
}

export interface UserRecord {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  phone?: string;
  photo_url?: string | null;
  roles: string[];
  cedula?: string;
  isActive?: boolean;
  createdAt: string;
}

export function fetchUsers(token: string) {
  return request<UserRecord[]>("/users", { token });
}

interface UserPayload {
  cedula: string;
  email: string;
  password: string;
  fullName?: string;
  username?: string;
  phone?: string;
  file?: File;
}

export function createUser(payload: Partial<UserPayload>, token: string) {
  const form = new FormData();
  if (payload.cedula) form.append("cedula", payload.cedula);
  if (payload.email) form.append("email", payload.email);
  if (payload.password) form.append("password", payload.password);
  if (payload.fullName) form.append("fullName", payload.fullName);
  if (payload.username) form.append("username", payload.username);
  if (payload.phone) form.append("phone", payload.phone);
  if (payload.file) form.append("file", payload.file);
  return request<UserRecord>("/users", { method: "POST", body: form, token });
}

export function deleteUser(id: string, token: string) {
  return request<{ message: string }>(`/users/${id}`, { method: "DELETE", token });
}

export interface QuestionRecord {
  id: string;
  question: string;
  type: string;
  anime?: { id: string; name: string } | string;
  options?: string[];
  correctAnswer?: string;
  createdAt: string;
}

export function fetchQuestions(token: string) {
  return request<QuestionRecord[]>("/questions", { token });
}

export interface QuestionPayload {
  question: string;
  type: string;
  animeId?: string;
  correctAnswer?: string;
  options?: string[];
}

export function createQuestion(payload: QuestionPayload, token: string) {
  return request<QuestionRecord>("/questions", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteQuestion(id: string, token: string) {
  return request<{ message: string }>(`/questions/${id}`, {
    method: "DELETE",
    token,
  });
}

export interface AnimeRecord {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
}

export function fetchAnimes(token: string) {
  return request<AnimeRecord[]>("/animes", { token });
}

export function createAnime(
  data: { name: string; description?: string; coverImage?: string },
  token: string
) {
  return request<AnimeRecord>("/animes", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteAnime(id: string, token: string) {
  return request<void>(`/animes/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchStats(token: string) {
  return request<{ users: number; animes: number; questions: number }>("/stats", { token });
}

// Game API functions
export interface GameSessionRecord {
  id: string;
  user: { id: string; username?: string; fullName?: string };
  totalQuestions: number;
  correctAnswers: number;
  pointsEarned: number;
  isCompleted: boolean;
  createdAt: string;
  answers?: GameAnswerRecord[];
}

export interface GameAnswerRecord {
  id: string;
  question: { id: string; question: string };
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: string;
}

export interface GameStatsRecord {
  totalGames: number;
  totalCorrect: number;
  totalPoints: number;
  averageScore: number;
  recentSessions: GameSessionRecord[];
}

export function fetchGameSessions(token: string) {
  return request<GameSessionRecord[]>("/game/sessions", { token });
}

export function fetchGameStats(token: string) {
  return request<GameStatsRecord>("/game/stats", { token });
}

// Product API functions
export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export function fetchProducts(token: string) {
  return request<ProductRecord[]>("/products", { token });
}

export function createProduct(payload: ProductPayload, token: string) {
  return request<ProductRecord>("/products", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id: string, payload: Partial<ProductPayload>, token: string) {
  return request<ProductRecord>(`/products/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: string, token: string) {
  return request<{ message: string }>(`/products/${id}`, {
    method: "DELETE",
    token,
  });
}

// Redemption API functions
export interface RedemptionRecord {
  id: string;
  user: { id: string; username?: string; fullName?: string; email: string };
  product: { id: string; name: string; price: number };
  quantity: number;
  totalPoints: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  notes?: string;
  createdAt: string;
}

export interface RedemptionPayload {
  productId: string;
  quantity: number;
  notes?: string;
}

export function fetchRedemptions(token: string) {
  return request<RedemptionRecord[]>("/redemptions", { token });
}

export function updateRedemptionStatus(id: string, status: string, notes?: string, token: string) {
  return request<RedemptionRecord>(`/redemptions/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status, notes }),
  });
}

// Leaderboard API functions
export interface LeaderboardRecord {
  id: string;
  username?: string;
  fullName?: string;
  points: number;
  photo_url?: string;
}

export function fetchLeaderboard(token: string, limit?: number) {
  const params = limit ? `?limit=${limit}` : '';
  return request<LeaderboardRecord[]>(`/leaderboard${params}`, { token });
}

export function fetchWeeklyLeaderboard(token: string, limit?: number) {
  const params = limit ? `?limit=${limit}` : '';
  return request<LeaderboardRecord[]>(`/leaderboard/weekly${params}`, { token });
}

export { API_BASE };
