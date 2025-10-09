import { LucideTrash2, LucidePenLine } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function MessageItem({
  item,
  currentUserId,
  onDelete,
  onPreviewImage,
  onEdit,
}) {
  return (
    <div className="mb-5 flex items-top gap-4 hover:bg-neutral-900 p-1.5 group relative">
      <div className="max-w-12 ml-5 ">
        {currentUserId === item.userId && (
          <div className="hidden group-hover:flex gap-2 absolute right-[0] mr-5">
            <button onClick={() => onDelete(item)}>
              <LucideTrash2 />
            </button>
            <button onClick={() => onEdit?.(item)}>
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
              {dayjs(item.createdAt).fromNow()}, at{" "}
              {dayjs(item.createdAt).format("H:mm")}
            </span>
          </p>
        </div>
        <div>
          <p className="m-0">{item.text}</p>
        </div>
        <button onClick={() => onDelete(item.id)}>delete</button>
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
                ) : (
                  <div className="flex border-gray-700 border-2 rounded-2xl p-4 mt-2">
                    <a href={file.url}>{file.name || file.url}</a>
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
