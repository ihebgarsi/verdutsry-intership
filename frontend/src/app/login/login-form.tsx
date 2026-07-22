"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("admin@esg.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef5f1] px-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-8 shadow-md">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Verdustry
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">ESG Platform</h1>
        <p className="mt-1 text-sm text-slate-700">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1"
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
          <p className="font-semibold text-slate-900">Test accounts</p>
          <ul className="mt-1 space-y-0.5">
            <li>admin@esg.local / admin123 (Administrateur)</li>
            <li>esg@esg.local / esg123 (Responsable ESG)</li>
            <li>exec@esg.local / exec123 (Direction)</li>
            <li>audit@esg.local / audit123 (Auditeur)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
