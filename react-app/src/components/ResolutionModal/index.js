import React, { useState } from "react";
import { useModal } from "../../context/Modal";
import "./ResolutionModal.css";

export default function ResolutionModal({ addScreenToStream, sendScreen }) {
  const { closeModal } = useModal();
  const [resolution, setResolution] = useState("1080p");
  const [frameRate, setFrameRate] = useState(30);

  function handleSubmit(event) {
    closeModal();
    addScreenToStream.current(event, resolution, frameRate);
  }
  return (
    <div
      id="resolution-form-container"
    >
      <h1 className="form-title">Stream Options</h1>
      <form className="resolution-form-box-outer" onSubmit={handleSubmit}>
        <div className="resolution-form-box-inner">
          <div className="resolution-box">
            <h3 className="demo-title">Resolution:</h3>
            <fieldset
              className="resolution-form-box"
              onChange={(event) => setResolution(event.target.value)}
            >
              <label className="resolution-signup-labels">
                <input
                  type="radio"
                  id="720p"
                  name="resolution"
                  value={"720p"}
                />
                720p
              </label>

              <label className="resolution-signup-labels">
                <input
                  type="radio"
                  defaultChecked
                  id="1080p"
                  name="resolution"
                  value={"1080p"}
                />
                1080p
              </label>

              <label className="resolution-signup-labels">
                <input
                  type="radio"
                  id="1440p"
                  name="resolution"
                  value={"1440p"}
                />
                1440p
              </label>

              <label className="resolution-signup-labels">
                <input type="radio" id="4k" name="resolution" value={"4k"} />
                4K
              </label>

              <label className="resolution-signup-labels">
                <input
                  type="radio"
                  id="absurd"
                  name="resolution"
                  value={"absurd"}
                />
                Absurd
              </label>
            </fieldset>
          </div>
          <div className="frame-rate-box">
            <h3 className="demo-title">Frame Rate: </h3>
            <fieldset
              className="resolution-form-box"
              onChange={(event) => setFrameRate(parseInt(event.target.value))}
            >
              <label className="resolution-signup-labels">
                <input type="radio" id="15" name="frameRate" value={15} />
                15
              </label>

              <label className="resolution-signup-labels">
                <input
                  type="radio"
                  defaultChecked
                  id="30"
                  name="frameRate"
                  value={30}
                />
                30
              </label>

              <label className="resolution-signup-labels">
                <input type="radio" id="60" name="frameRate" value={60} />
                60
              </label>
            </fieldset>
          </div>
        </div>
        <button id="resolution-form-button" type="submit">
          Start Stream
        </button>
      </form>
      <p
        style={resolution === "absurd" ? null : { display: "none" }}
        className="resolution-signup-labels warning-p-tag"
      >
        *WARNING: Absurd requires a monster computer and nearly 100mbps upload /
        download for you and everyone in the call.*
      </p>
    </div>
  );
}
