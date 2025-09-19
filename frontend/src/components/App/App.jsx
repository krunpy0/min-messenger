import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AddFriend } from "../AddFriend/AddFriend";
import FriendsPage from "../Friends/FriendsPage";

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
      {user ? (
        <p>Hello, {user.username}</p>
      ) : (
        <>
          <p>Not logged in</p> <Link to={"/login"}>Log in</Link>
        </>
      )}
      <h1>Hello world</h1>
      <AddFriend />
      <Link to={"/friends"}>Friends</Link>
    </>
  );
}

export default App;
