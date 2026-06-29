import { useQuery } from "@tanstack/react-query";

export default function ClubManager() {
  const { data: clubs } = useQuery({
    queryKey: ["sports-clubs", "1"],
    queryFn: () => fetch("/api/sports/leagues/1/clubs").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Club Manager</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Short Name</th>
              <th className="p-4 text-left">Founded</th>
              <th className="p-4 text-left">Professional</th>
            </tr>
          </thead>
          <tbody>
            {clubs?.items?.map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-4">{c.name}</td>
                <td className="p-4">{c.shortName}</td>
                <td className="p-4">{c.foundedYear}</td>
                <td className="p-4">{c.isProfessional ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
