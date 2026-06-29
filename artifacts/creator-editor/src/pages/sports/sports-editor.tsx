import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function SportsEditor() {
  const { id } = { id: "1" };
  const [activeTab, setActiveTab] = useState("general");

  const { data: league } = useQuery({
    queryKey: ["sports-league", id],
    queryFn: () => fetch(`/api/sports/leagues/${id}`).then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sports Editor</h1>
      <div className="flex gap-2 mb-4">
        {["general", "clubs", "seasons", "teams", "players", "matches", "rankings", "training", "transfers", "awards"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded shadow">
        {activeTab === "general" && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Name</label>
              <input type="text" defaultValue={league?.name} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-2">Status</label>
              <select defaultValue={league?.leagueStatus} className="w-full border rounded px-3 py-2">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}
        {activeTab !== "general" && <p className="text-gray-500">{activeTab} content placeholder</p>}
      </div>
    </div>
  );
}
