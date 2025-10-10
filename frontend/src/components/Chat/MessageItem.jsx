import { LucideTrash2, LucidePenLine } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import bytes from "bytes";
// removed incorrect backend import

dayjs.extend(relativeTime);

export default function MessageItem({
  item,
  currentUserId,
  onDelete,
  onPreviewImage,
  onEdit,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text || "");

  return (
    <div className="mb-5 flex items-top gap-4 hover:bg-neutral-900 p-1.5 group relative">
      <div className="max-w-12 ml-5 ">
        {currentUserId === item.userId && (
          <div className="hidden group-hover:flex gap-2 absolute right-[0] mr-5">
            <button onClick={() => onDelete(item)}>
              <LucideTrash2 />
            </button>
            <button
              onClick={() => {
                setEditText(item.text || "");
                setIsEditing(true);
              }}
            >
              <LucidePenLine />
            </button>
          </div>
        )}
        {item.user.avatarUrl ? (
          <img src={item.user.avatarUrl} alt="" className=" rounded-full" />
        ) : (
          <div className="flex items-center justify-center bg-blue-700 w-12 h-12 rounded-full font-medium text-xl pt-1">
            {item.user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <div className="flex gap-2">
          <p className="m-0 font-bold">{item.user.username}</p>{" "}
          <p>
            {" "}
            <span
              className="text-gray-500"
              title={dayjs(item.createdAt).format("dddd, MMMM D YYYY, HH:mm")}
            >
              {dayjs(item.createdAt).format("H:mm")}
              {item.updatedAt !== item.createdAt && <span> (Edited)</span>}
            </span>
          </p>
        </div>
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onEdit?.(item, editText);
                    setIsEditing(false);
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditText(item.text || "");
                  }
                }}
                className="w-full rounded-2xl p-2 border-2 border-neutral-400"
                autoFocus
              />
              <button
                onClick={() => {
                  onEdit?.(item, editText);
                  setIsEditing(false);
                }}
                className="rounded-2xl px-3 py-2 border-2 border-neutral-400 hover:border-neutral-600 active:scale-95"
              >
                Ok
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(item.text || "");
                }}
                className="text-sm text-gray-400 hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="m-0">{item.text}</p>
          )}
        </div>
        {item.files && (
          <div>
            {item.files.map((file) => (
              <div key={file.url}>
                {file.type.startsWith("image/") ? (
                  <div className="max-w-3xl ">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="cursor-zoom-in rounded-lg"
                      onClick={() =>
                        onPreviewImage({
                          url: file.url,
                          name: file.name,
                        })
                      }
                    />
                  </div>
                ) : file.type.startsWith("video/") ||
                  file.type === "application/mp4" ||
                  file.type === "application/x-mpegURL" ||
                  file.type === "application/x-m3u8" ? (
                  <div className="flex border-neutral-700 border-2 rounded-2xl p-4 mt-2 gap-2">
                    <video
                      controls
                      src={file.url}
                      className="rounded-lg max-w-3xl w-[95%]"
                    />
                  </div>
                ) : (
                  <div className="flex border-neutral-700 border-2 rounded-2xl p-4 mt-2 gap-2">
                    <a href={file.url}>{file.name || file.url}</a>
                    <p className="text-xs text-neutral-400">
                      {bytes(file.size)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
