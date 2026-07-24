import { auth } from "@/auth";
import AdminCompaniesClient from "@/components/admin/admin-companies-client";
import AppShell from "@/components/layout/app-shell";
import { redirect } from "next/navigation";

export default async function AdminCompaniesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AppShell>
      <AdminCompaniesClient />
    </AppShell>
  );
}
