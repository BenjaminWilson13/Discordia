import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getChannelMessagesThunk } from "../../store/channels";
import UpdateMessageModal from "../UpdateMessageModal";
import MessageDetails from "../MessageDetails";
import OpenModalButton from "../OpenModalButton";
import socketio from "socket.io-client";
import { socket } from "../../socket";
import "./VoiceChannels.css"
import { getApiIceServers } from "../../store/voiceChannels";
const Peer = require('simple-peer')



export default function VoiceChannels() {
    const { serverId, channelId } = useParams();
    const localVideoRef = useRef({});
    const localDisplayRef = useRef({});
    const rtcPeers = useRef({});
    const stopVideoRef = useRef(null);
    const currentUser = useSelector((state) => state.session.user);
    const [videoToggle, setVideoToggle] = useState(false);
    const [callStarted, setCallStarted] = useState(false);
    const newStream = useRef(null);
    const [sendScreen, setSendScreen] = useState(false)

    function createPeerConnection(initiator) {
        const pc = new Peer({
            initiator, stream: newStream.current, config: {
                iceServers: [
                    {
                        urls: "stun:stun.relay.metered.ca:80",
                    },
                    {
                        urls: "turn:a.relay.metered.ca:80",
                        username: "f8da8920e5a37b37131a989b",
                        credential: "4IBYYZ5g8t+M2bkP",
                    },
                    {
                        urls: "turn:a.relay.metered.ca:80?transport=tcp",
                        username: "f8da8920e5a37b37131a989b",
                        credential: "4IBYYZ5g8t+M2bkP",
                    },
                    {
                        urls: "turn:a.relay.metered.ca:443",
                        username: "f8da8920e5a37b37131a989b",
                        credential: "4IBYYZ5g8t+M2bkP",
                    },
                    {
                        urls: "turn:a.relay.metered.ca:443?transport=tcp",
                        username: "f8da8920e5a37b37131a989b",
                        credential: "4IBYYZ5g8t+M2bkP",
                    },
                ]
            }
        })
        return pc;
    }

    async function newOffer(data, pc) {
        console.log('newOffer', data)
        pc.remotePeerId = data.from;
        if (data.signal) pc.signal(data.signal)

        pc.on('signal', (signal) => {
            socket.emit('signal', { signal, 'to': data.from, 'from': currentUser.userId })
        })

        pc.on('connect', () => {
            console.log('connected!')
        })

        pc.on('data', data => {
            console.log(data)
        })

        pc.on('close', () => {
            console.log('peer conn closing', pc);
            try {
                destoryPeer(pc.remotePeerId);
            } catch (e) {
            }
        })

        pc.on('error', error => {
            console.error(error)
        })

        pc.on('stream', streams => {
            streams.getTracks().forEach(stream => {
                console.log('new Stream!', stream)
                const videoWindow = document.createElement('video');
                videoWindow.setAttribute('playsinline', 'true');
                videoWindow.setAttribute('autoplay', 'true');
                videoWindow.setAttribute('class', `user${pc.remotePeerId}VideoBox`);
                videoWindow.srcObject = new MediaStream([stream])
                const videoBox = document.getElementById('video-box')
                videoBox.appendChild(videoWindow);
            })
        })

        rtcPeers.current[pc.remotePeerId] = pc;
        console.log(rtcPeers.current);
    }


    useEffect(() => {
        if (callStarted) {
            socket.on('newUserJoining', (data) => {
                console.log('newUserJoining', data)
                if (data.error) return;
                newOffer(data, createPeerConnection(true));
            })
        } else {
            socket.off('newUserJoining')
        }
    }, [callStarted])

    useEffect(() => {

        socket.on('signal', (data) => {
            console.log(rtcPeers.current[data.from], data)
            if (!rtcPeers.current[data.from]) {
                console.log('newUserFromSignal', data)
                newOffer(data, createPeerConnection(false));
                return;
            }
            rtcPeers.current[data.from].signal(data.signal)
        })

        socket.on('userLeavingChannel', (data) => {
            console.log(data);
        })

        return () => {
            socket.emit("userLeavingChannel", {
                "userId": currentUser.userId,
                'serverId': parseInt(serverId),
                'channelId': parseInt(channelId)
            })
            socket.off('signal');
            socket.off('userLeavingChannel');
            socket.off('newUserJoining');
            console.log(stopVideoRef.current, 'cleanup', rtcPeers.current)
            releaseDevices();
            closeAllPeerConns();
        }
    }, [])

    function destoryPeer(userId) {
        console.log(rtcPeers, 'destroying')
        rtcPeers.current[userId].destroy();
        delete rtcPeers.current[userId];
        const videoElements = document.querySelectorAll(`.user${userId}VideoBox`);
        for (let videoElement of videoElements) {
            videoElement.parentNode.removeChild(videoElement);
        }
    }

    function closeAllPeerConns() {
        console.log(rtcPeers.current, 'function')
        for (let pc of Object.values(rtcPeers.current)) {
            pc.destroy();
        }
    }

    function callButtonFunction(event) {
        event.preventDefault();
        console.log('starting call!')
        if (callStarted) {
            socket.emit("userLeavingChannel", {
                "userId": currentUser.userId,
                'serverId': parseInt(serverId),
                'channelId': parseInt(channelId)
            })
            setCallStarted(!callStarted);
            releaseDevices();
            if (videoToggle) hideVideoFunction();
            closeAllPeerConns();
        } else {
            try {
                navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                }).then((res) => {
                    localVideoRef.current.srcObject = res;
                    stopVideoRef.current = res;
                    console.log(localVideoRef.current.srcObject)
                    const videoWindow = document.getElementById('localVideo');
                    videoWindow.hidden = false;
                    setVideoToggle(true);
                    setCallStarted(!callStarted);
                    newStream.current = new MediaStream();
                    stopVideoRef.current.getTracks().forEach(track => newStream.current.addTrack(track));

                    if (sendScreen) {
                        navigator.mediaDevices.getDisplayMedia({
                            video: true,
                            audio: false
                        }).then((res) => {
                            localDisplayRef.current = res;
                            localDisplayRef.current.getTracks().forEach(track => newStream.current.addTrack(track))
                            socket.emit("userJoinedVoiceChannel", {
                                "userId": currentUser.userId,
                                'serverId': parseInt(serverId),
                                'channelId': parseInt(channelId)
                            })
                        }).catch((err) => {
                            console.error(err);
                            return null;
                        })
                    } else {
                        socket.emit("userJoinedVoiceChannel", {
                            "userId": currentUser.userId,
                            'serverId': parseInt(serverId),
                            'channelId': parseInt(channelId)
                        })
                    }
                })
            } catch (e) {
                console.log("Can't start a video call without a camera! Or there was a problem with your camera!")
                console.error(e);
            }
        }
    }

    function releaseDevices() {
        console.log(stopVideoRef.current, 'function')
        try {
            const tracks = stopVideoRef.current.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) {}
        try {
            const tracks = localDisplayRef.current.getTracks(); 
            tracks.forEach(track => track.stop());
        } catch (e) {}

    }

    function hideVideoFunction(event) {
        if (event) {
            event.preventDefault();
        }
        if (videoToggle === true) {
            document.getElementById('localVideo').hidden = true;
            setVideoToggle(false);
        } else {
            document.getElementById('localVideo').hidden = false;
            setVideoToggle(true)
        }
    }

    return (
        <div className="voice-container">
            {/* the username and room ID are temporary, just because there's problems with the voice channel seeding
            and there's currently no way to add a voice channel to a server, they is what they is*/}
            <label>{"Username: " + currentUser.userId}</label>
            <label>{"Room Id: " + channelId}</label>
            <div id="video-box">
                <video id="localVideo" hidden={true} className="videoBox" autoPlay playsInline ref={localVideoRef} />
            </div>
            <button onClick={hideVideoFunction} hidden={!callStarted}>{videoToggle ? "Hide My Video" : "Show My Video"}</button>
            <button onClick={callButtonFunction}>{callStarted ? 'End Call' : 'Start Voice and Video'}</button>
            <form>
                <label>Send Screen?</label>
                <input type="checkbox" value={sendScreen} onChange={() => setSendScreen(!sendScreen)} />
            </form>
        </div>
    );
}