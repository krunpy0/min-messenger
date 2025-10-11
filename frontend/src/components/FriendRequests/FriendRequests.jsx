import { useState, useEffect } from "react";
import {
  UserCheck,
  UserPlus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Clock,
} from "lucide-react";

export function FriendRequests({ onProfileClick }) {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [pending, setPending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function getRequests() {
    setLoading(true);
    setError(null);
    try {
      const [received, sent] = await Promise.all([
        fetch(`${API_BASE_URL}/api/friends/requests/received`, {
          credentials: "include",
        }).then((r) => r.json()),

        fetch(`${API_BASE_URL}/api/friends/requests/sent`, {
          credentials: "include",
        }).then((r) => r.json()),
      ]);

      setReceivedRequests(received.data || []);
      setSentRequests(sent.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }

    console.log(sentRequests);
    console.log(receivedRequests);
  }
  async function acceptRequest(requestId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friends/requests/accept/${requestId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      alert(`✅ ${data.message}`);
      getRequests(); // Refresh the list
    } catch (err) {
      console.error("Error accepting friend request:", err);
      alert(`❌ Failed to accept request: ${err.message}`);
    }
  }

  async function declineRequest(requestId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friends/requests/decline/${requestId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      alert(`✅ ${data.message}`);
      getRequests(); // Refresh the list
    } catch (err) {
      console.error("Error declining friend request:", err);
      alert(`❌ Failed to decline request: ${err.message}`);
    }
  }

  async function cancelRequest(requestId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/friends/requests/cancel/${requestId}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      alert(`✅ ${data.message}`);
      getRequests(); // Refresh the list
    } catch (err) {
      console.error("Error canceling friend request:", err);
      alert(`❌ Failed to cancel request: ${err.message}`);
    }
  }
  useEffect(() => {
    getRequests();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl font-semibold text-white">Friend Requests</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
          <span className="ml-2 text-neutral-400">
            Loading friend requests...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl font-semibold text-white">Friend Requests</h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Loading error
          </h3>
          <p className="text-neutral-400 mb-4">{error}</p>
          <button
            onClick={getRequests}
            className="bg-rose-500 border border-rose-400 text-white rounded-lg font-semibold px-4 py-2 hover:bg-rose-600 active:scale-95 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const currentRequests = pending ? receivedRequests : sentRequests;
  const requestCount = currentRequests.length;

  return (
    <div className="bg-[#242424] border border-[#424242] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-rose-400" />
          <h2 className="text-xl font-semibold text-white">Friend Requests</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#1a1a1a] border border-[#363636] text-neutral-300">
            {requestCount}{" "}
            {requestCount === 1
              ? "request"
              : requestCount < 5
              ? "requests"
              : "requests"}
          </span>
          <button
            onClick={getRequests}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            title="Update"
          >
            <RefreshCw className="w-4 h-4 text-neutral-400 hover:text-rose-400" />
          </button>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            pending
              ? "bg-rose-500 border border-rose-400 text-white"
              : "bg-[#1a1a1a] border border-[#363636] text-neutral-300 hover:border-[#525252]"
          }`}
          onClick={() => setPending(true)}
        >
          <Clock className="w-4 h-4" />
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            !pending
              ? "bg-rose-500 border border-rose-400 text-white"
              : "bg-[#1a1a1a] border border-[#363636] text-neutral-300 hover:border-[#525252]"
          }`}
          onClick={() => setPending(false)}
        >
          <UserPlus className="w-4 h-4" />
          Sent
        </button>
      </div>

      {currentRequests.length === 0 ? (
        <div className="text-center py-8">
          <UserCheck className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-400 mb-2">
            {pending ? "No pending requests" : "No sent requests"}
          </h3>
          <p className="text-neutral-500">
            {pending
              ? "You don't have any pending friend requests"
              : "You haven't sent any friend requests yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentRequests.map((request) => {
            const user = pending ? request.fromUser : request.toUser;
            return (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#363636] rounded-lg hover:border-[#525252] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-rose-400 to-red-500 rounded-full">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || user.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>
                        {(user.name || user.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User info */}
                  <div>
                    <h3
                      className="text-white font-medium cursor-pointer hover:text-rose-400 transition-colors"
                      onClick={() => onProfileClick?.(user)}
                    >
                      {user.name || user.username}
                    </h3>
                    {user.name && user.username && (
                      <p className="text-sm text-neutral-400">
                        @{user.username}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500">
                      {pending ? "Sent" : "Sent to"}{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {pending ? (
                    <>
                      <button
                        onClick={() => acceptRequest(request.id)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors active:scale-95"
                        title="Accept request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => declineRequest(request.id)}
                        className="p-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition-colors active:scale-95"
                        title="Decline request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => cancelRequest(request.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg font-medium transition-colors active:scale-95 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
