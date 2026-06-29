import { useQuery } from "@tanstack/react-query";

export default function SocialBrowser() {
  const { data: groups } = useQuery({
    queryKey: ["social-groups"],
    queryFn: () => fetch("/api/social").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Social Browser</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Members</th>
            </tr>
          </thead>
          <tbody>
            {groups?.items?.map((g: any) => (
              <tr key={g.id} className="border-t">
                <td className="p-4">{g.name}</td>
                <td className="p-4">{g.groupType}</td>
                <td className="p-4">{g.ownerId}</td>
                <td className="p-4">{g.maxMembers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
