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
      <div className="card animate-pulse border-t-4 border-t-amber-400">
        <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)]">
          🏆 Top Karma (24h)
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div className="flex-1 h-8 bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  const gradientColors = [
    "from-amber-500/20 to-transparent border-amber-500/30 text-amber-200", // Gold - Brighter text
    "from-slate-400/20 to-transparent border-slate-400/30 text-slate-200", // Silver - Brighter text
    "from-orange-700/20 to-transparent border-orange-700/30 text-orange-200", // Bronze - Brighter text
    "from-slate-700/50 to-transparent border-slate-700/50 text-slate-300",
    "from-slate-700/50 to-transparent border-slate-700/50 text-slate-300",
  ];

  return (
    <div className="card border-t-4 border-t-amber-400 shadow-amber-500/10 hover:shadow-amber-500/20">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
        <span className="animate-bounce">🏆</span>
        <span>Top Karma</span>
      </h2>

      {leaders.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/50 rounded-xl">
          <p className="text-3xl mb-2">🐢</p>
          <p className="text-[var(--text-secondary)]">Race hasn't started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-102 hover:shadow-lg bg-gradient-to-r ${
                gradientColors[index] || gradientColors[3]
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl drop-shadow-md">{medals[index]}</span>
                <div>
                  <p className="font-bold text-white text-base">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-200">Earned recently</p>
                </div>
              </div>
              <div className="font-bold text-lg tabular-nums text-white">
                +{user.karma_24h}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
        <span>Last 24 hours</span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live
        </div>
      </div>
    </div>
  );
}
