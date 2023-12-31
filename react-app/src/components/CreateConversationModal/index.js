import React, { useState } from "react";
import { useModal } from "../../context/Modal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch, useSelector } from "react-redux";
import { createNewConversationThunk } from "../../store/userconversations";

import "./CreateConvo.css";

export default function CreateConversationModal({ users }) {
  const history = useHistory();
  let currentUser = useSelector((state) => state.session.user);
  const userStatuses = useSelector((state) => state.onlineStatus.UserStatus);
  const [username, setUsername] = useState("");
  let [errors, setErrors] = useState("");
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const handleSubmit = async (e) => {
    let user = users.find((user) => user.username === username);
    e.preventDefault();
    dispatch(createNewConversationThunk(username)).then((data) => {
      if (data.errors) {
        setErrors(data.errors);
        return;
      }
      const { conversation_id } = data[user.userId];

      closeModal();
      return history.push(`/conversations/${conversation_id}`);
    });
  };
  let userConversations = Object.values(
    useSelector((state) => state.userConversations),
  );

  users = users.filter((user) => user.userId !== currentUser.userId);
  users = users.filter((user) => user.username.includes(username));
  users = users.filter(
    (user) =>
      !userConversations.find(
        (conversation) => conversation.userId === user.userId,
      ),
  );
  users.sort((a, b) => {
    if (a.username < b.username) return -1;
    return 1;
  });

  // dispatch to create a new conversation

  return (
    // make it so that you have an input field and uner you display all users in a multiple select
    <>
      <div id="create-server-container">
        <h1 className="create-server-title">Create a Conversation</h1>
        {errors.length > 0 && <p className="errors">{errors}</p>}
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
              // return (<input type="checkbox"
              //     value={username} key={user.userId}>{user.username}
              //     onClick = {(e) => setUsername(e.target.value)}
              // </input>)
            })}
          </div>

          <button id="convo-button" type="submit">
            Create DM
          </button>
        </form>
      </div>
    </>
  );
}
