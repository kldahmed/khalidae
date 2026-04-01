const response = await fetch("/api/tools/excel-programmer", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: description
  })
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`Excel generation failed: ${text}`);
}

const blob = await response.blob();
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "generated.xlsx";
a.click();
URL.revokeObjectURL(url);