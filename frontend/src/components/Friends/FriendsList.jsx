import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Mail,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const FriendsList = ({ onProfileClick }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/friends`, {
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      setFriends(data.data || []);
      console.log(friends);
    } catch (err) {
      setError(err.message);
      console.error("Error loading friends:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId, friendUsername) => {
    if (
      !window.confirm(
        `Вы уверены, что хотите удалить ${friendUsername} из друзей?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friends/remove/${friendId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      alert(`✅ ${data.message}`);
      fetchFriends();
    } catch (err) {
      console.error("Error removing friend:", err);
      alert(`❌ Ошибка при удалении друга: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl font-semibold text-white">My friends</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
          <span className="ml-2 text-neutral-400">Loading friends...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl font-semibold text-white">My friends</h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Loading error
          </h3>
          <p className="text-neutral-400 mb-4">{error}</p>
          <button
            onClick={fetchFriends}
            className="bg-rose-500 border border-rose-400 text-white rounded-lg font-semibold px-4 py-2 hover:bg-rose-600 active:scale-95 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl font-semibold text-white">My friends</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#1a1a1a] border border-[#363636] text-neutral-300">
            {friends.length}{" "}
            {friends.length === 1
              ? "friend"
              : friends.length < 5
              ? "friends"
              : "friends"}
          </span>
          <button
            onClick={fetchFriends}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            title="Update"
          >
            <RefreshCw className="w-4 h-4 text-neutral-400 hover:text-rose-400" />
          </button>
        </div>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-400 mb-2">
            No friends
          </h3>
          <p className="text-neutral-500">Nobody here but chickens!</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {friends.map((friendship) => {
            const friend = friendship.friend;
            return (
              <div
                key={friendship.id || friend.id}
                className="relative overflow-hidden rounded-lg bg-[#1a1a1a] border border-[#363636] hover:border-[#525252] transition-colors"
              >
                {/* Remove Friend Button */}
                <button
                  onClick={() => handleRemoveFriend(friend.id, friend.username)}
                  title="Delete friend"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center active:scale-95 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Profile Image / Initial */}
                <div className="aspect-square flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-rose-400 to-red-500">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name || "Friend"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">
                      {(friend.name || friend.username || "F")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Friend Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3
                        className="text-lg font-semibold text-white cursor-pointer hover:text-rose-400 transition-colors"
                        onClick={() => onProfileClick?.(friend)}
                      >
                        {friend.name || friend.username || "Unnamed"}
                      </h3>
                      {friend.username && friend.name && (
                        <p className="text-sm text-neutral-400">
                          @{friend.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  {friend.email && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{friend.email}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
