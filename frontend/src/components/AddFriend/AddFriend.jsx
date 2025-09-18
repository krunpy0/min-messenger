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
      setResults([]);
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
                <div style={{ display: "flex" }}>
                  <p>{result.username}</p> <button>Add</button>
                </div>
              </>
            ))}
        </div>
      </div>
    </>
  );
}
