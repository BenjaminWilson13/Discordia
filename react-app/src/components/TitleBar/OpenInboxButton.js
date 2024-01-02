import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InboxDropDown from "./InboxDropDown";

function OpenInboxButton() {
  const [showInbox, setShowInbox] = useState(false)
  const [coords, setCoords] = useState({});

  const showHandler = (e) => {
    e.preventDefault();

    setShowInbox(true);

    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
        top: rect.y + 25 + window.scrollY
    });
}
  
  useEffect(() => {
    // Start listening to the server for server sent events.
    const eventSource = new EventSource("/api/invites/listen", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      console.log("Received message:", event.data);
      // Handle the message as needed
    };

    eventSource.addEventListener("Server Invite", (e) => {
      console.log("Server Invitation: ", e.data);
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <>
    <div className="inbox" onClick={showHandler}>
      <i className="fa-solid fa-inbox fa-2xs"></i>
    </div>
    {showInbox && <InboxDropDown top={coords.top} onClose={() => setShowInbox(prev => !prev)} />}
    </>
  );
}

export default OpenInboxButton;
