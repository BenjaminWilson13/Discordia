import React, { useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { socket } from "../../socket";
import "./VoiceChannels.css";
import { setMediaBitrate } from "./setMediaBitrate";
import { iceServers } from "./iceServers";
const Peer = require("simple-peer");
const Hark = require("hark");

export default function VoiceChannels({
  setMicMuted,
  localAudioRef,
  setVoiceState,
  callStarted,
  setCallStarted,
  addScreenToStream,
  callButtonFunction,
  addWebcamToStream,
  hideVideoFunction,
  sendScreen,
  setSendScreen,
  sendWebcam,
  setSendWebcam,
  videoToggle,
  setVideoToggle,
  setVoiceUsers,
}) {
  const { serverId, channelId } = useParams();
  const localWebCamRef = useRef(null);
  const localDisplayRef = useRef(null);
  const rtcPeers = useRef({});
  const stopVideoRef = useRef(null);
  const myDisplay = useRef(null);
  const userId = useSelector((state) => state.session.user.userId);
  const callStartedRef = useRef(callStarted);
  const voiceActivity = useRef(null);
  const voiceStateRef = useRef({});

  const createPeerConnection = useCallback(
    (initiator) => {
      const pc = new Peer({
        initiator,
        stream: localAudioRef.current,
        config: {
          iceServers: iceServers,
        },
        sdpTransform: (sdp) => {
          const sdp2 = setMediaBitrate(
            setMediaBitrate(sdp, "video", 68000000),
            "audio",
            520000,
          );
          return sdp2.replace(
            "useinbandfec=1",
            "useinbandfec=1; stereo=1; maxaveragebitrate=520000",
          );
        },
        reconnectTimer: 5000,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
        answerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        },
        objectMode: true,
      });
      console.log(pc);
      return pc;
    },
    [localAudioRef],
  );

  const newOffer = useCallback(
    (data, pc) => {
      pc.remotePeerId = data.from;

      if (data.signal) {
        pc.signal(data.signal);
      }

      pc.on("signal", (signal) => {
        socket.emit("signal", {
          signal,
          to: data.from,
          from: userId,
        });
      });

      pc.on("connect", () => {
        if (stopVideoRef.current) {
          pc.addStream(stopVideoRef.current);
        }
        if (localDisplayRef.current) {
          pc.addStream(localDisplayRef.current);
        }
      });

      pc.on("data", (data) => {
        const newState = { ...voiceStateRef.current };
        newState[pc.remotePeerId] = data;
        setVoiceState(newState);
        voiceStateRef.current = newState;
      });

      pc.on("close", () => {
        try {
          destoryPeer(pc.remotePeerId);
          voiceActivity.current.stop();
        } catch (e) {}
      });

      pc.on("error", (error) => {
        // console.error(error);
      });

      voiceActivity.current = Hark(localAudioRef.current);
      voiceActivity.current.setThreshold(-75);
      voiceActivity.current.on("speaking", () => {
        pc?.write("true");
      });

      voiceActivity.current.on("stopped_speaking", () => {
        pc?.write("false");
      });

      pc.on("stream", (streams) => {
        const videoWindow = document.createElement("video");
        const audioElement = document.createElement("audio");
        streams.onremovetrack = () => {
          console.log("remove track!");
          videoWindow.parentNode?.removeChild(videoWindow);
          audioElement.parentNode?.removeChild(audioElement);
        };
        if (streams.getVideoTracks().length === 0) {
          audioElement.setAttribute("playsinline", "true");
          audioElement.setAttribute("autoplay", "true");
          audioElement.setAttribute("class", `user${pc.remotePeerId}VideoBox`);
          audioElement.setAttribute("hidden", "true");
          audioElement.setAttribute("type", "audio");
          audioElement.srcObject = streams;
          const videoBox = document.getElementById("video-box");
          videoBox.appendChild(audioElement);
        } else {
          videoWindow.setAttribute("playsinline", "true");
          videoWindow.setAttribute("autoplay", "true");
          videoWindow.setAttribute("class", `user${pc.remotePeerId}VideoBox`);
          videoWindow.setAttribute("type", "video");
          videoWindow.setAttribute("controls", "true");
          //an array of event types for wider compatibility
          const events = [
            "fullscreenchange",
            "webkitfullscreenchange",
            "mozfullscreenchange",
            "msfullscreenchange",
          ];
          events.forEach((eventType) =>
            document.addEventListener(
              eventType,
              function (event) {
                if (document.fullscreenElement) {
                  event.target.style.border = "none";
                } else {
                  event.target.style.border = "blue 3px solid";
                }
              },
              true,
            ),
          );

          videoWindow.srcObject = streams;
          const videoBox = document.getElementById("video-box");
          videoBox.appendChild(videoWindow);
        }
      });

      rtcPeers.current[pc.remotePeerId] = pc;
    },
    [localAudioRef, userId, setVoiceState],
  );

  function destoryPeer(userId) {
    rtcPeers.current[userId].destroy();
    delete rtcPeers.current[userId];
    const videoElements = document.querySelectorAll(`.user${userId}VideoBox`);
    for (let videoElement of videoElements) {
      videoElement.parentNode.removeChild(videoElement);
    }
  }

  function closeAllPeerConns() {
    Object.values(rtcPeers.current).forEach((peer) => peer.destroy());
  }

  const releaseDevices = useCallback(() => {
    localAudioRef.current?.getTracks().forEach((track) => track.stop());
    stopVideoRef.current?.getTracks().forEach((track) => track.stop());
    localDisplayRef.current?.getTracks().forEach((track) => track.stop());
  }, [localAudioRef]);

  callButtonFunction.current = useCallback(
    (event) => {
      if (event) event.preventDefault();
      if (callStartedRef.current) {
        socket.emit("userLeavingChannel", {
          userId,
          serverId: parseInt(serverId),
          channelId: parseInt(channelId),
        });
        setCallStarted(false);
        callStartedRef.current = false;
        releaseDevices();
        if (videoToggle) hideVideoFunction.current();
        closeAllPeerConns();
        setSendWebcam(false);
        setSendScreen(false);
        setVoiceState({});
        voiceStateRef.current = {};
      } else {
        try {
          navigator.mediaDevices
            .getUserMedia({
              video: false,
              audio: {
                autoGainControl: false,
                channelCount: 2,
                echoCancellation: false,
                latency: 0,
                noiseSuppression: false,
                sampleRate: 48000,
                sampleSize: 16,
                volume: 1.0,
              },
            })
            .then((res) => {
              res.getAudioTracks().forEach((track) => {
                track.contentHint = "speech";
              });
              setCallStarted(true);
              callStartedRef.current = true;
              localAudioRef.current = res;
              const voiceActivity = Hark(res);
              voiceActivity.setThreshold(-75);
              voiceActivity.on("speaking", () => {
                const newState = { ...voiceStateRef.current };
                newState[userId] = "true";
                setVoiceState(newState);
                voiceStateRef.current = newState;
              });
              voiceActivity.on("stopped_speaking", () => {
                const newState = { ...voiceStateRef.current };
                newState[userId] = "false";
                setVoiceState(newState);
                voiceStateRef.current = newState;
              });
              socket.emit("userJoinedVoiceChannel", {
                userId,
                serverId: parseInt(serverId),
                channelId: parseInt(channelId),
              });
            });
        } catch (e) {
          console.log(
            "Can't start a voice call without a microphone! Or there was a problem with your microphone!",
          );
          console.error(e);
        }
      }
    },
    [
      channelId,
      hideVideoFunction,
      localAudioRef,
      releaseDevices,
      serverId,
      setCallStarted,
      setSendScreen,
      setSendWebcam,
      setVoiceState,
      userId,
      videoToggle,
    ],
  );

  hideVideoFunction.current = useCallback(
    (event) => {
      if (event) {
        event.preventDefault();
      }
      if (videoToggle) {
        document.getElementById("localVideo").hidden = true;
        setVideoToggle(false);
      } else {
        document.getElementById("localVideo").hidden = false;
        setVideoToggle(true);
      }
    },
    [setVideoToggle, videoToggle],
  );

  addWebcamToStream.current = (event) => {
    event.preventDefault();
    if (!sendWebcam) {
      try {
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false,
          })
          .then((res) => {
            res.getTracks().forEach((track) => (track.contentHint = "webcam"));
            res.contentHint = "webcam";
            localWebCamRef.current.srcObject = res;
            stopVideoRef.current = res;
            const videoWindow = document.getElementById("localVideo");
            videoWindow.hidden = false;
            for (let peerConn of Object.values(rtcPeers.current)) {
              peerConn.addStream(res);
            }
            setVideoToggle(true);
            setSendWebcam(true);
          });
      } catch (e) {
        console.log(
          "Can't start a video call without a camera! Or there was a problem with your camera!",
        );
        console.error(e);
      }
    } else {
      for (let peerConn of Object.values(rtcPeers.current)) {
        peerConn.removeStream(stopVideoRef.current);
        peerConn.send(`user${userId}webcam`);
      }
      stopVideoRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      stopVideoRef.current = null;
      setSendWebcam(false);
      hideVideoFunction.current();
    }
  };

  addScreenToStream.current = (event, resolution, frameRate) => {
    event?.preventDefault();
    setSendScreen(true);
    let width;
    let height;
    let sampleRate;
    if (!sendScreen) {
      switch (resolution) {
        case "720p":
          width = 1280;
          height = 720;
          sampleRate = 300000;
          break;
        case "1080p":
          width = 1920;
          height = 1080;
          sampleRate = 700000;
          break;
        case "1440p":
          width = 2560;
          height = 1440;
          sampleRate = 10000000;
          break;
        case "4k":
          width = 3840;
          height = 2160;
          sampleRate = 14000000;
          break;
        case "absurd":
          width = 3840;
          height = 2160;
          sampleRate = 68000000;
          console.log("Absurd chosen, good luck.");
          break;
        default:
          width = 1280;
          height = 720;
          sampleRate = 300000;
          frameRate = 30;
          break;
      }
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            width: { ideal: width, max: width },
            height: { ideal: height, max: height },
            sampleRate: sampleRate,
            frameRate: { ideal: frameRate },
          },
          audio: {
            autoGainControl: false,
            channelCount: 2,
            echoCancellation: false,
            latency: 0,
            noiseSuppression: false,
            sampleRate: 48000,
            sampleSize: 16,
            volume: 1.0,
          },
        })
        .then((res) => {
          res.getVideoTracks().forEach((track) => {
            track.contentHint = "motion";
          });
          myDisplay.current.srcObject = res;
          localDisplayRef.current = res;
          for (let peerConn of Object.values(rtcPeers.current)) {
            peerConn.addStream(localDisplayRef.current);
          }
        })
        .catch((err) => {
          if (
            err.toString() === "NotReadableError: Could not start audio source"
          ) {
            alert(
              "An error occured, if you tried to share system audio, it's not currently supported by most browsers",
            );
          }
          console.error(err);
          setSendScreen(false);
          return null;
        });
    } else {
      for (let peerConn of Object.values(rtcPeers.current)) {
        peerConn.removeStream(localDisplayRef.current);
      }
      localDisplayRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localDisplayRef.current = null;
      setSendScreen(false);
    }
  };

  // Responsible for things related to initiating a new peer connection.
  useEffect(() => {
    if (callStarted) {
      socket.on("newUserJoining", (data) => {
        if (data.error) return;
        newOffer(data, createPeerConnection(true));
      });
    } else {
      socket.off("newUserJoining");
    }
  }, [callStarted, newOffer, createPeerConnection]);

  // Responsible for thing related to recieving a new peer connection request and shutting off
  // sockets when the component unmounts.
  useEffect(() => {
    socket.on("signal", (data) => {
      if (!rtcPeers.current[data.from]) {
        newOffer(data, createPeerConnection(false));
        return;
      }
      rtcPeers.current[data.from].signal(data.signal);
    });

    socket.on("userLeavingChannel", (data) => {});

    return () => {
      socket.off("signal");
      socket.off("userLeavingChannel");
      socket.off("newUserJoining");
      setVoiceUsers({});
    };
  }, [newOffer, createPeerConnection, setVoiceUsers]);

  // Responsible for starting the call upon joining a channel,
  // cleaning up once the component unmounts, letting
  // the server know the user has left a specific voice channel,
  // and ending any ongoing calls gracefully by releasing devices.
  useEffect(() => {
    callButtonFunction.current();
    return () => {
      if (callStartedRef.current) {
        callButtonFunction.current();
      }
      setVoiceState({});
      voiceStateRef.current = {};
      rtcPeers.current = {};
      setMicMuted(false);
    };
  }, [
    channelId,
    serverId,
    callButtonFunction,
    userId,
    hideVideoFunction,
    releaseDevices,
    setCallStarted,
    setMicMuted,
    setSendScreen,
    setSendWebcam,
    setVoiceState,
    videoToggle,
  ]);

  return (
    <div className="voice-container">
      <div hidden={!(sendScreen || sendWebcam)}>
        {sendScreen ? "Your stream:" : null}
        <video
          id="local-display"
          autoPlay
          playsInline
          muted={true}
          ref={myDisplay}
          hidden={!sendScreen}
          className="local-display"
        ></video>

        {sendWebcam ? "Your webcam:" : null}
        <video
          id="localVideo"
          muted={true}
          hidden={true}
          className="videoBox"
          autoPlay
          playsInline
          ref={localWebCamRef}
        />
      </div>
      <div id="video-box"></div>
    </div>
  );
}
