"use client";

import { useState } from "react";

export default function PageAuditorTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/tools/page-auditor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("فشل التحليل. تحقق من الرابط.");
      const data = await res.json();
      setReport(data);
    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">المدقق الذكي للصفحات (AI Page Auditor)</h1>
      <div className="bg-zinc-900 rounded-xl p-6 shadow-lg mb-6">
        <label className="block mb-2 font-semibold">رابط الصفحة</label>
        <div className="flex gap-2">
          <input
            type="url"
            className="flex-1 rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={loading}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition disabled:opacity-50"
            onClick={handleAnalyze}
            disabled={loading || !url}
          >
            {loading ? "جاري التحليل..." : "حلل الصفحة"}
          </button>
        </div>
        {error && <div className="mt-4 text-red-400">{error}</div>}
      </div>
      {report && (
        <div className="space-y-6">
          {/* Overview Score */}
          <div className="bg-zinc-900 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-lg font-bold">النتيجة الكلية</span>
              <span className="bg-blue-700 px-3 py-1 rounded-full font-bold text-white">{report.overviewScore} / 100</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${report.overviewScore}%` }}
              />
            </div>
          </div>
          {/* SEO Audit */}
          <ReportCard title="SEO Audit" score={report.scores.seo} max={30}>
            <ul className="list-disc pl-5">
              <li>العنوان: {report.data.title || <Badge text="مفقود" color="red" />}</li>
              <li>الوصف: {report.data.metaDescription || <Badge text="مفقود" color="red" />}</li>
              <li>Canonical: {report.data.canonical || <Badge text="مفقود" color="red" />}</li>
              <li>Robots: {report.data.robots || <Badge text="مفقود" color="red" />}</li>
              <li>H1: {report.data.h1s?.join(", ") || <Badge text="مفقود" color="red" />}</li>
              <li>H2: {report.data.h2s?.join(", ") || <Badge text="مفقود" color="red" />}</li>
            </ul>
          </ReportCard>
          {/* Social Preview Audit */}
          <ReportCard title="Social Preview" score={report.scores.social} max={20}>
            <ul className="list-disc pl-5">
              <li>og:title: {report.data.ogTitle || <Badge text="مفقود" color="red" />}</li>
              <li>og:description: {report.data.ogDescription || <Badge text="مفقود" color="red" />}</li>
              <li>og:image: {report.data.ogImage ? <a href={report.data.ogImage} target="_blank" rel="noopener noreferrer" className="underline">عرض</a> : <Badge text="مفقود" color="red" />}</li>
              <li>twitter:card: {report.data.twitterCard || <Badge text="مفقود" color="red" />}</li>
            </ul>
          </ReportCard>
          {/* Technical Status Audit */}
          <ReportCard title="Technical Status" score={report.scores.technical} max={20}>
            <ul className="list-disc pl-5">
              <li>HTTP Status: <Badge text={report.data.statusCode} color={report.data.statusCode === 200 ? "green" : "red"} /></li>
              <li>Redirect Chain: {report.data.redirectChain?.length > 1 ? report.data.redirectChain.join(" → ") : <Badge text="لا يوجد" color="green" />}</li>
            </ul>
          </ReportCard>
          {/* Content Quality Audit */}
          <ReportCard title="Content Quality" score={report.scores.content} max={30}>
            <ul className="list-disc pl-5">
              <li>عدد الكلمات: {report.data.wordCount}</li>
              <li>قابلية القراءة: {report.data.readability}</li>
              <li>CTA: {report.data.cta || <Badge text="مفقود" color="red" />}</li>
            </ul>
          </ReportCard>
          {/* AI Recommendations */}
          <div className="bg-zinc-900 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-lg font-bold">توصيات الذكاء الاصطناعي</span>
              <Badge text="AI" color="blue" />
            </div>
            <ul className="list-disc pl-5">
              {report.aiRecommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ title, score, max, children }: any) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-lg font-bold">{title}</span>
        <span className="bg-zinc-700 px-3 py-1 rounded-full font-bold text-white">{score} / {max}</span>
        <div className="flex-1">
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(score / max) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  const colorMap: any = {
    red: "bg-red-600",
    green: "bg-green-600",
    blue: "bg-blue-600",
    yellow: "bg-yellow-600",
    gray: "bg-zinc-600",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${colorMap[color] || colorMap.gray}`}>{text}</span>
  );
}
