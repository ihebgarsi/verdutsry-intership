import type { Role } from "@/lib/roles";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string;
  isActive: boolean;
};

/** Demo accounts — replace when FastAPI auth is ready */
export const MOCK_USERS: AppUser[] = [
  {
    id: "1",
    email: "admin@esg.local",
    name: "Admin User",
    role: "ADMIN",
    password: "admin123",
    isActive: true,
  },
  {
    id: "2",
    email: "esg@esg.local",
    name: "ESG Manager",
    role: "ESG_MANAGER",
    password: "esg123",
    isActive: true,
  },
  {
    id: "3",
    email: "exec@esg.local",
    name: "Executive",
    role: "EXECUTIVE",
    password: "exec123",
    isActive: true,
  },
  {
    id: "4",
    email: "audit@esg.local",
    name: "External Auditor",
    role: "AUDITOR",
    password: "audit123",
    isActive: true,
  },
];

export function findMockUser(email: string, password: string): AppUser | null {
  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password && u.isActive,
  );
  return user ?? null;
}
