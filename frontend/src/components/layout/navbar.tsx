"use client";

import { ROLE_LABELS } from "@/lib/roles";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <header className="border-b border-emerald-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-emerald-800">
            ESG Platform
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-700">
              Dashboard
            </Link>
            {role === "ADMIN" && (
              <Link href="/admin/users" className="text-gray-700 hover:text-emerald-700">
                Users
              </Link>
            )}
          </nav>
        </div>
        {session?.user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {session.user.name}{" "}
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800">
                {role ? ROLE_LABELS[role] : ""}
              </span>
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
