import { useState } from "react";

export default function SportsImportExport() {
  const [format, setFormat] = useState<"json" | "template" | "package">("json");

  const handleExport = () => {
    fetch("/api/sports/leagues/1/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, exportedBy: "1" }),
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Import / Export</h1>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">Export League</h2>
          <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="border rounded px-3 py-2 mb-4">
            <option value="json">JSON</option>
            <option value="template">Template</option>
            <option value="package">Package</option>
          </select>
          <button onClick={handleExport} className="bg-blue-500 text-white px-4 py-2 rounded">
            Export
          </button>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">Import League</h2>
          <textarea className="w-full border rounded px-3 py-2 mb-4" rows={10} placeholder="Paste export data..." />
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
