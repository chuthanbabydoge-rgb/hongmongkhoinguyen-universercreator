import { useQuery } from "@tanstack/react-query";

export default function TeamManager() {
  const { data: teams } = useQuery({
    queryKey: ["sports-teams", "1"],
    queryFn: () => fetch("/api/sports/clubs/1/teams").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Age Group</th>
              <th className="p-4 text-left">Division</th>
              <th className="p-4 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {teams?.items?.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-4">{t.name}</td>
                <td className="p-4">{t.ageGroup || "-"}</td>
                <td className="p-4">{t.division || "-"}</td>
                <td className="p-4">{t.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
