import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

export default function ChatComponent() {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState("");
  const socket = io("http://localhost:8080"); // Подключение к серверу
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const params = useParams();
  setRoom(params.room);

  async function getChat() {
    const res = await fetch(`${API_BASE_URL}/api/chat/${room}`, {
      credentials: "include",
    });
    const data = await res.json();
    setChat(data);
  }

  useEffect(() => {
    getChat();
  }, [room]);

  return (
    <div>
      <div>
        <h1>Chat</h1>
      </div>
    </div>
  );
}
