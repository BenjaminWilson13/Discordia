import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { useHistory } from "react-router-dom";
import "./EditChannelModal.css";
import {
  channelEdit,
  deleteChannel,
  serverDetailsGet,
} from "../../store/servers";

export default function EditChannelModal(props) {
  const {
    channels,
    channelName,
    groupNames,
    groupIds,
    defaultChannel,
  } = props;
  const dispatch = useDispatch();
  const [errors, setErrors] = useState([]);
  let channelInfo = {};
  for (let name of groupNames) {
    if (channels[name][channelName] !== undefined) {
      channelInfo = channels[name][channelName];
    }
  }

  const [name, setName] = useState(channelInfo.name);
  const [groupName, setGroupName] = useState(channelInfo.group_name);

  const { closeModal } = useModal();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const channelId = channelInfo.id;
    const groupId = groupIds[groupName];
    const body = {
      groupId: groupId,
      serverId: channelInfo.server_id,
      name: name,
      isPrivate: false,
    };
    const data = await dispatch(channelEdit(channelId, body));
    if (data) {
      setErrors(data);
    } else {
      dispatch(serverDetailsGet(channelInfo.server_id));
      closeModal();
      history.push(`/channels/${channelInfo.server_id}/${channelInfo.id}`);
    }
  };

  const deleteChannelFunction = async (e) => {
    e.preventDefault();
    const channelId = channelInfo.id;
    const data = await dispatch(deleteChannel(channelId));
    if (data) {
      setErrors(data);
    } else {
      dispatch(serverDetailsGet(channelInfo.server_id));
      closeModal();
      history.push(`/channels/${channelInfo.server_id}/${defaultChannel}`);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <div id="create-server-container">
        <h1 className="create-server-title">Edit Channel</h1>
        <form className="form-box" onSubmit={handleSubmit}>
          <ul className="errors">
            {Object.values(errors).map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
          <label className="create-server-label">
            Channel Name
            <input
              type="text"
              className="input-area"
              maxLength="25"
              minLength="5"
              onKeyPress={handleEnter}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="create-server-label">
            Channel group
            <select
              name="groupName"
              className="input-area"
              defaultValue={groupNames[0]}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            >
              {groupNames.map((name) => {
                return <option value={name}>{name}</option>;
              })}
            </select>
          </label>
          <div className="delete-server-buttons">
            <button
              id="delete-edit-button"
              className="delete-button"
              type="submit"
              onClick={deleteChannelFunction}
            >
              Delete Channel
            </button>
            <button id="submit-edit-channel" type="submit">
              Submit Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// style={{ backgroundColor: "red", marginTop: "15px" }}
