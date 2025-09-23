import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";
import { useParams } from "react-router-dom";
import { LucideSendHorizonal } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
export default function ChatComponent() {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null)
  // const [input, setInput] = useState("");
  // const [room, setRoom] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { room } = useParams();
  console.log(room);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages])
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
      console.log(items)
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
      console.log(response)
      if (!response) {
        setChat(null);
      } else {
        setChat(response);
        getChatMessages(response.id)
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
  }, [room])
  useEffect(() => {
    // Setup listeners once
    socket.on("receive-message", (incomingMessage) => {
      setMessages((prev) => [incomingMessage, ...prev]);
    });

    socket.on('connect', () => {
      console.log('Socket connected')
    })

    return () => {
      socket.off('receive-message');
      socket.off('connect');
      socket.disconnect();
    }
  }, []);

  function ensureSocketConnected() {
    if (!socket.connected) {
      socket.connect();
    }
  }

  function joinRoom(roomId) {
    if (!roomId) return;
    socket.emit('join-room', roomId, (ack) => {
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
  async function sendMessage(outgoingMessage) {
    if (!outgoingMessage?.trim()) return;

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

      socket.emit("send-message", currentChat.id, outgoingMessage);
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
                  {
                  message.user.avatarUrl
                  ?
                  <img src={message.user.avatarUrl} alt="" className=" rounded-full" />
                  : <div className="flex items-center justify-center bg-blue-700 w-12 h-12 rounded-full font-medium text-xl pt-1">{message.user.username.charAt(0).toUpperCase()}</div> }
                </div>
                <div>
                  <div className="flex gap-2">
                <p className="m-0 font-bold">{message.user.username}</p> <p> <span className="text-gray-500" title={dayjs(message.createdAt).format('dddd, MMMM D YYYY, HH:mm')}>
                  {dayjs(message.createdAt).fromNow()}, at {dayjs(message.createdAt).format('H:mm')}
                  </span>
                  </p>
                </div>
                <div>
                 <p className="m-0">{message.text}</p>
                </div>
              </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
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
          <button onClick={() => sendMessage(message)} className="rounded-2xl p-3 border-2 border-gray-400 hover:border-gray-600 active:scale-95"><LucideSendHorizonal /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
