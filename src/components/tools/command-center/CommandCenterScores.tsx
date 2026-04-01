export default function CommandCenterScores({ scores }: { scores: any }) {
  if (!scores) return null;
  const items = [
    { label: "Clarity", value: scores.clarity, color: "from-blue-500 to-blue-700" },
    { label: "Strategic Value", value: scores.strategic, color: "from-fuchsia-500 to-fuchsia-700" },
    { label: "Viral Potential", value: scores.viral, color: "from-pink-500 to-pink-700" },
    { label: "Conversion", value: scores.conversion, color: "from-green-500 to-green-700" },
    { label: "Brand Strength", value: scores.brand, color: "from-yellow-500 to-yellow-700" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {items.map((item, i) => (
        <div key={i} className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${item.color} text-white flex flex-col items-center justify-center`}>
          <div className="text-3xl font-extrabold mb-2">{item.value} <span className="text-lg">/100</span></div>
          <div className="font-bold text-lg mb-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
