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
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const rtcPeers = useRef({});
    const currentUser = useSelector((state) => state.session.user);
    const [videoToggle, setVideoToggle] = useState(false);
    const iceServers = useSelector((state) => state.voiceChannels.iceServers);
    const dispatch = useDispatch();
    const [callStarted, setCallStarted] = useState(false)

    async function newMemberAndOffer(data) {
        const iceServers = [
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

        console.log(data)
        console.log(iceServers)
        const video = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })

        const pc = new Peer({
            initiator: true, stream: video, config: {
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
        pc.on('signal', signal => {
            socket.emit('signal', { 'to': data.userId, signal, 'from': currentUser.userId })
        })

        pc.on('connect', () => {
            console.log('connected!', iceServers)
            const videoWindow = document.getElementById('localVideo')
            videoWindow.hidden = false; 
            setVideoToggle(true)
            if ('srcObject' in videoWindow) {
                localVideoRef.current.srcObject = video
            } else {
                localVideoRef.current.src = window.URL.createObjectURL(video)
            }
        })

        pc.on('data', data => {
            console.log(data)
        })

        pc.on('error', error => {
            console.log(error)
        })

        pc.on('stream', stream => {
            const videoWindow = document.createElement('video');
            videoWindow.setAttribute('playsinline', 'true')
            videoWindow.setAttribute('autoplay', 'true')
            videoWindow.setAttribute('id', `user${data.userId}VideoBox`)
            if ('srcObject' in videoWindow) {
                videoWindow.srcObject = stream
            } else {
                videoWindow.src = window.URL.createObjectURL(stream)
            }
            const videoBox = document.getElementById('video-box')
            videoBox.appendChild(videoWindow);
            videoWindow.play();
        })

        rtcPeers.current[data.userId] = pc;
        console.log(rtcPeers);
    }

    async function newOffer(data) {
        const video = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
        const pc = new Peer({
            initiator: false, stream: video, config: {
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
        });
        pc.signal(data.signal)
        console.log(data)

        pc.on('signal', (signal) => {
            socket.emit('signal', { signal, 'to': data.from, 'from': currentUser.userId })
        })

        pc.on('connect', () => {
            console.log('connected!')
            const videoWindow = document.getElementById('localVideo'); 
            videoWindow.hidden = false; 
            setVideoToggle(true)
            if ('srcObject' in videoWindow) {
                localVideoRef.current.srcObject = video
            } else {
                localVideoRef.current.src = window.URL.createObjectURL(video)
            }
            setVideoToggle(true)
        })

        pc.on('data', data => {
            console.log(data)
        })

        pc.on('error', error => {
            console.log(error)
        })

        pc.on('stream', stream => {
            const videoWindow = document.createElement('video');
            videoWindow.setAttribute('playsinline', 'true'); 
            videoWindow.setAttribute('autoplay', 'true'); 
            videoWindow.setAttribute('id', `user${data.userId}VideoBox`); 
            if ('srcObject' in videoWindow) {
                videoWindow.srcObject = stream
            } else {
                videoWindow.src = window.URL.createObjectURL(stream)
            }
            const videoBox = document.getElementById('video-box')
            videoBox.appendChild(videoWindow);
            videoWindow.play();
        })

        rtcPeers.current[data.from] = pc;
        console.log(rtcPeers.current);
    }

    useEffect(() => {
        if (callStarted) {
            socket.on('newUserJoining', (data) => {
                if (data.error) return;
                newMemberAndOffer(data);
            })
        } else {
            socket.off('newUserJoining')
        }
    }, [callStarted])

    useEffect(() => {
        if (iceServers.length) {
            dispatch(getApiIceServers());
        }

        socket.on('signal', (data) => {
            console.log(rtcPeers.current[data.from], data)
            if (!rtcPeers.current[data.from]) {
                newOffer(data);
                return;
            }
            rtcPeers.current[data.from].signal(data.signal)
        })

        socket.on('userLeavingChannel', (data) => {
            console.log(data); 
            destoryPeer(data.userId)
        })

        return () => {
            socket.emit("userLeavingChannel", {
                "userId": currentUser.userId,
                'serverId': parseInt(serverId),
                'channelId': parseInt(channelId)
            })
        }

    }, [])

    function destoryPeer(userId) {
        rtcPeers.current[userId].destroy(); 
        delete rtcPeers.current[userId]; 
        const videoElement = document.getElementById(`user${userId}VideoBox`);

        /* so this weirdErrorElement is because sometimes 'userundefinedVideoBox' comes up as a video 
        element ID so this is to delete that. It'll probably cause a problem if a lot of people are joining
        but I'm not sure. Will just have to see if/when we get a bunch of people to do a call*/
        const weirdErrorElement = document.getElementById('userundefinedVideoBox')
        if (videoElement) {
            videoElement.parentNode.removeChild(videoElement); 
        } else {
            weirdErrorElement.parentNode.removeChild(weirdErrorElement); 
        }
        if (Object.keys(rtcPeers.current).length < 1) {

        }
    }

    function removeAllVideoElements() {
        const videoElements = document.querySelectorAll('video'); 
        console.log(videoElements)
        for (let videoElement of videoElements) {
            if (videoElement.id !== 'localVideo') videoElement.parentNode.removeChild(videoElement)
        }
    }

    function closeAllPeerConns() {
        for (let pc of Object.values(rtcPeers.current)) {
            pc.destroy(); 
            console.log(pc)
        }
        rtcPeers.current = {}; 
    }

    function startCall(event) {
        event.preventDefault();
        console.log('starting call!')
        if (!callStarted) {
            socket.emit("userJoinedVoiceChannel", {
                "userId": currentUser.userId,
                'serverId': parseInt(serverId),
                'channelId': parseInt(channelId)
            })
            setCallStarted(!callStarted)
        } else {
            socket.emit("userLeavingChannel", {
                "userId": currentUser.userId,
                'serverId': parseInt(serverId),
                'channelId': parseInt(channelId)
            })
            removeAllVideoElements(); 
            setCallStarted(!callStarted);
            releaseDevices(); 
            if (videoToggle) hideVideo();  
            closeAllPeerConns(); 
        }
    }

    function releaseDevices() {
        const tracks = localVideoRef.current.srcObject.getTracks(); 
        tracks.forEach(track => track.stop());
    }

    function hideVideo(event) {
        if (event) {
            event.preventDefault();
        }
        if (videoToggle === true) {
            document.getElementById('localVideo').hidden = true; 
            setVideoToggle(false);
        } else {
            // navigator.mediaDevices.getUserMedia({
            //     audio: true,
            //     video: true
            // }).then((res) => {
            //     localVideoRef.current.srcObject = res;
            //     setVideoToggle(true);
            // })
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
                {/* <video id="remoteVideo" autoPlay playsInline ref={remoteVideoRef} /> */}
            </div>
            <button onClick={hideVideo} hidden={!callStarted}>{videoToggle ? "Hide My Video" : "Show My Video"}</button>
            <button onClick={startCall}>{callStarted ? 'End Call' : 'Start Voice and Video'}</button>
        </div>
    );
}