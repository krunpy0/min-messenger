import { useState, useEffect } from "react";
import { LoaderCircleIcon } from "lucide-react";
import Cropper from "react-easy-crop";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [applying, setApplying] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  console.log(referrer);

  async function getUser() {
    setApplying(true);
    const res = await fetch(`${API_BASE_URL}/api/me/extended`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      // const date = new Date(user.birthday);
      // const stringbd = new Date(
      // date.getTime() - date.getTimezoneOffset() * 60000
      // )
      // .toISOString()
      // .split("T")[0];

      // setUser({ ...user, birthday: stringbd });
    } else {
      navigate("/auth");
    }
    setApplying(false);
  }

  async function handleApply() {
    setApplying(true);
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
    setApplying(false);
  }

  function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите файл изображения.");
      return;
    }
    setNewAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);
  }

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });
  }

  async function getCroppedBlob(imageSrc, pixelCrop, mimeType = "image/jpeg") {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const targetSize = Math.max(pixelCrop.width, pixelCrop.height);
    canvas.width = targetSize;
    canvas.height = targetSize;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetSize,
      targetSize
    );
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        mimeType,
        0.9
      );
    });
  }

  async function handleApplyNewAvatar() {
    setUploadingAvatar(true);
    if (!newAvatarFile) {
      setIsEditingAvatar(false);
      return;
    }
    if (!newAvatarFile.type || !newAvatarFile.type.startsWith("image/")) {
      toast.error("Поддерживаются только изображения.");
      return;
    }
    let blobToUpload = null;
    try {
      if (avatarPreviewUrl && croppedAreaPixels) {
        const blob = await getCroppedBlob(
          avatarPreviewUrl,
          croppedAreaPixels,
          "image/jpeg"
        );
        blobToUpload = blob;
      }
    } catch (e) {
      // fallback to original file if cropping fails
      blobToUpload = newAvatarFile;
    }
    if (!blobToUpload) blobToUpload = newAvatarFile;

    const filename =
      newAvatarFile && newAvatarFile.name ? newAvatarFile.name : "avatar.jpg";
    const fileForUpload =
      blobToUpload instanceof Blob && !(blobToUpload instanceof File)
        ? new File([blobToUpload], filename, {
            type: blobToUpload.type || "image/jpeg",
          })
        : blobToUpload;

    const formData = new FormData();
    formData.append("file", fileForUpload);
    const res = await fetch(`${API_BASE_URL}/api/files/cdn`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data?.url) {
      setUser({ ...user, avatarUrl: data.url });
    } else {
      toast.error(data?.message || "Failed to upload avatar");
    }
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(null);
    setNewAvatarFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsEditingAvatar(false);
    setUploadingAvatar(false);
  }

  useEffect(() => {
    getUser();
  }, []);
  console.log(newAvatarFile);
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2 w-full">
      <h1 className="text-4xl font-semibold mb-2">Customize Profile</h1>
      <div className="max-w-[700px] w-full bg-[#242424] border border-[#424242] rounded-xl flex p-15 gap-10">
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
              value={dayjs(user.birthday).format("YYYY-MM-DD")}
              onChange={(e) => setUser({ ...user, birthday: e.target.value })}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-rose-500 border border-rose-400 rounded-lg p-2 font-semibold hover:bg-rose-600
              flex justify-center gap-4
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={applying}
            >
              Apply {applying && <LoaderCircleIcon className="animate-spin" />}
            </button>
          </div>
          {!referrer && (
            <div>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full bg-neutral-750 border border-neutral-600 rounded-lg p-2 font-semibold hover:bg-neutral-600
                flex justify-center gap-4"
              >
                Back
              </button>
            </div>
          )}
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
        <div
          className="fixed inset-0  bg-opacity-10 flex items-center z-50
        justify-center w-full border border-[#363636] bg-[#242424] rounded-md h-full  mx-auto"
        >
          <div className="bg-neutral-900 p-4 flex flex-col gap-3 border border-[#363636] rounded-md">
            <h1 className="text-2xl font-bold">Edit Avatar</h1>
            {avatarPreviewUrl && (
              <div className="relative w-[300px] h-[300px] bg-black self-center rounded-md overflow-hidden">
                <Cropper
                  image={avatarPreviewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(area, areaPixels) =>
                    setCroppedAreaPixels(areaPixels)
                  }
                  cropShape="round"
                  showGrid={false}
                />
              </div>
            )}
            <label htmlFor="avatar-input" className="cursor-pointer">
              <button
                className=" w-full bg-[#202020] border border-[#363636] rounded-md p-2 hover:bg-[#363636] active:scale-95 cursor-pointer"
                onClick={() => document.getElementById("avatar-input").click()}
              >
                Select avatar
              </button>
            </label>
            <input
              type="file"
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
              id="avatar-input"
            />
            {avatarPreviewUrl && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-400">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-[200px]"
                />
              </div>
            )}
            <button
              onClick={handleApplyNewAvatar}
              disabled={
                !avatarPreviewUrl || !croppedAreaPixels || uploadingAvatar
              }
              className="w-full flex justify-center gap-3 bg-rose-500 border border-rose-400 rounded-lg p-2 font-semibold hover:bg-rose-600
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
              {uploadingAvatar && <LoaderCircleIcon className="animate-spin" />}
            </button>
            <button
              onClick={() => {
                if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                setAvatarPreviewUrl(null);
                setNewAvatarFile(null);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setCroppedAreaPixels(null);
                setIsEditingAvatar(false);
              }}
              className="bg-[#202020] border border-[#363636] rounded-md p-2 hover:bg-[#363636] active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
