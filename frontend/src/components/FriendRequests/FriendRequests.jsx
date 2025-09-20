import { useState, useEffect } from "react";

export function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function getRequests() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/friends/requests/received`, {
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }
      
      setRequests(data.data || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      setError(err.message);
      alert(`❌ Failed to load friend requests: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function acceptRequest(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/requests/accept/${requestId}`, {
        method: "PUT",
        credentials: "include",
      });
      
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
      const response = await fetch(`${API_BASE_URL}/api/friends/requests/decline/${requestId}`, {
        method: "PUT",
        credentials: "include",
      });
      
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
  useEffect(() => {
    getRequests();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading friend requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={getRequests}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Friend Requests</h1>
      {requests.length === 0 ? (
        <p>No pending friend requests</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {requests.map((request) => (
            <div 
              key={request.id} 
              style={{ 
                border: '1px solid #ccc', 
                padding: '15px', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p><strong>{request.fromUser.username}</strong></p>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Sent {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => acceptRequest(request.id)}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Accept
                </button>
                <button 
                  onClick={() => declineRequest(request.id)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
