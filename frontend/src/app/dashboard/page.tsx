import { auth } from "@/auth";
import AppShell from "@/components/layout/app-shell";
import { ROLE_LABELS } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { user } = session;

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Welcome, {user.name} — {ROLE_LABELS[user.role]}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Role" value={ROLE_LABELS[user.role]} />
        <Card title="Email" value={user.email} />
        <Card title="Sprint 1" value="Auth & roles OK" />
      </div>

      <section className="mt-8 rounded-lg border border-emerald-100 bg-white p-6">
        <h2 className="font-semibold text-gray-900">What you can access</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-gray-700">
          <li>Dashboard (all roles)</li>
          {user.role === "ADMIN" && <li>User management (/admin/users)</li>}
          {user.role === "AUDITOR" && <li>Read-only audit view (coming soon)</li>}
        </ul>
      </section>
    </AppShell>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
