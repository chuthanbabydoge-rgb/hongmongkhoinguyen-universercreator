import { useQuery } from "@tanstack/react-query";

export default function SportsBrowser() {
  const { data: leagues } = useQuery({
    queryKey: ["sports-leagues"],
    queryFn: () => fetch("/api/sports/leagues").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sports Browser</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Teams</th>
              <th className="p-4 text-left">Founded</th>
            </tr>
          </thead>
          <tbody>
            {leagues?.items?.map((l: any) => (
              <tr key={l.id} className="border-t">
                <td className="p-4">{l.name}</td>
                <td className="p-4">{l.leagueStatus}</td>
                <td className="p-4">{l.numberOfTeams}</td>
                <td className="p-4">{l.foundedYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
