/**
 * FastAPI backend client — all calls go to NEXT_PUBLIC_API_URL + /api/v1
 */

import type { Role } from "@/lib/roles";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as {
      error?: string;
      detail?: string | unknown;
    };
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "object" && item && "msg" in item) {
            return String((item as { msg: string }).msg);
          }
          return JSON.stringify(item);
        })
        .join(", ");
    }
  } catch {
    /* ignore */
  }
  return res.statusText || `Request failed (${res.status})`;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------- Types (frontend shape) ---------- */

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  companyId?: string;
};

export type LoginResponse = {
  access_token: string;
  token_type?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive?: boolean;
    companyId?: string;
  };
};

export type SignupPayload = {
  companyName: string;
  sector: string;
  country: string;
  adminName: string;
  email: string;
  password: string;
};

export type SignupResponse = {
  company: {
    id: string;
    name: string;
    sector: string;
    country: string;
    createdAt?: string;
  };
  user: ApiUser;
};

export type CreateUserPayload = {
  email: string;
  name: string;
  role: Role;
  password: string;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
  isActive?: boolean;
};

/* ---------- Auth ---------- */

export async function loginWithApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login/json", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signupWithApi(
  payload: SignupPayload,
): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMe(token: string): Promise<ApiUser> {
  return apiFetch<ApiUser>("/auth/me", { token });
}

/* ---------- Users (Admin) ---------- */

export async function fetchUsers(token: string): Promise<ApiUser[]> {
  return apiFetch<ApiUser[]>("/users", { token });
}

export async function createUserApi(
  token: string,
  payload: CreateUserPayload,
): Promise<ApiUser> {
  return apiFetch<ApiUser>("/users", {
    method: "POST",
    token,
    body: JSON.stringify({
      email: payload.email,
      name: payload.name,
      role: payload.role,
      password: payload.password,
      isActive: payload.isActive ?? true,
    }),
  });
}

export async function updateUserApi(
  token: string,
  id: string,
  payload: UpdateUserPayload,
): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/users/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify({
      ...(payload.email !== undefined ? { email: payload.email } : {}),
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.role !== undefined ? { role: payload.role } : {}),
      ...(payload.password ? { password: payload.password } : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    }),
  });
}

export async function deleteUserApi(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/users/${id}`, {
    method: "DELETE",
    token,
  });
}
