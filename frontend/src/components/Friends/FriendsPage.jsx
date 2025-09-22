import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    if (!window.confirm(`Are you sure you want to remove ${friendUsername} from your friends?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/remove/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
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
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Loader2
            style={{
              width: 32,
              height: 32,
              color: "#2563eb",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6b7280" }}>Загружаем список друзей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: 32,
            borderRadius: 8,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            maxWidth: 384,
            width: "100%",
            margin: "0 16px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <AlertCircle
              style={{
                width: 48,
                height: 48,
                color: "#ef4444",
                margin: "0 auto 16px",
              }}
            />
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Ошибка загрузки
            </h2>
            <p
              style={{
                color: "#6b7280",
                marginBottom: 24,
              }}
            >
              {error}
            </p>
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Users style={{ width: 32, height: 32, color: "#2563eb" }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                Мои друзья
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  padding: "4px 12px",
                  borderRadius: 50,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {friends.length}{" "}
                {friends.length === 1
                  ? "друг"
                  : friends.length < 5
                  ? "друга"
                  : "друзей"}
              </span>
              <button
                onClick={handleRefresh}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#1d4ed8")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
              >
                <span>Обновить</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        {friends.length === 0 ? (
          <div
            style={{ textAlign: "center", paddingTop: 64, paddingBottom: 64 }}
          >
            <Users
              style={{
                width: 64,
                height: 64,
                color: "#d1d5db",
                margin: "0 auto 16px",
              }}
            />
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: 8,
              }}
            >
              Пока нет друзей
            </h3>
            <p style={{ color: "#9ca3af" }}>
              Добавьте первых друзей, чтобы они появились здесь
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {friends.map((friendship) => {
              const friend = friendship.friend; // Access the friend data from the relationship
              return (
                <div
                  key={friendship.id || friend.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                    transition: "box-shadow 0.3s",
                    position: "relative",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
                  }
                >
                {/* Remove Friend Button */}
                <button
                  onClick={() => handleRemoveFriend(friend.id, friend.username)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 1,
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                  title="Remove friend"
                >
                  <Trash2 size={16} />
                </button>

                {/* Profile Image */}
                <div
                  style={{
                    aspectRatio: "1",
                    background:
                      "linear-gradient(to bottom right, #60a5fa, #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 30,
                    fontWeight: 700,
                  }}
                >
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.name || "Friend"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
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
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontWeight: 600,
                          color: "#111827",
                          fontSize: 18,
                        }}
                      >
                        <Link to={`/chat/${friend .id}`}>{friend.name || friend.username || "Безымянный"}</Link>
                      </h3>
                      {friend.username && friend.name && (
                        <p style={{ color: "#6b7280", fontSize: 14 }}>
                          <Link to={`/chat/${friendship.id}`}>@{friend.username}</Link>
                        </p>
                      )}
                    </div>
                    <UserCheck
                      style={{ width: 20, height: 20, color: "#10b981" }}
                    />
                  </div>

                  {/* Contact Info */}
                  <div style={{ marginBottom: 16 }}>
                    {friend.email && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "#6b7280",
                          fontSize: 14,
                          marginBottom: 8,
                        }}
                      >
                        <Mail style={{ width: 16, height: 16 }} />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {friend.email}
                        </span>
                      </div>
                    )}
                    {friend.phone && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "#6b7280",
                          fontSize: 14,
                          marginBottom: 8,
                        }}
                      >
                        <Phone style={{ width: 16, height: 16 }} />
                        <span>{friend.phone}</span>
                      </div>
                    )}
                    {friend.joinedDate && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "#9ca3af",
                          fontSize: 14,
                        }}
                      >
                        <Calendar style={{ width: 16, height: 16 }} />
                        <span>
                          Друзья с{" "}
                          {new Date(friend.joinedDate).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {friend.status && (
                    <div style={{ marginBottom: 16 }}>
                      <p
                        style={{
                          color: "#4b5563",
                          fontSize: 14,
                          fontStyle: "italic",
                        }}
                      >
                        "{friend.status}"
                      </p>
                    </div>
                  )}

                  {/* Online Status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: friend.online
                            ? "#4ade80"
                            : "#9ca3af",
                        }}
                      ></div>
                      <span style={{ fontSize: 14, color: "#6b7280" }}>
                        {friend.online ? "В сети" : "Не в сети"}
                      </span>
                    </div>
                    {friend.lastSeen && !friend.online && (
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>
                        {new Date(friend.lastSeen).toLocaleDateString("ru-RU")}
                      </span>
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
