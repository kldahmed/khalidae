"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "authed" | "denied">("loading");

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => {
        if (r.ok) {
          setStatus("authed");
        } else {
          setStatus("denied");
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        setStatus("denied");
        router.replace("/admin/login");
      });
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3 text-zinc-500 text-sm">
          <span className="inline-block w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          Verifying session...
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return null;
  }

  return <>{children}</>;
}
