import { useQuery } from "@tanstack/react-query";

export default function MatchCenter() {
  const { data: matches } = useQuery({
    queryKey: ["sports-matches", "1"],
    queryFn: () => fetch("/api/sports/seasons/1/matches").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Match Center</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Home</th>
              <th className="p-4 text-left">Score</th>
              <th className="p-4 text-left">Away</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {matches?.items?.map((m: any) => (
              <tr key={m.id} className="border-t">
                <td className="p-4">{new Date(m.scheduledDate).toLocaleDateString()}</td>
                <td className="p-4">{m.homeTeamId}</td>
                <td className="p-4 font-bold">{m.homeScore} - {m.awayScore}</td>
                <td className="p-4">{m.awayTeamId}</td>
                <td className="p-4">{m.matchStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
