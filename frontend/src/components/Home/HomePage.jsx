import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../Profile/ProfileHeader";
import FriendsList from "../Friends/FriendsList";
import { AddFriendCard } from "../AddFriend/AddFriendCard";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        } else {
          navigate("/auth");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="h-[100vh] bg-[#1a1a1a] overflow-y-hidden">
      {/* Profile Header */}
      <div className="mt-4">
        <ProfileHeader />
      </div>
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Add Friend */}
          <div className="space-y-6">
            <AddFriendCard />
          </div>

          {/* Right Column - Friends List */}
          <div className="space-y-6">
            <FriendsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
