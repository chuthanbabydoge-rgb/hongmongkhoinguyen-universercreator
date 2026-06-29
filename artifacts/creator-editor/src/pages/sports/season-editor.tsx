import { useQuery } from "@tanstack/react-query";

export default function SeasonEditor() {
  const { data: seasons } = useQuery({
    queryKey: ["sports-seasons", "1"],
    queryFn: () => fetch("/api/sports/leagues/1/seasons").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Season Editor</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Year</th>
              <th className="p-4 text-left">Start Date</th>
              <th className="p-4 text-left">End Date</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {seasons?.items?.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="p-4">{s.name}</td>
                <td className="p-4">{s.year}</td>
                <td className="p-4">{s.startDate ? new Date(s.startDate).toLocaleDateString() : "-"}</td>
                <td className="p-4">{s.endDate ? new Date(s.endDate).toLocaleDateString() : "-"}</td>
                <td className="p-4">{s.isActive ? "Active" : s.isCompleted ? "Completed" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
