"use client";
export default function ContactCard({ label, value, type, link }: { label: string; value: string; type: string; link: string }) {
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
      <div>
        <div className="font-semibold mb-1">{label}</div>
        <div className="text-white/70">{value}</div>
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 font-semibold hover:bg-white/20 transition">فتح</a>
    </div>
  );
}
