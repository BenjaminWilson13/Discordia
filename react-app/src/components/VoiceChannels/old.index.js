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
    const rtcPeers = useRef({});
    const currentUser = useSelector((state) => state.session.user);
    const [videoToggle, setVideoToggle] = useState(false);
    const iceServers = useSelector((state) => state.voiceChannels.iceServers);
    const dispatch = useDispatch();

    function handleNegotiation(data) {
        console.log(data.currentLocalDescription)
        if (data.currentLocalDescription) {
            console.log('ok I"m the offerer so I"ll start negotiation')
        }
    }




    async function newMemberAndOffer(data1) {
        const configuration = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        }

        let pc = new RTCPeerConnection({ configuration, iceServers })
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { width: 1920, height: 1080 }
        }).then(video => {
            video.getTracks().forEach(track => {
                pc.addTrack(track, video)
            })

        }).then(async (res) => {
            pc.ontrack = event => {
                console.log(event, 'event')
                const videoBox = document.getElementById('video-box');
                const video = document.createElement('video');
                video.srcObject = event.streams[0];
                videoBox.appendChild(video);
            }


            pc.onnegotiationneeded = (event) => {
                console.log('negotiation needed apparently', event, pc)
                handleNegotiation(pc)
            }

            pc.onsignalingstatechange = async (event) => {
                console.log(pc.connectionState, pc.signalingState)
                switch (pc.signalingState) {
                    case "stable":
                        break;

                }
            }

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            rtcPeers.current[data1.userId] = { "offer": offer, 'offerPC': pc, "offerer": { "userId": currentUser.userId, channelId, serverId }, 'answerer': data1 }

            pc.onicecandidate = event => {
                if (event.candidate !== null) {
                    socket.emit('iceCandidate', { 'candidate': event.candidate, 'to': currentUser.userId })
                }
            }
            socket.emit("offer", { "offer": offer, "offerer": { "userId": currentUser.userId, channelId, serverId }, 'answerer': data1 })
        })
    }

    // window.onbeforeunload = function (event) {
    //     event.preventDefault(); 
    //     return socket.emit("userLeavingChannel", {
    //         "userId": currentUser.userId,
    //         'serverId': parseInt(serverId),
    //         'channelId': parseInt(channelId)
    //     })
    // }

    function iceCandidate(data) {

        if (currentUser.userId !== data.to) {
            try {
                rtcPeers.current[data.to].answerPC.addIceCandidate(new RTCIceCandidate(data.candidate))
            } catch (e) {
                console.error(e, 'ice candidate error');
                rtcPeers.current[data.to].offerPC.addIceCandidate(new RTCIceCandidate(data.candidate))
            }
        }
    }

    function newJoinAndAnswer(data) {
        const configuration = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        }

        let pc = new RTCPeerConnection({ configuration, iceServers })
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        }).then(video => {
            video.getTracks().forEach(track => {
                pc.addTrack(track, video)
            })
        }).then(async (res) => {

            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            pc.ontrack = event => {
                console.log(event, 'event')
                const videoBox = document.getElementById('video-box');
                const video = document.createElement('video');
                video.srcObject = event.streams[0];
                videoBox.appendChild(video);
            }

            pc.onnegotiationneeded = (event) => {
                console.log('negotiation needed apparently')
            }

            pc.onsignalingstatechange = async (event) => {
                console.log(pc.signalingState)
            }
            const answer = await pc.createAnswer(data.answer);
            await pc.setLocalDescription(answer)
            rtcPeers.current[data.offerer.userId] = { ...data, answer, 'answerPC': pc, 'polite': true }
            pc.onicecandidate = event => {
                if (event.candidate !== null) {
                    socket.emit('iceCandidate', { 'candidate': event.candidate, 'to': currentUser.userId })
                }
            }
            socket.emit("answer", { ...data, answer })
        })
    }


    useEffect(() => {
        socket.on('iceCandidate', (data) => {

            iceCandidate(data);
        })
        socket.on('answer', async (data) => {
            console.log(rtcPeers.current, 'data', data)
            await rtcPeers.current[data.answerer.userId].offerPC.setRemoteDescription(new RTCSessionDescription(data.answer))
        })

        socket.on('newUserJoining', (data) => {
            if (data.error) return;
            newMemberAndOffer(data);
        })

        socket.on('offer', async (data) => {
            newJoinAndAnswer(data)
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
