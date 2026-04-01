export default function ExcelProgrammerPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Excel AI Programmer</h1>
      <p>هذه الصفحة تعمل الآن بنجاح.</p>
    </main>
  );
}
export default function ExcelToolPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-4">Excel AI Tool</h1>
        <p className="text-white/70 mb-10">
          صفحة أداة Excel تعمل الآن بشكل صحيح، ويمكن ربط الواجهة الفعلية لاحقًا.
        </p>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold mb-3">Excel Generator</h2>
          <p className="text-white/70">
            تم إصلاح الصفحة كـ React Component صحيح لمنع فشل prerender في Next.js.
          </p>
        </section>
      </div>
    </main>
  );
}
