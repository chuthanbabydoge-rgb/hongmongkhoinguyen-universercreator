import { useQuery } from "@tanstack/react-query";

export default function PlayerManager() {
  const { data: players } = useQuery({
    queryKey: ["sports-players", "1"],
    queryFn: () => fetch("/api/sports/teams/1/players").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Player Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Jersey</th>
              <th className="p-4 text-left">Nationality</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {players?.items?.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.position}</td>
                <td className="p-4">#{p.jerseyNumber}</td>
                <td className="p-4">{p.nationality}</td>
                <td className="p-4">{p.isRetired ? "Retired" : p.isInjured ? "Injured" : "Active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
