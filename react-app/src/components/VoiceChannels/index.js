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

/* 
    TODO: 
        1. Add individual controls for starting webcam and sharing screen. Will have to figure out if I need to renogitate 
        the peer connection to add them later.  - DONE!

        2. Start webcam button should be down at the bottom next to start call. - DONE!
        
        3. Start screen share sould be down under the channel list, above the logout button in it's own box similar to how
        discord currently functions. 

*/



export default function VoiceChannels({callStarted, setCallStarted, addScreenToStream, callButtonFunction, addWebcamToStream, hideVideoFunction, sendScreen, setSendScreen, sendWebcam, setSendWebcam, videoToggle, setVideoToggle}) {

    const { serverId, channelId } = useParams();
    const localWebCamRef = useRef(null);
    const localDisplayRef = useRef(null);
    const rtcPeers = useRef({});
    const stopVideoRef = useRef(null);
    const currentUser = useSelector((state) => state.session.user);
    
    const localAudioRef = useRef(null);
    
    function createPeerConnection(initiator) {

        const pc = new Peer({
            initiator, stream: localAudioRef.current, config: {
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
            console.log("connected!, if there's more streams to send, we'll send 'em now~!", sendWebcam, stopVideoRef.current)
            if (stopVideoRef.current) {
                pc.addStream(stopVideoRef.current)
            }
            if (localDisplayRef.current) {
                pc.addStream(localDisplayRef.current)
            }
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
            const videoWindow = document.createElement('video');
            streams.onremovetrack = () => {
                console.log('trackRemoved!')
                videoWindow.parentNode.removeChild(videoWindow)
            }
            streams.getAudioTracks().forEach(stream => {
                console.log('new audio Stream!', stream)
                videoWindow.setAttribute('playsinline', 'true');
                videoWindow.setAttribute('autoplay', 'true');
                videoWindow.setAttribute('class', `user${pc.remotePeerId}VideoBox`);
                videoWindow.setAttribute('hidden', 'true');
                videoWindow.setAttribute('type', 'audio');
                videoWindow.srcObject = new MediaStream([stream])
                const videoBox = document.getElementById('video-box')
                videoBox.appendChild(videoWindow);
            })
            streams.getVideoTracks().forEach(stream => {
                console.log('new video Stream!', stream.id)
                videoWindow.setAttribute('playsinline', 'true');
                videoWindow.setAttribute('autoplay', 'true');
                videoWindow.setAttribute('class', `user${pc.remotePeerId}VideoBox`);
                videoWindow.setAttribute('type', 'video');
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

        callButtonFunction.current();

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
            releaseDevices();
            closeAllPeerConns();
            setCallStarted(false); 
            setVideoToggle(false); 
            setSendScreen(false); 
            setSendWebcam(false); 
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

    callButtonFunction.current = (event) => {
        if (event) event.preventDefault();
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
            setSendWebcam(false);
            setSendScreen(false);
        } else {
            try {
                navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: true
                }).then((res) => {
                    console.log(localWebCamRef.current.srcObject)
                    setCallStarted(!callStarted);
                    localAudioRef.current = res;
                    socket.emit("userJoinedVoiceChannel", {
                        "userId": currentUser.userId,
                        'serverId': parseInt(serverId),
                        'channelId': parseInt(channelId)
                    })

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
            localAudioRef.current.getTracks().forEach((track) => track.stop());
            stopVideoRef.current.getTracks().forEach((track) => { track.stop(); })
            localDisplayRef.current.getTracks().forEach((track) => { track.stop(); })
        } catch (e) { }
        try {
            const tracks = localDisplayRef.current.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) { }

    }

    hideVideoFunction.current = (event) => {
        console.log(document.getElementById('localVideo').hidden)
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

    addWebcamToStream.current = (event) => {
        event.preventDefault();
        if (!sendWebcam) {
            try {
                navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                }).then((res) => {
                    res.getTracks().forEach((track) => track.contentHint = 'webcam')
                    res.contentHint = 'webcam'
                    localWebCamRef.current.srcObject = res;
                    stopVideoRef.current = res;
                    const videoWindow = document.getElementById('localVideo');
                    videoWindow.hidden = false;
                    for (let peerConn of Object.values(rtcPeers.current)) {
                        peerConn.addStream(res)
                    }
                    setVideoToggle(true);
                    setSendWebcam(true);
                })
            } catch (e) {
                console.log("Can't start a video call without a camera! Or there was a problem with your camera!")
                console.error(e);
            }
        } else {
            console.log(stopVideoRef.current.getTracks()[0])
            for (let peerConn of Object.values(rtcPeers.current)) {
                peerConn.removeStream(stopVideoRef.current)
                peerConn.send(`user${currentUser.userId}webcam`)
            }
            stopVideoRef.current.getTracks().forEach((track) => { track.stop(); })
            setSendWebcam(false);
            hideVideoFunction();
        }
    }

    addScreenToStream.current = (event) => {
        event.preventDefault();
        if (!sendScreen) {
            navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            }).then((res) => {
                localDisplayRef.current = res;
                for (let peerConn of Object.values(rtcPeers.current)) {
                    peerConn.addStream(res)
                }
                setSendScreen(true);
            }).catch((err) => {
                console.error(err);
                return null;
            })
        } else {
            for (let peerConn of Object.values(rtcPeers.current)) {
                peerConn.removeStream(localDisplayRef.current)
                localDisplayRef.current.getTracks().forEach((track) => peerConn.send(track.id))
            }
            localDisplayRef.current.getTracks().forEach((track) => { track.stop(); })
            setSendScreen(false)
        }
    }

    return (
        <div className="voice-container">
            {/* the username and room ID are temporary, just because there's problems with the voice channel seeding
            and there's currently no way to add a voice channel to a server, they is what they is*/}
            <label>{"Username: " + currentUser.userId}</label>
            <label>{"Room Id: " + channelId}</label>
            <div id="video-box">
                <video id="localVideo" muted={true} hidden={true} className="videoBox" autoPlay playsInline ref={localWebCamRef} />
            </div>
            {/* <button onClick={callButtonFunction.current}>{callStarted ? 'End Voice Chat' : 'Start Voice Chat'}</button>
            <br />
            <button hidden={!callStarted} onClick={addScreenToStream}>{sendScreen ? 'End Screen Share' : 'Start Screen Share'}</button>
            <br />
            <button hidden={!callStarted} onClick={addWebcamToStream}>{sendWebcam ? 'Stop Webcam' : 'Start Webcam'}</button>
            <br />
            <button hidden={!(callStarted && sendWebcam)} onClick={hideVideoFunction}>{videoToggle ? "Hide Self" : "Show Self"}</button> */}
        </div>
    );
}