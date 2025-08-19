import styles from "./SignUp.module.css";
import { useState } from "react";
import { Link } from "react-router-dom";

export function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resultStatus, setResultStatus] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    setResultStatus(null);
  }

  return (
    <>
      <div className={styles.main}>
        <h1>Create new account</h1>
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
            Already have an account? <Link to={"/login"}>Log in</Link>
          </p>
          {result && (
            <p className={resultStatus ? styles.success : styles.failed}>
              {result}
            </p>
          )}
          <button type="submit">Sign in</button>
        </form>
      </div>
    </>
  );
}
