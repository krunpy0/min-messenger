import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";
import { useParams } from "react-router-dom";
import { DivideSquare } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MessageItem from "./MessageItem";
import AttachmentsBar from "./AttachmentsBar";
import Composer from "./Composer";

dayjs.extend(relativeTime);
export default function ChatComponent() {
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [totalMessages, setTotalMessages] = useState(0);
  const [pageLimit] = useState(20);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isUserAtBottomRef = useRef(true);
  const dragCounter = useRef(0);
  // const [input, setInput] = useState("");
  // const [room, setRoom] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { room } = useParams();
  console.log(room);
  function editMessage(message) {}
  async function getUser() {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      credentials: "include",
    });
    const data = await res.json();
    console.log(data);
    setUser(data.user);
  }
  useEffect(() => {
    getUser();
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  // Auto-scroll to bottom on new messages only if user was already at bottom
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (isUserAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);
  // Function to fetch chat messages for a given chatId (room) and set them in state
  async function getChatMessages(
    chatId,
    { limit = pageLimit, offset = 0, replace = false } = {}
  ) {
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
        if (replace) setMessages([]);
        return [];
      }
      const data = await res.json();
      const items = data.items || [];
      const total = Number.isFinite(data.total) ? data.total : 0;
      setTotalMessages(total);

      if (replace) {
        setMessages(items.filter((m) => m.deleted == false));
        setNextOffset(items.length);
      } else {
        setMessages((prev) => {
          const byId = new Set(prev.map((m) => m.id));
          const uniqueToAdd = items.filter((m) => !byId.has(m.id));
          return [...prev, ...uniqueToAdd];
        });
        setNextOffset((prev) => prev + items.length);
      }
      return items;
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      if (replace) setMessages([]);
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
        setNextOffset(0);
        await getChatMessages(response.id, {
          limit: pageLimit,
          offset: 0,
          replace: true,
        });
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
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMessage.id)) return prev;
        return [incomingMessage, ...prev];
      });
      setTotalMessages((prev) => (Number.isFinite(prev) ? prev + 1 : 1));
    });

    socket.on("deleted-message", (message) => {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      setTotalMessages((prev) => (Number.isFinite(prev) ? prev - 1 : 0));
    });

    socket.on("edited-message", (message) => {
      console.log(message);
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    return () => {
      socket.off("receive-message");
      socket.off("deleted-message");
      socket.off("edited-message");
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  // Infinite scroll: load older messages when reaching top
  useEffect(() => {
    function handleScroll() {
      const el = messagesContainerRef.current;
      if (!el || isLoadingPage) return;
      // Track whether user is near bottom (within 16px tolerance)
      const tolerance = 16;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      isUserAtBottomRef.current = distanceFromBottom <= tolerance;
      if (el.scrollTop <= 0 && messages.length < totalMessages) {
        // Preserve scroll position after appending older messages
        const prevScrollHeight = el.scrollHeight;
        setIsLoadingPage(true);
        getChatMessages(chat?.id, {
          limit: pageLimit,
          offset: nextOffset,
          replace: false,
        }).finally(() => {
          requestAnimationFrame(() => {
            const newScrollHeight = el.scrollHeight;
            el.scrollTop = newScrollHeight - prevScrollHeight;
            setIsLoadingPage(false);
          });
        });
      }
    }

    const el = messagesContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    // Initialize position flag at mount
    const tolerance = 16;
    isUserAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= tolerance;
    return () => el.removeEventListener("scroll", handleScroll);
  }, [chat?.id, nextOffset, messages.length, totalMessages, isLoadingPage]);

  // Close fullscreen preview on Escape
  useEffect(() => {
    if (!previewImage) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setPreviewImage(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

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
      setAttachments([]);
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteMessage(message) {
    try {
      socket.emit("delete-message", chat.id, message);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div>
      <div>
        <h1>Chat</h1>
        <div>
          <div
            ref={messagesContainerRef}
            className="max-h-[90vh] overflow-scroll"
          >
            {messages.length < totalMessages && (
              <div className="text-center text-sm text-gray-400 py-2">
                {isLoadingPage ? "Loading..." : "Scroll up to load more"}
              </div>
            )}
            {[...messages].reverse().map((m) => (
              <MessageItem
                key={m.id}
                item={m}
                currentUserId={user?.id}
                onDelete={(x) => deleteMessage(x)}
                onPreviewImage={(img) => setPreviewImage(img)}
                onEdit={(message, newText) => {
                  try {
                    if (!chat?.id) return;
                    socket.emit("edit-message", chat.id, {
                      ...message,
                      text: newText,
                    });
                  } catch (e) {
                    console.error(e);
                  }
                }}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <AttachmentsBar
            attachments={attachments}
            onClearAll={clearAttachments}
            onRemoveAt={(idx) => removeAttachment(idx)}
          />
          <Composer
            value={message}
            onChange={setMessage}
            onSubmit={sendMessage}
          />
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
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <button
            aria-label="Close image preview"
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
          >
            ×
          </button>
          <img
            src={previewImage.url}
            alt={previewImage.name || "preview"}
            className="max-w-[95vw] max-h-[95vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
