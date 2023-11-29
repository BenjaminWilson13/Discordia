import React, { useState } from "react";
import { login } from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { useHistory } from "react-router-dom";

export default function ResolutionModal({ addScreenToStream, sendScreen }) {
    const { closeModal } = useModal();
    const [resolution, setResolution] = useState("1080p")
    const [frameRate, setFrameRate] = useState(30)

    function handleSubmit(event) {
        closeModal();
        addScreenToStream.current(event, resolution, frameRate);
    }
    return (
        <div id="form-container">
            <h1 className="form-title">Stream Options</h1>
            <form className="form-box" onSubmit={handleSubmit}>
                <h3 className="demo-title">Resolution:</h3>
                <fieldset className="form-box" onChange={(event) => setResolution(event.target.value)}>
                    <label className="signup-labels">
                        <input type="radio" id="720p" name="resolution" value={"720p"} />
                        720p
                    </label>

                    <label className="signup-labels">
                        <input type="radio" defaultChecked id="1080p" name="resolution" value={"1080p"} />
                        1080p
                    </label>

                    <label className="signup-labels">
                        <input type="radio" id="1440p" name="resolution" value={"1440p"} />
                        1440p
                    </label>

                    <label className="signup-labels">
                        <input type="radio" id="4k" name="resolution" value={"4k"} />
                        4K
                    </label>

                    <label className="signup-labels">
                        <input type="radio" id="absurd" name="resolution" value={"absurd"} />
                        Absurd 
                        <br/>
                        *WARNING: This requires a monster computer and nearly 100mbps upload/download for you and everyone in the call.*
                    </label>
                </fieldset>
                <h3 className="demo-title">Frame Rate: </h3>
                <fieldset className="form-box" onChange={(event) => setFrameRate(parseInt(event.target.value))}>
                    <label className="signup-labels">
                        <input type="radio" id="15" name="frameRate" value={15} />
                        15
                    </label>

                    <label className="signup-labels">
                        <input type="radio" defaultChecked id="30" name="frameRate" value={30} />
                        30
                    </label>

                    <label className="signup-labels">
                        <input type="radio" id="60" name="frameRate" value={60} />
                        60
                    </label>
                </fieldset>
                <button id="form-button" type="submit">Start Stream</button>
            </form>
        </div>
    )
}