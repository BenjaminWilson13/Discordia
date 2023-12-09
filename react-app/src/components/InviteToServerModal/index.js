import React, { useState } from "react";
import { useModal } from "../../context/Modal";
import { useDispatch, useSelector } from "react-redux";

export default function InviteToServerModal({ serverId }) {
  let usersObj = useSelector((state) => state.users.allUsers);
  let serverUsers = useSelector(
    (state) => state.servers.ServerDetails[serverId].users
  );
  const userStatuses = useSelector((state) => state.onlineStatus.UserStatus);

  const [username, setUsername] = useState("");
  let [errors, setErrors] = useState("");
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    let user = users.find((user) => user.username === username);
    const res = await fetch(`/api/invites/send_invite/${serverId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({user_id: user.userId}),
    })
    const data = await res.json()

    if (res.ok) {
      alert(data.message)
      closeModal()
    } else {
      setErrors(data.errors)
    }
  };

  let users = Object.values(usersObj).filter(
    (user) => !serverUsers.hasOwnProperty(user.userId)
  );
  users = users.filter((user) => user.username.includes(username));

  users.sort((a, b) => {
    if (a.username < b.username) return -1;
    return 1;
  });

  return (
    // make it so that you have an input field and uner you display all users in a multiple select
    <>
      <div id="create-server-container">
        <h1 className="create-server-title">Invite Users</h1>
        {errors && <p className="errors">{errors}</p>}
        <form id="convo-form" className="form-box" onSubmit={handleSubmit}>
          <label className="create-server-label">
            <input
              type="text"
              className="input-area"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Filter by username"
            ></input>
          </label>

          <div className="users-list-container">
            {users.map((user) => {
              let status = userStatuses[user.userId];

              let online = false;
              if (status === "online") {
                online = true;
              }
              return (
                <div className="users-list">
                  <label className="create-convo-label">
                    <div className="user-list-details">
                      <div>
                        <img
                          alt="user icon"
                          className="dm-profile-img"
                          src={user.userIcon}
                          style={online ? { border: "2px solid green" } : {}}
                        ></img>
                        <p className="dm-username">
                          {user.username}
                          {online && (
                            <span className="online-status">Online</span>
                          )}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="create-convo-checkbox"
                        value={user.username}
                        key={user.userId}
                        onChange={(e) => {
                          if (username === e.target.value) {
                            setUsername("");
                          } else {
                            setUsername(e.target.value);
                          }
                        }}
                        checked={username === user.username}
                      />
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          <button id="convo-button" type="submit">
            Invite To Server
          </button>
        </form>
      </div>
    </>
  );
}