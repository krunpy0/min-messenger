import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useParams } from "react-router-dom";

export default function ChatComponent() {
  // 1: get chat info
  // 2: if there's no chat, set chat to null, create chat when user clicks send button
  // 3: get the messages
  // 4: display the messages
  // 5: send a message
  // 6: display the message
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  // const [input, setInput] = useState("");
  // const [room, setRoom] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { room } = useParams();
  console.log(room);

  async function getChatInfo() {
    try {
      const result = await fetch(`${API_BASE_URL}/api/chats/${room}`, {
        credentials: "include"
      });
      const response = await result.json();
      if (!response) return setChat(null)
        setChat(response)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getChatInfo()
  }, [room])

  async function createChat() {
    try {
      const result = await fetch(`${API_BASE_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ type: "private", membersId: [room], name: room })
      });
      const response = await result.json();
      setChat(response)
    } catch (err) {
      console.log(err)
    }
  }

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
  
  async function sendMessage(message) {
    if (!chat) {
      createChat()
    }
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
