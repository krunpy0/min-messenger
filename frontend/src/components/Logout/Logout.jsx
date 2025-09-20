import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export function Logout() {
  const navigate = useNavigate();
  async function logout() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
        credentials: "include",
      });
      const response = await res.json();
      console.log(response);
      if (res.ok) {
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    logout();
  }, []);
  return <p>Logging out...</p>;
}
