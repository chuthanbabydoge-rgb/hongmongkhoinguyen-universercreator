import { useState } from "react";

export default function SportsSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    fetch("/api/sports/leagues/1/runtime/simulate", { method: "POST" })
      .then(() => setIsSimulating(false))
      .catch(() => setIsSimulating(false));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sports Simulator</h1>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">League Simulation</h2>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSimulating ? "Simulating..." : "Simulate Match Day"}
          </button>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">Season Control</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded mr-2">Start Season</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded">End Season</button>
        </div>
      </div>
    </div>
  );
}
