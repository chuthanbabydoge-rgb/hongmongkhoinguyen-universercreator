import { useQuery } from "@tanstack/react-query";

export default function GuildManager() {
  const { data: groups } = useQuery({
    queryKey: ["social-groups"],
    queryFn: () => fetch("/api/social").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Guild Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Max Members</th>
              <th className="p-4 text-left">Public</th>
            </tr>
          </thead>
          <tbody>
            {groups?.items?.filter((g: any) => g.groupType === "guild").map((g: any) => (
              <tr key={g.id} className="border-t">
                <td className="p-4">{g.name}</td>
                <td className="p-4">{g.description}</td>
                <td className="p-4">{g.maxMembers}</td>
                <td className="p-4">{g.isPublic ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
