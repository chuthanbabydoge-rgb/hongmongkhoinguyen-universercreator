import { useQuery } from "@tanstack/react-query";

export default function SportsDashboard() {
  const { data: leagues } = useQuery({
    queryKey: ["sports-leagues"],
    queryFn: () => fetch("/api/sports/leagues").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sports Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Total Leagues</p>
          <p className="text-3xl font-bold">{leagues?.items?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Published</p>
          <p className="text-3xl font-bold">{leagues?.items?.filter((l: any) => l.isPublished).length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Active Seasons</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Total Clubs</p>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
