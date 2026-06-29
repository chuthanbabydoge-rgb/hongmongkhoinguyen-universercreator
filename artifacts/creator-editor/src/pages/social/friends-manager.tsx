import { useQuery } from "@tanstack/react-query";

export default function FriendsManager() {
  const { data: friendships } = useQuery({
    queryKey: ["social-friendships", "1"],
    queryFn: () => fetch("/api/social/friendships/1").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Friends Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Requested</th>
              <th className="p-4 text-left">Accepted</th>
            </tr>
          </thead>
          <tbody>
            {friendships?.items?.map((f: any) => (
              <tr key={f.id} className="border-t">
                <td className="p-4">{f.receiverId}</td>
                <td className="p-4">{f.status}</td>
                <td className="p-4">{new Date(f.requestedAt).toLocaleDateString()}</td>
                <td className="p-4">{f.acceptedAt ? new Date(f.acceptedAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
