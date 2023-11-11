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

    async function newMemberAndOffer(data) {
        console.log(data)
        console.log(iceServers)
        const video = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })

        const pc = new Peer({ initiator: true, stream: video })
        pc.on('signal', signal => {
            socket.emit('signal', { 'to': data.userId, signal, 'from': currentUser.userId })
        })

        pc.on('connect', () => {
            console.log('connected!')
            const videoWindow = document.getElementById('localVideo')
            if('srcObject' in videoWindow) {
                videoWindow.srcObject = video
            } else {
                videoWindow.src = window.URL.createObjectURL(video)
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
            if('srcObject' in videoWindow) {
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
        const pc = new Peer({ initiator: false, stream: video });
        pc.signal(data.signal)
        console.log(data)

        pc.on('signal', (signal) => {
            socket.emit('signal', { signal, 'to': data.from, 'from': currentUser.userId })
        })

        pc.on('connect', () => {
            console.log('connected!')
            pc.write('testtesttest')
            const videoWindow = document.getElementById('localVideo')
            if('srcObject' in videoWindow) {
                videoWindow.srcObject = video
            } else {
                videoWindow.src = window.URL.createObjectURL(video)
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
            if('srcObject' in videoWindow) {
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
        if (!Object.keys(iceServers).length) {
            dispatch(getApiIceServers());
        }

        socket.on('newUserJoining', (data) => {
            if (data.error) return;
            newMemberAndOffer(data);
        })

        socket.emit("userJoinedVoiceChannel", {
            "userId": currentUser.userId,
            'serverId': parseInt(serverId),
            'channelId': parseInt(channelId)
        })

        socket.on('signal', (data) => {
            console.log(rtcPeers.current[data.from], data)
            if (!rtcPeers.current[data.from]) {
                newOffer(data);
                return;
            }
            rtcPeers.current[data.from].signal(data.signal)
        })



        return () => {
            socket.emit("userLeavingChannel", {
                "userId": currentUser.userId,
                'serverId': parseInt(serverId),
                'channelId': parseInt(channelId)
            })
        }

    }, [])







    function clickEvent(event) {
        event.preventDefault();
        if (videoToggle === true) {
            localVideoRef.current.srcObject = null;
            setVideoToggle(false);
        } else {
            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            }).then((res) => {
                localVideoRef.current.srcObject = res;
                setVideoToggle(true);
            })
        }
    }


    return (
        <div id="video-box" className="socket-container">
            <label>{"Username: " + currentUser.userId}</label>
            <label>{"Room Id: " + channelId}</label>
            <video id="localVideo" className="videoBox" autoPlay playsInline ref={localVideoRef} />
            <video id="remoteVideo" autoPlay playsInline ref={remoteVideoRef} />
            <button onClick={clickEvent}>{videoToggle ? "Turn off Video" : "Start Video"}</button>
        </div>
    );
}