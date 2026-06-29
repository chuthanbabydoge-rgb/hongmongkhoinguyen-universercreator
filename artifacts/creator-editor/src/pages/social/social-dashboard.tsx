import { useQuery } from "@tanstack/react-query";

export default function SocialDashboard() {
  const { data: groups } = useQuery({
    queryKey: ["social-groups"],
    queryFn: () => fetch("/api/social").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Social Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Total Groups</p>
          <p className="text-3xl font-bold">{groups?.items?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Published</p>
          <p className="text-3xl font-bold">{groups?.items?.filter((g: any) => g.isPublished).length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Active Members</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Total Messages</p>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
