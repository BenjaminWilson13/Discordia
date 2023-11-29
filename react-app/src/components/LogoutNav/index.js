import { useDispatch, useSelector } from 'react-redux';
import OpenModalButton from '../OpenModalButton'
import * as sessionActions from '../../store/session'
import { useHistory } from "react-router-dom"
import "./LogoutNav.css"
import EditUserIcon from "../EditUserIcon";
import { useState } from 'react';
import ResolutionModal from '../ResolutionModal';

export default function LogoutNav({ callStarted, setCallStarted, addScreenToStream, callButtonFunction, addWebcamToStream, hideVideoFunction, sendScreen, setSendScreen, sendWebcam, setSendWebcam, videoToggle, setVideoToggle, resolution, setResolution }) {
    const history = useHistory();
    const dispatch = useDispatch();
    const isVoiceChannel = window.location.pathname.split('/')[1] === "voiceChannel";
    const logout = (e) => {
        e.preventDefault()
        dispatch(sessionActions.logout())
        history.push("/")
    }
    const [component, refreshComponent] = useState(true);
    const sessionUser = useSelector(state => state.session.user);
    try {
        return (
            <>
                <div style={isVoiceChannel ? { height: '120px' } : { height: '60px' }} className="bottom-nav">
                    <div style={isVoiceChannel ? { display: 'flex' } : { display: 'none' }} className='voice-controls-box'>
                        <div className='tooltip-controls' data-tooltip={callStarted ? 'End Call' : 'Start Call'}>
                            <i alt='Start/End Call' onClick={callButtonFunction?.current} className={callStarted ? "fa-solid fa-phone-slash call-controls-off" : "fa-solid fa-phone-flip call-controls-on"}></i>
                        </div>
                        {
                            callStarted ?

                                sendScreen ?

                                    <div className='tooltip-controls' data-tooltip={'End Screen Share'}>
                                        <i onClick={addScreenToStream?.current} className={"fa-solid fa-display call-controls-off"}></i>
                                    </div>

                                    :
                                    <div className='tooltip-controls' data-tooltip={'Start Screen Share'}>
                                        <OpenModalButton
                                            modalComponent={<ResolutionModal resolution={resolution} setResolution={setResolution} addScreenToStream={addScreenToStream} sendScreen={sendScreen} />}
                                            buttonText={<i className="fa-solid fa-display call-controls-on"></i>}
                                            className={"update-conversation"}
                                        />
                                    </div>

                                :

                                null
                        }
                        <div className='tooltip-controls' data-tooltip={sendWebcam ? 'End Webcam' : 'Start Webcam'}>
                            <i hidden={!callStarted} style={callStarted ? null : { display: 'none' }} onClick={addWebcamToStream?.current} className={sendWebcam ? "fa-solid fa-video call-controls-off" : "fa-solid fa-video call-controls-on"}></i>
                        </div>
                        <div className='tooltip-controls' data-tooltip={'Display Yourself'}>
                            <i hidden={!(callStarted && sendWebcam)} style={!(callStarted && sendWebcam) ? { display: 'none' } : null} onClick={hideVideoFunction?.current} className="fa-solid fa-camera-rotate"></i>
                        </div>
                    </div>
                    <div className="left-nav-bar">
                        <img alt="Your user icon" className="nav-user-profile-img" src={sessionUser.userIcon} />
                        <p className="nav-username">{sessionUser.username}</p>
                        <OpenModalButton
                            modalComponent={<EditUserIcon />}
                            buttonText={<i className="fa-solid fa-gear"></i>}
                            className={"update-conversation"}
                        />
                        <button className="nav-button" onClick={logout}>Log Out</button>
                    </div>
                </div>
            </>
        )
    } catch (e) {
        console.log(e);
        return null;
    }
}
