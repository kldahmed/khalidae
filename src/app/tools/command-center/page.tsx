"use client";
import CommandCenterForm from "@/components/tools/command-center/CommandCenterForm";
import CommandCenterTabs from "@/components/tools/command-center/CommandCenterTabs";
import { useState } from "react";

export default function CommandCenterPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-white py-10 px-2 md:px-0">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center tracking-tight bg-gradient-to-r from-blue-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">AI Command Center</h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-8 text-center text-zinc-400">مركز القيادة الذكي — حوّل أي فكرة أو رابط إلى خطة تنفيذية متكاملة</h2>
        <CommandCenterForm setResult={setResult} setLoading={setLoading} setError={setError} setTrace={setTrace} />
        <div className="mt-8">
          <CommandCenterTabs result={result} loading={loading} error={error} trace={trace} />
        </div>
      </div>
    </div>
  );
}
