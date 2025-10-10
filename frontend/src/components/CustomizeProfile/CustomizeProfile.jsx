import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function CustomizeProfile() {
  /*
    {
  id: 'c4f44740-74a6-458c-8721-bc91f93ef2ea',
  username: 'test-acc',
  password: '$2b$10$2HbVoRu.zWJ2Xoz9wlLAHu/UvREYQ9LMVjd3LY89AHlxHXt1GGeP6',
  createdAt: 2025-10-09T17:10:53.559Z,
  updatedAt: 2025-10-09T17:10:53.559Z,
  birthday: null,
  bio: null,
  avatarUrl: null
}
  */
  const [user, setUser] = useState({});
  console.log(user);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get("referrer");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  console.log(referrer);

  async function getUser() {
    const res = await fetch(`${API_BASE_URL}/api/me/extended`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
    } else {
      navigate("/auth");
    }
  }

  async function handleApply() {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...user,
        birthday: new Date(user.birthday).toISOString(),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      if (referrer === "auth") {
        navigate("/");
      }
    } else {
      toast.error(data.message);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/api/files/cdn`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    console.log(data);
    setUser({ ...user, avatarUrl: data.url });
    setIsEditingAvatar(false);
  }

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2 w-full">
      <h1 className="text-4xl font-semibold mb-2">Customize Profile</h1>
      <div className="max-w-[700px] w-full bg-[#242424] border border-[#424242] rounded-md flex p-15 gap-10">
        <div className="flex flex-col gap-4">
          <div className="w-[200px] h-[200px] bg-neutral-900 rounded-full relative group">
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            )}
            <button
              className="bg-[#202020] border border-[#363636] rounded-md p-2 absolute bottom-0 right-0 text-sm hover:bg-[#363636]
            active:scale-95 cursor-pointer hidden group-hover:block"
              onClick={() => setIsEditingAvatar(true)}
            >
              Change avatar
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-2xl">
              <strong>{user.name || user.username}</strong>
            </p>
            <p className="text-base text-neutral-400">@{user.username}</p>
          </div>
        </div>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleApply();
          }}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="username">Username</label>
            <input
              required
              type="text"
              name="username"
              id="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="bg-[#202020] border border-[#363636] rounded-md p-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-[#C5C5C5] font-medium">
              Name (optional)
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="bg-[#202020] border border-[#363636] rounded-md p-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="bio" className="text-[#C5C5C5] font-medium">
              Bio (optional)
            </label>
            <textarea
              name="bio"
              id="bio"
              value={user.bio}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
              className="bg-[#202020] border border-[#363636] rounded-md p-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="birthday" className="text-[#C5C5C5] font-medium">
              Дата рождения (optional)
            </label>
            <input
              type="date"
              name="birthday"
              id="birthday"
              className="bg-[#202020] border border-[#363636] rounded-md p-2"
              value={user.birthday}
              onChange={(e) => setUser({ ...user, birthday: e.target.value })}
            />
          </div>
          <div>
            <button className="w-full bg-rose-500 border border-rose-400 rounded-lg p-2 font-semibold hover:bg-rose-600 active:scale-95">
              Apply
            </button>
          </div>
        </form>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
      />
      {isEditingAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-neutral-900 rounded-md p-4 flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Edit Avatar</h1>
            <input
              type="file"
              onChange={handleAvatarChange}
              className="bg-[#202020] border border-[#363636] rounded-md p-2"
            />
            <button
              onClick={() => setIsEditingAvatar(false)}
              className="bg-[#202020] border border-[#363636] rounded-md p-2"
            >
              Apply
            </button>
            <button
              onClick={() => setIsEditingAvatar(false)}
              className="bg-[#202020] border border-[#363636] rounded-md p-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
