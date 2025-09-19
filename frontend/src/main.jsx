import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App/App.jsx";
import { Login } from "./components/Login/Login.jsx";
import { SignUp } from "./components/SignUp/SignUp.jsx";
import TestLogin from "./components/TestLogin/TestLogin.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FriendsPage from "./components/Friends/FriendsPage.jsx";
import { Logout } from "./components/Logout/Logout.jsx";
import { FriendRequests } from "./components/FriendRequests/FriendRequests.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/test-chat",
    element: <TestLogin />,
  },
  {
    path: "/friends",
    element: <FriendsPage />,
  },
  {
    path: "/friends/requests",
    element: <FriendRequests />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
