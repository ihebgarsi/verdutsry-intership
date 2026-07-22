import type { AppUser } from "@/lib/mock-users";
import { MOCK_USERS } from "@/lib/mock-users";

/** In-memory store for demo CRUD until FastAPI /users is ready */
let usersStore: AppUser[] = MOCK_USERS.map((u) => ({ ...u }));

export function getUsers(): Omit<AppUser, "password">[] {
  return usersStore.map(({ password: _, ...rest }) => rest);
}

export function createUser(data: Omit<AppUser, "id">): Omit<AppUser, "password"> {
  const id = String(Date.now());
  const user: AppUser = { ...data, id };
  usersStore.push(user);
  const { password: _, ...rest } = user;
  return rest;
}

export function updateUser(
  id: string,
  data: Partial<Omit<AppUser, "id">>,
): Omit<AppUser, "password"> | null {
  const idx = usersStore.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  usersStore[idx] = { ...usersStore[idx], ...data };
  const { password: _, ...rest } = usersStore[idx];
  return rest;
}

export function deleteUser(id: string): boolean {
  const before = usersStore.length;
  usersStore = usersStore.filter((u) => u.id !== id);
  return usersStore.length < before;
}
