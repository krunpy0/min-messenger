import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function TestLogin() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState("");
  const socket = io("http://localhost:8080"); // Подключение к серверу

  useEffect(() => {
    // Слушаем события от сервера
    socket.on("connect", () => {
      console.log(socket.id);
    });
    socket.on("recieve-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    // socket.on("serverMessage", (msg) => {
    //  setMessages((prev) => [...prev, msg]);
    // });
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("send-message", input, room);
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Socket.IO Чат</h2>
      <div className="border p-2 h-40 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-1 flex-1"
          placeholder="Напиши сообщение..."
        />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="border p-1 flex-1"
          placeholder="Room..."
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white px-3 py-1"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}
