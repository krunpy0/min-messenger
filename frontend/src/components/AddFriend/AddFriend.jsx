import { useState, useEffect, useRef } from "react";

export function AddFriend() {
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
      
      const response = await fetch(`${API_BASE_URL}/api/user?username=${query}`, {
        credentials: "include",
      });
      
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
      const response = await fetch(`${API_BASE_URL}/api/friends/requests/send/${friendId}`, {
        method: "POST",
        credentials: "include",
      });
      
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
    <div style={{ padding: '20px' }}>
      <div>
        <label htmlFor="friend" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Add Friend
        </label>
        <input
          type="text"
          id="friend"
          name="friend"
          placeholder="Search by username..."
          onChange={(e) => setFriend(e.target.value)}
          value={friend}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        
        {loading && (
          <p style={{ color: '#666', marginTop: '10px' }}>Searching...</p>
        )}
        
        {error && (
          <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>
        )}
        
        <div style={{ marginTop: '15px' }}>
          {results.length > 0 && (
            <h3 style={{ marginBottom: '10px' }}>Search Results:</h3>
          )}
          {results.map((result) => (
            <div 
              key={result.id}
              style={{ 
                display: "flex", 
                maxWidth: "500px",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                border: "1px solid #404040",
                borderRadius: "4px",
                marginBottom: "8px",
                backgroundColor: "#303030"
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{result.username}</p>
                {result.email && (
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {result.email}
                  </p>
                )}
              </div>
              <button
                style={{ 
                  cursor: "pointer", 
                  padding: "8px 16px",
                  backgroundColor: '#101010',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                onClick={() => sendFriendRequest(result.id)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#202020'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#101010'}
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
