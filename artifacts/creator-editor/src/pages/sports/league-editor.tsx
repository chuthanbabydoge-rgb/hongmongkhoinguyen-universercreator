import { useQuery } from "@tanstack/react-query";

export default function LeagueEditor() {
  const { data: league } = useQuery({
    queryKey: ["sports-league", "1"],
    queryFn: () => fetch("/api/sports/leagues/1").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">League Editor</h1>
      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block mb-2">Name</label>
          <input type="text" defaultValue={league?.name} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-2">Description</label>
          <textarea defaultValue={league?.description} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <div>
          <label className="block mb-2">Number of Teams</label>
          <input type="number" defaultValue={league?.numberOfTeams} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
    </div>
  );
}
