import { useQuery } from "@tanstack/react-query";

export default function CommunityManager() {
  const { data: groups } = useQuery({
    queryKey: ["social-groups"],
    queryFn: () => fetch("/api/social").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Community Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Members</th>
              <th className="p-4 text-left">Invite Only</th>
            </tr>
          </thead>
          <tbody>
            {groups?.items?.filter((g: any) => g.groupType === "community").map((g: any) => (
              <tr key={g.id} className="border-t">
                <td className="p-4">{g.name}</td>
                <td className="p-4">{g.description}</td>
                <td className="p-4">{g.maxMembers}</td>
                <td className="p-4">{g.isInviteOnly ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
