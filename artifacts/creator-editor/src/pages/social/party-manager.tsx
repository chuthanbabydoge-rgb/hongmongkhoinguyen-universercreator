import { useQuery } from "@tanstack/react-query";

export default function PartyManager() {
  const { data: parties } = useQuery({
    queryKey: ["social-parties"],
    queryFn: () => fetch("/api/social/parties/looking").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Party Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Leader</th>
              <th className="p-4 text-left">Members</th>
              <th className="p-4 text-left">Max</th>
              <th className="p-4 text-left">Looking</th>
            </tr>
          </thead>
          <tbody>
            {parties?.items?.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.leaderId}</td>
                <td className="p-4">{p.currentMembers}</td>
                <td className="p-4">{p.maxMembers}</td>
                <td className="p-4">{p.isLookingForMembers ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
