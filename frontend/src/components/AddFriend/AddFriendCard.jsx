import { useState, useEffect, useRef } from "react";
import { UserPlus, Search, Loader2, AlertCircle } from "lucide-react";

export function AddFriendCard() {
  const [friend, setFriend] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function search(query) {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/user?username=${query}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      setResults(data.data || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequest(friendId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friends/requests/send/${friendId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      alert(`✅ ${data.message}`);
      // Clear search results after successful request
      setResults([]);
      setFriend("");
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert(`❌ Failed to send friend request: ${err.message}`);
    }
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      search(friend);
    }, 250);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [friend]);

  return (
    <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <UserPlus className="w-6 h-6 text-rose-400" />
        <h2 className="text-xl font-semibold text-white">Add friend</h2>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by username..."
          value={friend}
          onChange={(e) => setFriend(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#363636] rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-300">
            Результаты поиска:
          </h3>
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#363636] rounded-lg hover:border-[#525252] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-blue-400 to-violet-500 rounded-full">
                  {result.avatar ? (
                    <img
                      src={result.avatar}
                      alt={result.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>
                      {(result.name || result.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{result.username}</p>
                  {result.email && (
                    <p className="text-sm text-neutral-400">{result.email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => sendFriendRequest(result.id)}
                className="px-4 py-2 bg-rose-500 border border-rose-400 text-white rounded-lg font-medium hover:bg-rose-600 active:scale-95 transition-colors"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
