import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  async function checkAuth() {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.user) {
      navigate("/");
    }
  }
  useEffect(() => {
    checkAuth();
  }, []);

  async function logIn() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  }

  async function signIn() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sign-up`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/customize?referrer=auth");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2 w-full">
      <h1 className="text-4xl font-semibold mb-2">
        {isLogin ? "Log in" : "Sign up"}
      </h1>
      <p className="text-base text-[#A6A6A6] mb-4">
        {isLogin
          ? "Log into your account"
          : "It seems that you're new here! Sign up now to get started."}
      </p>
      <form
        className="flex flex-col gap-4 max-w-md w-full"
        onSubmit={(e) => {
          e.preventDefault();
          isLogin ? logIn() : signIn();
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-base text-[#C5C5C5]">
            Username
          </label>
          <input
            type="text"
            placeholder="Username"
            className="bg-transparent border border-[#363636] rounded-md p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-base text-[#C5C5C5]">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent border border-[#363636] rounded-md p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="bg-rose-500 border border-rose-400 text-white rounded-md font-semibold p-2 hover:bg-[#ff4766] active:scale-95 cursor-pointer"
          type="submit"
        >
          Continue
        </button>
      </form>
      <p className="text-sm text-gray-500">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          className="text-rose-400 underline cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
