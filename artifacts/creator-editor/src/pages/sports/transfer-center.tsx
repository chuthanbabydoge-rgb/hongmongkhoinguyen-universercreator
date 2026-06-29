import { useQuery } from "@tanstack/react-query";

export default function TransferCenter() {
  const { data: transfers } = useQuery({
    queryKey: ["sports-transfers", "1"],
    queryFn: () => fetch("/api/sports/players/1/transfers").then((r) => r.json()),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transfer Center</h1>
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">From</th>
              <th className="p-4 text-left">To</th>
              <th className="p-4 text-left">Fee</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transfers?.items?.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-4">{t.fromClubId}</td>
                <td className="p-4">{t.toClubId}</td>
                <td className="p-4">{t.transferFee || "-"}</td>
                <td className="p-4">{t.transferStatus}</td>
                <td className="p-4">{new Date(t.requestDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
