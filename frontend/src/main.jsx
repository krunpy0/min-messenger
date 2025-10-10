import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./components/App/App.jsx";
import HomePage from "./components/Home/HomePage.jsx";
import { Login } from "./components/Login/Login.jsx";
import { SignUp } from "./components/SignUp/SignUp.jsx";
import TestChatComponent from "./components/Chat/TestChatComponent.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FriendsPage from "./components/Friends/FriendsPage.jsx";
import { Logout } from "./components/Logout/Logout.jsx";
import { FriendRequests } from "./components/FriendRequests/FriendRequests.jsx";
import { Auth } from "./components/Auth/Auth.jsx";
import { CustomizeProfile } from "./components/CustomizeProfile/CustomizeProfile.jsx";
import { UserAgreement } from "./components/TOS/UserAgreement.jsx";
import { TermsOfService } from "./components/TOS/TermsOfService.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
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
    path: "/chat/:room?",
    element: <TestChatComponent />,
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
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/customize",
    element: <CustomizeProfile />,
  },
  {
    path: "/user-agreement",
    element: <UserAgreement />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
