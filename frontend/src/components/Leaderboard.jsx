import { useState, useEffect } from "react";
import { getLeaderboard } from "../api";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await getLeaderboard();
      setLeaders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <h2 className="text-2xl font-bold mb-4">🏆 Leaderboard (24h)</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  return (
    <div className="card sticky top-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span>🏆</span>
        <span>Leaderboard</span>
        <span className="text-sm font-normal text-gray-500">(Last 24h)</span>
      </h2>

      {leaders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No karma earned yet!</p>
      ) : (
        <div className="space-y-3">
          {leaders.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-transparent rounded-lg hover:from-primary-100 transition-colors duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{medals[index]}</span>
                <div>
                  <p className="font-semibold text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-500">
                    {user.karma_24h} karma
                  </p>
                </div>
              </div>
              <div className="text-primary-600 font-bold text-lg">
                {user.karma_24h}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Updates every 30 seconds
      </p>
    </div>
  );
}
