import { auth } from "@/auth";
import { createUser, getUsers } from "@/lib/users-store";
import type { Role } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(getUsers());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, name, role, password, isActive } = body as {
    email: string;
    name: string;
    role: Role;
    password: string;
    isActive?: boolean;
  };

  if (!email || !name || !role || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = createUser({
    email,
    name,
    role,
    password,
    isActive: isActive ?? true,
  });
  return NextResponse.json(user, { status: 201 });
}
