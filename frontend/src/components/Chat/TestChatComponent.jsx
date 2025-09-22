import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useParams } from "react-router-dom";

export default function ChatComponent() {

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  // const [input, setInput] = useState("");
  // const [room, setRoom] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { room } = useParams();
  console.log(room);

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
          <div>
            {[...messages].reverse().map((message) => (
              <div>
                <p style={{margin: 2}}>{message.user.username} <span style={{color: "#505050"}}>{message.createdAt}</span></p>
                <p style={{margin: 2}}>{message.text}</p>
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
