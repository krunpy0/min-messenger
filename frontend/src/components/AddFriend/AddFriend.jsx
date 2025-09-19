import { useState, useEffect, useRef } from "react";
export function AddFriend() {
  const [friend, setFriend] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  async function search(query) {
    if (!friend.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/${query}`,
        {
          credentials: "include",
        }
      );
      const response = await res.json();
      setResults(response);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }

  async function sendFriendRequest(friendId) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/friends/send/${friendId}`,
        { method: "POST", credentials: "include" }
      );
      const response = await res.json();
      console.log(response);

      if (res.ok) {
        alert("Friend request sent");
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (err) {
      console.log(err);
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
    <>
      <div>
        <label htmlFor="friend">Add friend</label>
        <input
          type="text"
          id="friend"
          name="friend"
          onChange={(e) => setFriend(e.target.value)}
          value={friend}
        />
        <div>
          {results &&
            results.map((result) => (
              <>
                <div style={{ display: "flex", gap: "10px" }} key={result.id}>
                  <p>{result.username}</p>{" "}
                  <button
                    style={{ cursor: "pointer", padding: "5px 10px" }}
                    onClick={() => sendFriendRequest(result.id)}
                  >
                    Add
                  </button>
                </div>
              </>
            ))}
        </div>
      </div>
    </>
  );
}
