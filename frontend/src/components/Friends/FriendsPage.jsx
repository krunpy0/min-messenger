import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AddFriend } from "../AddFriend/AddFriend";
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
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
      } catch (err) {
        setError(err.message);
        console.error("Error loading friends:", err);
        alert(`❌ Failed to load friends: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleRefresh = () => {
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
      } catch (err) {
        setError(err.message);
        console.error("Error loading friends:", err);
        alert(`❌ Failed to load friends: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  };

  const handleRemoveFriend = async (friendId, friendUsername) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${friendUsername} from your friends?`
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
      // Refresh the friends list
      handleRefresh();
    } catch (err) {
      console.error("Error removing friend:", err);
      alert(`❌ Failed to remove friend: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Загружаем список друзей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full px-4">
        <div className="max-w-sm w-full bg-[#242424] border border-[#424242] rounded-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
          <p className="text-neutral-400 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-rose-500 border border-rose-400 text-white rounded-md font-semibold px-6 py-2 hover:bg-rose-600 active:scale-95"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="border-b border-[#363636] bg-[#202020]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-rose-400" />
              <h1 className="text-2xl font-bold">Мои друзья</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#202020] border border-[#363636] text-neutral-300">
                {friends.length}{" "}
                {friends.length === 1
                  ? "друг"
                  : friends.length < 5
                  ? "друга"
                  : "друзей"}
              </span>
              <button
                onClick={handleRefresh}
                className="bg-rose-500 border border-rose-400 text-white rounded-md font-semibold px-4 py-2 hover:bg-rose-600 active:scale-95"
              >
                Обновить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {friends.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-400 mb-2">
              Пока нет друзей
            </h3>
            <p className="text-neutral-500">
              Добавьте первых друзей, чтобы они появились здесь
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {friends.map((friendship) => {
              const friend = friendship.friend;
              return (
                <div
                  key={friendship.id || friend.id}
                  className="relative overflow-hidden rounded-md bg-[#242424] border border-[#424242] hover:border-[#525252] transition-colors"
                >
                  {/* Remove Friend Button */}
                  <button
                    onClick={() =>
                      handleRemoveFriend(friend.id, friend.username)
                    }
                    title="Remove friend"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Profile Image / Initial */}
                  <div className="aspect-square flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br from-blue-600 to-violet-500">
                    {friend.avatar ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name || "Friend"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
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
                        <h3 className="text-lg font-semibold">
                          <Link
                            to={`/chat/${friend.id}`}
                            className="hover:underline"
                          >
                            {friend.name || friend.username || "Безымянный"}
                          </Link>
                        </h3>
                        {friend.username && friend.name && (
                          <p className="text-sm text-neutral-400">
                            <Link
                              to={`/chat/${friendship.id}`}
                              className="hover:underline"
                            >
                              @{friend.username}
                            </Link>
                          </p>
                        )}
                      </div>
                      <UserCheck className="w-5 h-5 text-emerald-500" />
                    </div>

                    {/* Contact Info */}
                    <div className="mb-4">
                      {friend.bio && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{friend.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
