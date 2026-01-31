import styles from "../SignUp/SignUp.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resultStatus, setResultStatus] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  async function checkAuth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        credentials: "include",
      });
      const result = await res.json();
      if (result.user) navigate("/");
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    checkAuth();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    setResultStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      setResultStatus(res.ok);
      const fetchResult = await res.json();
      console.log(fetchResult);
      setResult(fetchResult.message);
      if (res.ok) {
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      setResultStatus(false);
      setResult(`Failed to sign up, ${JSON.stringify(err)}`);
    }
  }

  return (
    <>
      <div className={styles.main}>
        <h1>Log into your account</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.label}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.label}>
            <label htmlFor="username">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className={styles.prompt}>
            Don't have an account? <Link to={"/sign-up"}>Sign up</Link>
          </p>
          {result && (
            <p className={resultStatus ? styles.success : styles.failed}>
              {result}
            </p>
          )}
          <button type="submit">Log in</button>
        </form>
      </div>
    </>
  );
}
