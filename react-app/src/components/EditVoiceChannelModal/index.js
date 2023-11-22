import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import { useHistory } from "react-router-dom";
import { deleteChannelByChannelId, putEditVoiceChannelByChannelId } from "../../store/voiceChannels";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";


export default function EditVoiceChannelModal(props) {
    const [errors, setErrors] = useState({});
    const { voiceChannel, defaultChannel } = props;
    const [name, setName] = useState(voiceChannel.name);
    const dispatch = useDispatch(); 
    const history = useHistory(); 
    const { closeModal } = useModal(); 
    const isVoiceChannel = window.location.pathname.split('/')[1] === "voiceChannel"; 
    

    console.log(voiceChannel);


    async function handleSubmit(event) {
        event.preventDefault();
        const data = await dispatch(putEditVoiceChannelByChannelId(voiceChannel.id, name)); 
        if (data) {
            setErrors(data); 
        } else {
            closeModal(); 
        }
    }

    async function deleteVoiceChannelFunction(event) {
        event.preventDefault();
        const data = await dispatch(deleteChannelByChannelId(voiceChannel.id)); 
        if (data) {
            setErrors(data); 
        } else {
            closeModal(); 
            if (isVoiceChannel && parseInt(window.location.pathname.split('/')[3]) === voiceChannel.id) {
                history.push(`/channels/${voiceChannel.serverId}/${defaultChannel}`)
            }
        }
    }

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
                        <input type="text" className="input-area" maxLength="25" minLength="5" value={name} onChange={(e) => setName(e.target.value)} required />
                    </label>
                    <div className="delete-server-buttons">
                        <button id="delete-edit-button" className="delete-button" type="submit" onClick={deleteVoiceChannelFunction}>Delete Channel</button>
                        <button id="submit-edit-channel" type="submit">Submit Changes</button>
                    </div>
                </form>
            </div>
        </>
    )

}