"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(
        "Invalid email or password, or the backend is unreachable. Check FastAPI is running.",
      );
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
              autoComplete="email"
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
              autoComplete="current-password"
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

        <p className="mt-4 text-center text-sm text-slate-800">
          New company?{" "}
          <Link href="/signup" className="font-semibold text-emerald-800 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
