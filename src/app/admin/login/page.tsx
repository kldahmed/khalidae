"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useCallback(async () => {
    setError("");
    if (!username.trim() || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        router.push("/admin/manager");
      } else {
        const data = await res.json().catch(() => ({ error: "Login failed." }));
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Connection failed.");
    } finally {
      setLoading(false);
    }
  }, [username, password, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 mb-2">
            <svg
              className="w-7 h-7 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-wide">
            Manager Access
          </h1>
          <p className="text-sm text-zinc-500">
            Sign in to access the control panel
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Username"
            autoComplete="username"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={login}
            disabled={loading || !username.trim() || !password}
            className="w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
