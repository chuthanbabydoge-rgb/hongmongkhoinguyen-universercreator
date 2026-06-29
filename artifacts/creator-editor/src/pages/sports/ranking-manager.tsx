import { useQuery } from "@tanstack/react-query";

export default function RankingManager() {
  const { data: rankings } = useQuery({
    queryKey: ["sports-rankings", "1"],
    queryFn: () => fetch("/api/sports/seasons/1/rankings").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ranking Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Pos</th>
              <th className="p-4 text-left">Team</th>
              <th className="p-4 text-left">P</th>
              <th className="p-4 text-left">W</th>
              <th className="p-4 text-left">D</th>
              <th className="p-4 text-left">L</th>
              <th className="p-4 text-left">GF</th>
              <th className="p-4 text-left">GA</th>
              <th className="p-4 text-left">GD</th>
              <th className="p-4 text-left">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rankings?.items?.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-4 font-bold">{r.position}</td>
                <td className="p-4">{r.teamId}</td>
                <td className="p-4">{r.matchesPlayed}</td>
                <td className="p-4">{r.wins}</td>
                <td className="p-4">{r.draws}</td>
                <td className="p-4">{r.losses}</td>
                <td className="p-4">{r.goalsFor}</td>
                <td className="p-4">{r.goalsAgainst}</td>
                <td className="p-4">{r.goalDifference}</td>
                <td className="p-4 font-bold">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
