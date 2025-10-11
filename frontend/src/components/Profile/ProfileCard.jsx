import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Mail, MessageCircle, X } from "lucide-react";

const ProfileCard = ({ user, onClose, isOwnProfile = false }) => {
  const navigate = useNavigate();
  const [formattedBirthday, setFormattedBirthday] = useState("");
  const [formattedRegistration, setFormattedRegistration] = useState("");

  useEffect(() => {
    if (user?.birthday) {
      const birthday = new Date(user.birthday);
      setFormattedBirthday(
        birthday.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }

    if (user?.createdAt) {
      const registration = new Date(user.createdAt);
      setFormattedRegistration(
        registration.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
  }, [user]);

  const handleNameClick = () => {
    if (!isOwnProfile && user?.id) {
      navigate(`/chat/${user.id}`);
      onClose?.();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400 hover:text-rose-400" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br from-rose-400 to-red-500 rounded-full">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || user.username || "User"}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>
                {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Name and Username */}
        <div className="text-center mb-6">
          <h3
            className={`text-2xl font-semibold text-white mb-1 ${
              !isOwnProfile && user?.id
                ? "cursor-pointer hover:text-rose-400 transition-colors"
                : ""
            }`}
            onClick={handleNameClick}
          >
            {user?.name || user?.username || "Unnamed"}
          </h3>
          {user?.username && user?.name && (
            <p className="text-neutral-400">@{user.username}</p>
          )}
        </div>

        {/* Bio */}
        {user?.bio && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-neutral-300">Bio</span>
            </div>
            <p className="text-neutral-400 bg-[#1a1a1a] border border-[#363636] rounded-lg p-3">
              {user.bio}
            </p>
          </div>
        )}

        {/* Birthday */}
        {formattedBirthday && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-neutral-300">
                Birthday
              </span>
            </div>
            <p className="text-neutral-400 bg-[#1a1a1a] border border-[#363636] rounded-lg p-3">
              {formattedBirthday}
            </p>
          </div>
        )}

        {/* Registration Date */}
        {formattedRegistration && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-neutral-300">
                Registered
              </span>
            </div>
            <p className="text-neutral-400 bg-[#1a1a1a] border border-[#363636] rounded-lg p-3">
              {formattedRegistration}
            </p>
          </div>
        )}

        {/* Chat Button */}
        {!isOwnProfile && user?.id && (
          <button
            onClick={handleNameClick}
            className="w-full bg-rose-500 border border-rose-400 text-white rounded-lg font-semibold py-3 hover:bg-rose-600 active:scale-95 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Start Chat
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
