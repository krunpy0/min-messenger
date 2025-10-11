import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../Profile/ProfileHeader";
import FriendsList from "../Friends/FriendsList";
import { FriendRequests } from "../FriendRequests/FriendRequests";
import { AddFriendCard } from "../AddFriend/AddFriendCard";
import ProfileCard from "../Profile/ProfileCard";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
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

  const handleProfileClick = (profileUser, isOwn = false) => {
    setSelectedProfile(profileUser);
    setIsOwnProfile(isOwn);
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
    setIsOwnProfile(false);
  };

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
    <div className="min-h-[100vh] bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Profile Header */}
          <div className="lg:col-span-2">
            <ProfileHeader onProfileClick={handleProfileClick} />
          </div>
          {/* Main Content */}
          {/* Left Column - Add Friend */}
          <div className="space-y-4 sm:space-y-6">
            <AddFriendCard />
            <div>
              <FriendRequests onProfileClick={handleProfileClick} />
            </div>
          </div>
          {/* Right Column - Friends List */}
          <div className="space-y-4 sm:space-y-6">
            <FriendsList onProfileClick={handleProfileClick} />
          </div>
        </div>
      </div>
      {/* Profile Popup */}
      {selectedProfile && (
        <ProfileCard
          user={selectedProfile}
          onClose={handleCloseProfile}
          isOwnProfile={isOwnProfile}
        />
      )}
    </div>
  );
};

export default HomePage;
