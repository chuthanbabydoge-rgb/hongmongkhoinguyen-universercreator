import { useQuery } from "@tanstack/react-query";

export default function CoachManager() {
  const { data: coaches } = useQuery({
    queryKey: ["sports-coaches", "1"],
    queryFn: () => fetch("/api/sports/teams/1/coaches").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Coach Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Specialization</th>
              <th className="p-4 text-left">Experience</th>
              <th className="p-4 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {coaches?.items?.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-4">{c.name}</td>
                <td className="p-4">{c.role}</td>
                <td className="p-4">{c.specialization}</td>
                <td className="p-4">{c.experience} years</td>
                <td className="p-4">{c.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
