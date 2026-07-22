import { auth } from "@/auth";
import AdminUsersClient from "@/components/admin/admin-users-client";
import AppShell from "@/components/layout/app-shell";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AppShell>
      <AdminUsersClient />
    </AppShell>
  );
}
