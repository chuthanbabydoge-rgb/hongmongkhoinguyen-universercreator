import { useQuery } from "@tanstack/react-query";

export default function SportsHistory() {
  const { data: history } = useQuery({
    queryKey: ["sports-history", "1"],
    queryFn: () => fetch("/api/sports/leagues/1/history").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sports History</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Timestamp</th>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Entity Type</th>
              <th className="p-4 text-left">Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {history?.items?.map((h: any) => (
              <tr key={h.id} className="border-t">
                <td className="p-4">{new Date(h.createdAt).toLocaleString()}</td>
                <td className="p-4">{h.action}</td>
                <td className="p-4">{h.entityType}</td>
                <td className="p-4">{h.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
