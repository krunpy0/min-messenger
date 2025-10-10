import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Settings, LogOut } from "lucide-react";

const ProfileHeader = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/me/extended`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP Error: ${response.status}`);
        }
        console.log(data.user);
        setUser(data.user);
      } catch (err) {
        setError(err.message);
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/auth";
      }
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Error logging out");
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1120px] w-[97vw] mx-auto flex items-center justify-between bg-[#202020] border border-[#363636] rounded-2xl p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse"></div>
            <div className="h-6 w-32 bg-neutral-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-[1120px] w-[97vw] mx-auto flex items-center justify-between bg-[#202020] border border-[#363636] rounded-2xl p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-neutral-400" />
            <span className="text-neutral-400">Error loading profile</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="max-w-[1120px] w-[97vw] mx-auto flex items-center justify-between bg-[#202020] border border-[#363636] rounded-2xl p-4">
        <Link
          to="/customize"
          className="flex items-center gap-3 hover:bg-[#2a2a2a] rounded-lg p-2 transition-colors group"
        >
          {/* Profile Image / Initial */}
          <div className="w-10 h-10 flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-blue-400 to-violet-500 rounded-full">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || user.username}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>
                {(user.name || user.username || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-white font-semibold group-hover:text-rose-400 transition-colors">
              {user.name || user.username}
            </span>
            {user.name && user.username && (
              <span className="text-sm text-neutral-400">@{user.username}</span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/customize"
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
            title="Profile settings"
          >
            <Settings className="w-5 h-5 text-neutral-400 hover:text-rose-400 transition-colors" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5 text-neutral-400 hover:text-rose-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
