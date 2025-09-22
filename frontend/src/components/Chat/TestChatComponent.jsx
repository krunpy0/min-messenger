import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useParams } from "react-router-dom";

export default function ChatComponent() {
  // 1: check if chat exists
  // 2: if it does, get the messages
  // 3: if it doesn't, set chat to null, create chat when user clicks send button
  // 4: get the messages
  // 5: display the messages
  // 6: send a message
  // 7: display the message
  // const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  // const [input, setInput] = useState("");
  // const [room, setRoom] = useState("");

  const { room } = useParams();
  console.log(room);

  function displayMessage(message) {
    setMessages((prev) => [...prev, message]);
  }
  useEffect(() => {
    socket.on("connect", () => {
      setMessages((messages) => [...messages, "Connected"]);
      socket.emit("join-room", room, (message) => {
        displayMessage(message);
      });
    });

    socket.on("recieve-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, [room]);
  // const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  async function sendMessage(message) {
    socket.emit("send-message", room, message);
  }

  /* async function getChat() {
    const res = await fetch(`${API_BASE_URL}/api/chat/${room}`, {
      credentials: "include",
    });
    const data = await res.json();
    setChat(data);
  } 

  useEffect(() => {
    getChat();
  }, [room]);
*/

  return (
    <div>
      <div>
        <h1>Chat</h1>
        <div>
          <div>
            {messages.map((message) => (
              <div>
                <p>{message}</p>
              </div>
            ))}
          </div>
          <input
            type="text"
            name="message-input"
            id="message-input"
            placeholder="type something here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={() => sendMessage(message)}>Send</button>
        </div>
      </div>
    </div>
  );
}
