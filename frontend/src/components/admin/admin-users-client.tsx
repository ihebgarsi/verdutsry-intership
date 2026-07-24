"use client";

import {
  ApiError,
  createUserApi,
  deleteUserApi,
  fetchCompanies,
  fetchUsers,
  updateUserApi,
  type ApiCompany,
  type ApiUser,
} from "@/lib/api";
import {
  COMPANY_USER_ROLES,
  ROLE_LABELS,
  type Role,
} from "@/lib/roles";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const emptyForm = {
  email: "",
  name: "",
  role: "ESG_MANAGER" as Role,
  password: "",
  companyId: "",
  isActive: true,
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [filterCompanyId, setFilterCompanyId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const companyNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of companies) map.set(c.id, c.name);
    return map;
  }, [companies]);

  const load = useCallback(async () => {
    if (!token) {
      setError("Missing access token. Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [companyList, userList] = await Promise.all([
        fetchCompanies(token),
        fetchUsers(token, filterCompanyId || undefined),
      ]);
      setCompanies(companyList);
      setUsers(userList);
      setForm((prev) =>
        prev.companyId || companyList.length === 0
          ? prev
          : { ...prev, companyId: companyList[0].id },
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load users from the backend.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, filterCompanyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.companyId) {
      setError("Select a company for this user.");
      return;
    }
    setError("");

    try {
      if (editingId) {
        await updateUserApi(token, editingId, {
          email: form.email,
          name: form.name,
          role: form.role,
          isActive: form.isActive,
          companyId: form.companyId,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await createUserApi(token, {
          email: form.email,
          name: form.name,
          role: form.role,
          password: form.password,
          companyId: form.companyId,
          isActive: form.isActive,
        });
      }

      setForm({
        ...emptyForm,
        companyId: form.companyId || companies[0]?.id || "",
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    }
  }

  function startEdit(user: ApiUser) {
    setEditingId(user.id);
    setForm({
      email: user.email,
      name: user.name,
      role: user.role,
      password: "",
      companyId: user.companyId ?? companies[0]?.id ?? "",
      isActive: user.isActive,
    });
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Delete this user?")) return;
    try {
      await deleteUserApi(token, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  const roleOptions: Role[] =
    editingId && !COMPANY_USER_ROLES.includes(form.role)
      ? [...COMPANY_USER_ROLES, form.role]
      : COMPANY_USER_ROLES;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Company users</h1>
      <p className="mt-1 text-sm text-slate-700">
        Create users for a company and assign their role (ESG Manager, Executive,
        Auditor).
      </p>

      <div className="mt-4 max-w-sm">
        <label className="block text-sm font-semibold text-slate-800">
          Filter by company
          <select
            className="input mt-1"
            value={filterCompanyId}
            onChange={(e) => setFilterCompanyId(e.target.value)}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      >
        <Field label="Company">
          <select
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            className="input"
            required
          >
            <option value="" disabled>
              Select company
            </option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            className="input"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            required
          />
        </Field>
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            required
          />
        </Field>
        <Field label={editingId ? "New password (optional)" : "Password"}>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
            required={!editingId}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active account
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="btn-primary">
            {editingId ? "Update user" : "Create user"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm({
                  ...emptyForm,
                  companyId: companies[0]?.id || "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm font-medium text-red-700 sm:col-span-2">{error}</p>
        )}
      </form>

      <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-900">
          <thead className="border-b border-emerald-200 bg-emerald-100 text-emerald-950">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 font-medium text-slate-700">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 font-medium text-slate-700">
                  No users found. Create a company first, then add users.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.companyId
                      ? companyNameById.get(u.companyId) ?? u.companyId
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                  <td className="px-4 py-3">{u.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                        onClick={() => startEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
