import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  async function checkAuth() {
    try {
      const res = await fetch("http://localhost:3000/api/me", {
        credentials: "include",
      });
      const result = await res.json();
      console.log(result);
      if (result.user) setUser(result.user);
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <>
      {user ? <p>Hello, {user.username}</p> : <p>Not logged in</p>}
      <h1>Hello world</h1>
    </>
  );
}

export default App;
