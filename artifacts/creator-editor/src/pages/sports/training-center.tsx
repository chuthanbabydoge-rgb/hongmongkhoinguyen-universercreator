import { useQuery } from "@tanstack/react-query";

export default function TrainingCenter() {
  const { data: training } = useQuery({
    queryKey: ["sports-training", "1"],
    queryFn: () => fetch("/api/sports/teams/1/training").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Training Center</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Duration</th>
              <th className="p-4 text-left">Focus</th>
              <th className="p-4 text-left">Completed</th>
            </tr>
          </thead>
          <tbody>
            {training?.items?.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-4">{t.trainingType}</td>
                <td className="p-4">{t.duration} min</td>
                <td className="p-4">{t.focus || "-"}</td>
                <td className="p-4">{t.completed ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
