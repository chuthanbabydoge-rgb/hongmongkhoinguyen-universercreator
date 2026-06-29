import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function SocialEditor() {
  const { id } = { id: "1" };
  const [activeTab, setActiveTab] = useState("general");

  const { data: group } = useQuery({
    queryKey: ["social-group", id],
    queryFn: () => fetch(`/api/social/${id}`).then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Social Editor</h1>
      <div className="flex gap-2 mb-4">
        {["general", "members", "channels", "posts", "events", "parties", "voice", "notifications", "reputation", "settings"].map((tab) => (
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
              <input type="text" defaultValue={group?.name} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-2">Type</label>
              <select defaultValue={group?.groupType} className="w-full border rounded px-3 py-2">
                <option value="guild">Guild</option>
                <option value="clan">Clan</option>
                <option value="organization">Organization</option>
                <option value="community">Community</option>
                <option value="party">Party</option>
                <option value="family">Family</option>
                <option value="school">School</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        )}
        {activeTab !== "general" && <p className="text-gray-500">{activeTab} content placeholder</p>}
      </div>
    </div>
  );
}
