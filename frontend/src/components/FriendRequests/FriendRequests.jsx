import { useState, useEffect } from "react";

export function FriendRequests() {
  const [requests, setRequests] = useState([]);

  async function getRequests() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/friends/requests`,
        {
          credentials: "include",
        }
      );
      console.log(res);
      const result = await res.json();
      console.log(result);
      setRequests(result);
    } catch (err) {
      console.log(err);
    }
  }
  async function acceptRequest(id) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/friends/requests/accept/${id}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const result = await res.json();
      console.log(result);
      if (res.ok) {
        alert("Friend request accepted");
        getRequests();
      }
    } catch (err) {
      console.log(err);
      alert(`error: ${err}`);
    }
  }
  async function declineRequest(id) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/friends/requests/decline/${id}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      const result = await res.json();
      console.log(result);
      if (res.ok) {
        alert("Friend request declined");
        getRequests();
      }
    } catch (err) {
      console.log(err);
      alert(`error: ${err}`);
    }
  }
  useEffect(() => {
    getRequests();
  }, []);

  return (
    <>
      <div>
        <h1>Friend requests:</h1>
        {requests.map((request) => (
          <>
            <div key={request.id}>
              <p>{request.fromUser.username}</p>
              <p>At {request.createdAt}</p>
              <button onClick={() => acceptRequest(request.id)}>Accept</button>
              <button onClick={() => declineRequest(request.id)}>
                Decline
              </button>
            </div>
          </>
        ))}
      </div>
    </>
  );
}
