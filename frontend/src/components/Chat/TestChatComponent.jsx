import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";
import { useParams } from "react-router-dom";
import { DivideSquare, LucideSendHorizonal } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
export default function ChatComponent() {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const dragCounter = useRef(0);
  // const [input, setInput] = useState("");
  // const [room, setRoom] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { room } = useParams();
  console.log(room);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);
  // Function to fetch chat messages for a given chatId (room) and set them in state
  async function getChatMessages(chatId, { limit = 20, offset = 0 } = {}) {
    if (!chatId) return [];
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to fetch messages", res.status);
        setMessages([]); // Clear messages on error
        return [];
      }
      const data = await res.json();
      const items = data.items || [];
      console.log(items);
      setMessages(items);
      return items;
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      setMessages([]);
      return [];
    }
  }

  async function getChatInfo() {
    try {
      const result = await fetch(`${API_BASE_URL}/api/chats/${room}`, {
        credentials: "include",
      });
      const response = await result.json();
      console.log(response);
      if (!response) {
        setChat(null);
      } else {
        setChat(response);
        getChatMessages(response.id);
        // If chat exists, connect and join its room immediately
        ensureSocketConnected();
        joinRoom(response.id);
      }
      //console.log(chat)
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getChatInfo();
  }, [room]);
  useEffect(() => {
    // Setup listeners once
    socket.on("receive-message", (incomingMessage) => {
      setMessages((prev) => [incomingMessage, ...prev]);
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    return () => {
      socket.off("receive-message");
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  // Global page drag-and-drop handlers
  useEffect(() => {
    function handleDragEnter(e) {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      // Show overlay when something draggable enters
      setIsDragging(true);
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    }

    function handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    }

    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const dt = e.dataTransfer;
      if (!dt) return;

      // Prefer dropped text if present
      const droppedText = dt.getData("text/plain") || dt.getData("text");
      if (droppedText && droppedText.trim().length > 0) {
        setMessage(droppedText);
        // don't return: user may also drop files along with text in some apps
      }

      // Collect files into attachments state (no upload yet)
      if (dt.files && dt.files.length > 0) {
        const incoming = Array.from(dt.files).filter((f) => f && f.size >= 0);
        if (incoming.length > 0) {
          setAttachments((prev) => {
            const byKey = new Map(
              prev.map((f) => [`${f.name}:${f.size}:${f.lastModified}`, f])
            );
            for (const file of incoming) {
              const key = `${file.name}:${file.size}:${file.lastModified}`;
              if (!byKey.has(key)) byKey.set(key, file);
            }
            return Array.from(byKey.values());
          });
        }
      }
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  function ensureSocketConnected() {
    if (!socket.connected) {
      socket.connect();
    }
  }

  function joinRoom(roomId) {
    if (!roomId) return;
    socket.emit("join-room", roomId, (ack) => {
      displayMessage(ack);
    });
  }

  async function createChat() {
    try {
      const result = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "private",
          membersId: [room],
          name: room,
        }),
      });
      if (!result.ok) {
        console.error("Failed to create chat", result.status);
        return null;
      }
      const response = await result.json();
      if (!response || !response.id) {
        console.error("Invalid chat response", response);
        return null;
      }
      setChat(response);
      return response;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  function displayMessage(message) {
    setMessages((prev) => [...prev, message]);
  }

  // Remove a single attachment
  function removeAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  // Clear all attachments
  function clearAttachments() {
    setAttachments([]);
  }

  // Build FormData to send later (not sending yet)
  function buildFormData() {
    const form = new FormData();
    form.append("text", message || "");
    attachments.forEach((file, idx) => {
      form.append("files[]", file, file.name);
    });
    return form;
  }

  async function sendAttachment() {
    const formData = buildFormData();
    const res = await fetch(`${API_BASE_URL}/api/files/storage`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    console.log(data);
    return data;
  }

  async function sendMessage(outgoingMessage) {
    if (!outgoingMessage?.trim() && attachments.length <= 0) return;

    try {
      let currentChat = chat;
      if (!currentChat) {
        currentChat = await createChat();
        if (!currentChat) {
          // Do not proceed if chat could not be created
          return;
        }
        // After creating chat, connect and join
        ensureSocketConnected();
        joinRoom(currentChat.id);
      }

      // Make sure we're connected and in the room
      ensureSocketConnected();
      joinRoom(currentChat.id);
      let files;

      if (attachments.length > 0) {
        files = await sendAttachment();
      }
      socket.emit("send-message", currentChat.id, outgoingMessage, files);
      setMessage("");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div>
        <h1>Chat</h1>
        <div>
          <div className="max-h-[90vh] overflow-scroll">
            {[...messages].reverse().map((message) => (
              <div className="mb-5 flex items-top gap-4 hover:bg-neutral-900 p-1.5">
                <div className="max-w-12 ml-5">
                  {message.user.avatarUrl ? (
                    <img
                      src={message.user.avatarUrl}
                      alt=""
                      className=" rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-blue-700 w-12 h-12 rounded-full font-medium text-xl pt-1">
                      {message.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex gap-2">
                    <p className="m-0 font-bold">{message.user.username}</p>{" "}
                    <p>
                      {" "}
                      <span
                        className="text-gray-500"
                        title={dayjs(message.createdAt).format(
                          "dddd, MMMM D YYYY, HH:mm"
                        )}
                      >
                        {dayjs(message.createdAt).fromNow()}, at{" "}
                        {dayjs(message.createdAt).format("H:mm")}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="m-0">{message.text}</p>
                  </div>
                  {message.files && (
                    <div>
                      {message.files.map((file) => (
                        <div key={file.url}>
                          {file.type.startsWith("image/") ? (
                            <div className="max-w-3xl ">
                              <img src={file.url} alt={file.name}></img>
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
            ))}
            <div ref={messagesEndRef} />
          </div>
          {attachments.length > 0 && (
            <div className="px-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 text-sm text-gray-400">
                  Attachments ({attachments.length})
                </p>
                <button
                  onClick={clearAttachments}
                  className="text-xs text-gray-300 hover:text-white underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}-${idx}`}
                    className="flex items-center gap-2 rounded-lg border border-gray-600 px-2 py-1 bg-neutral-900"
                  >
                    <span
                      className="text-sm text-gray-200 truncate max-w-[16rem]"
                      title={`${file.name} (${(file.size / 1024).toFixed(
                        1
                      )} KB)`}
                    >
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-row gap-1 p-2">
            <input
              type="text"
              name="message-input"
              id="message-input"
              placeholder="type something here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-2xl p-3  border-2 border-gray-400"
            />
            <button
              onClick={() => {
                sendMessage(message);
              }}
              className="rounded-2xl p-3 border-2 border-gray-400 hover:border-gray-600 active:scale-95"
            >
              <LucideSendHorizonal />
            </button>
          </div>
        </div>
      </div>
      {isDragging && (
        <div
          aria-label="Drop files or text to add to message"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="pointer-events-none border-2 border-dashed border-gray-300 rounded-2xl px-8 py-6 bg-neutral-900/70 text-gray-200 text-lg">
            Drop to add to message
          </div>
        </div>
      )}
    </div>
  );
}
