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



export default function VoiceChannels() {
    const { serverId, channelId } = useParams();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [rtcPeers, setRtcPeers] = useState([])
    const currentUser = useSelector((state) => state.session.user);
    const [videoToggle, setVideoToggle] = useState(false);
    const iceServers = useSelector((state) => state.voiceChannels.iceServers);
    const dispatch = useDispatch();
    let pc;




    async function newMemberAndOffer(data1) {
        pc = new RTCPeerConnection({ iceServers })
        const video = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { width: 1920, height: 1080 }
        })
        for (const track of video.getTracks()) {
            pc.addTrack(track, video)
        }
        const offer = await pc.createOffer();
        pc.setLocalDescription(offer);
        socket.emit("offer", { "offer": offer, "offerer": { "userId": currentUser.userId, channelId, serverId }, 'answerer': data1 })
    }

    window.onbeforeunload = function (event) {
        return socket.emit("userLeavingChannel", {
            "userId": currentUser.userId,
            'serverId': parseInt(serverId),
            'channelId': parseInt(channelId)
        })
    }


    socket.on('answer', (data) => {
        console.log(data, 'answer')
        pc.setRemoteDescription(data.answer)
    })

    useEffect(() => {
        socket.on('newUserJoining', (data) => {
            if (data.error) return;
            console.log(data, 'newUserJoining')
            newMemberAndOffer(data);
        })

        socket.on('offer', async (data) => {
            console.log(data)
            pc = new RTCPeerConnection({ iceServers });
            pc.setRemoteDescription(data.offer);
            const answer = await pc.createAnswer(data.answer);
            pc.setLocalDescription(answer)
            socket.emit("answer", {...data, answer})
        })

        if (!Object.keys(iceServers).length) {
            dispatch(getApiIceServers());
        }

        socket.emit("userJoinedVoiceChannel", {
            "userId": currentUser.userId,
            'serverId': parseInt(serverId),
            'channelId': parseInt(channelId)
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
            <video className="videoBox" autoPlay playsInline ref={localVideoRef} />
            <video autoPlay playsInline ref={remoteVideoRef} />
            <button onClick={clickEvent}>{videoToggle ? "Turn off Video" : "Start Video"}</button>
        </div>
    );
}
