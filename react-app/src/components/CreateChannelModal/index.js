import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { useHistory } from "react-router-dom";
import "./CreateChannelModal.css";
import { serverDetailsGet, createChannel } from "../../store/servers";
import { postNewVoiceChannelByServerId } from "../../store/voiceChannels";

export default function CreateChannelModal(props) {
    const { groupId, serverId, voiceChannel } = props
    const [errors, setErrors] = useState([]);
    const [name, setName] = useState("");
    const history = useHistory();
    const dispatch = useDispatch();
    const { closeModal } = useModal();


    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            serverId,
            groupId,
            name,
            isPrivate: false
        }
        if (!voiceChannel) {
            const data = await dispatch(createChannel(body));

            if (typeof data.name !== "string") {
                setErrors(data)
            } else {
                dispatch(serverDetailsGet(serverId));
                closeModal();
                history.push(`/channels/${serverId}/${data.id}`)
            }
        } else {
            const data = await dispatch(postNewVoiceChannelByServerId(body.serverId, body.name)); 
            if (typeof Object.values(data)[0].name !== 'string') {
                setErrors(data); 
            } else {
                dispatch(serverDetailsGet(serverId));
                closeModal(); 
                history.push(`/voiceChannel/${serverId}/${Object.keys(data)[0]}`)
            }
        }
    }

    return (
        <>
            <div id="create-server-container">
                <h1 className="create-server-title">Create a New Channel!</h1>
                <form className="form-box" onSubmit={handleSubmit}>
                    <ul className="errors">
                        {Object.values(errors).map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                    <label className="create-server-label">
                        Channel Name
                        <input type="text" className="input-area" maxLength="25" minLength="5" value={name} onChange={(e) => setName(e.target.value)} required />
                    </label>
                    <button id="create-server-button" type="submit">Create Channel</button>
                </form>
            </div>
        </>
    )
}
