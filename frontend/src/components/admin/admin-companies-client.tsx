"use client";

import {
  ApiError,
  createCompanyApi,
  deleteCompanyApi,
  fetchCompanies,
  updateCompanyApi,
  type ApiCompany,
} from "@/lib/api";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useState } from "react";

const emptyForm = {
  name: "",
  sector: "",
  country: "",
};

export default function AdminCompaniesClient() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) {
      setError("Missing access token. Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setCompanies(await fetchCompanies(token));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load companies.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    try {
      if (editingId) {
        await updateCompanyApi(token, editingId, form);
      } else {
        await createCompanyApi(token, form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    }
  }

  function startEdit(company: ApiCompany) {
    setEditingId(company.id);
    setForm({
      name: company.name,
      sector: company.sector,
      country: company.country,
    });
  }

  async function handleDelete(id: string) {
    if (
      !token ||
      !confirm(
        "Delete this company? It must have no users. Delete or reassign users first.",
      )
    ) {
      return;
    }
    try {
      await deleteCompanyApi(token, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
      <p className="mt-1 text-sm text-slate-700">
        Platform admin creates and manages companies. Then add users under Users.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3"
      >
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Name</span>
          <input
            className="input mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Sector</span>
          <input
            className="input mt-1"
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Country</span>
          <input
            className="input mt-1"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            required
          />
        </label>
        <div className="flex gap-2 sm:col-span-3">
          <button type="submit" className="btn-primary">
            {editingId ? "Update company" : "Create company"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm font-medium text-red-700 sm:col-span-3">{error}</p>
        )}
      </form>

      <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-900">
          <thead className="border-b border-emerald-200 bg-emerald-100 text-emerald-950">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Sector</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 font-medium text-slate-700">
                  Loading…
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 font-medium text-slate-700">
                  No companies yet.
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.sector}</td>
                  <td className="px-4 py-3">{c.country}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                        onClick={() => startEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
                        onClick={() => handleDelete(c.id)}
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
