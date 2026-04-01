import { useState } from "react";

export default function CommandCenterForm({ setResult, setLoading, setError, setTrace }: any) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"url"|"text">("url");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setTrace([]);
    try {
      const res = await fetch("/api/tools/command-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
      setTrace(data.trace || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-zinc-800">
      <div className="flex gap-2 mb-2">
        <button type="button" className={`px-4 py-2 rounded-lg font-bold transition ${mode==="url"?"bg-blue-700 text-white":"bg-zinc-800 text-zinc-400"}`} onClick={()=>setMode("url")}>رابط</button>
        <button type="button" className={`px-4 py-2 rounded-lg font-bold transition ${mode==="text"?"bg-blue-700 text-white":"bg-zinc-800 text-zinc-400"}`} onClick={()=>setMode("text")}>نص / فكرة</button>
      </div>
      {mode === "url" ? (
        <input type="url" className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" value={input} onChange={e=>setInput(e.target.value)} required disabled={false} />
      ) : (
        <textarea className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" placeholder="اكتب فكرة أو موضوع أو مشروع..." value={input} onChange={e=>setInput(e.target.value)} required disabled={false} />
      )}
      <button type="submit" className="bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-700 hover:to-fuchsia-700 px-6 py-2 rounded-lg font-bold text-lg transition disabled:opacity-50 mt-2">حلل الآن</button>
    </form>
  );
}
