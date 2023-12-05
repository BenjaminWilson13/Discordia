import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { authenticate } from "./store/session";
import Navigation from "./components/Navigation";
import DirectMessages from "./components/DirectMessages";
import ConversationMessages from "./components/DirectMessages/ConversationMessages";
import LandingPage from "./components/LandingPage";
import ChannelList from "./components/ChannelList";
import ChannelMessages from "./components/ChannelMessages";
import ServerUserList from "./components/ServerUserList";
import ExploreServers from "./components/ExploreServers";
import LogoutNav from "./components/LogoutNav";
import DeveloperList from "./components/DeveloperList";
import AllServersList from "./components/AllServersList";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import VoiceChannels from "./components/VoiceChannels";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const addScreenToStream = useRef({});
  const callButtonFunction = useRef({});
  const addWebcamToStream = useRef({});
  const hideVideoFunction = useRef({});
  const [videoToggle, setVideoToggle] = useState(false);
  const [sendScreen, setSendScreen] = useState(false);
  const [sendWebcam, setSendWebcam] = useState(false);
  const [resolution, setResolution] = useState("1080p");
  const [callStarted, setCallStarted] = useState(false);
  const [voiceState, setVoiceState] = useState({});
  const [micMuted, setMicMuted] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState({});
  const localAudioRef = useRef(null);

  useEffect(() => {
    dispatch(authenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      {isLoaded && (
        <>
          <Switch>
            <Route exact path="/">
              <LandingPage />
            </Route>
            <ProtectedRoute exact path="/home">
              <Navigation isLoaded={isLoaded} />
              <DirectMessages />
              <AllServersList />
              <DeveloperList />
              <LogoutNav />
            </ProtectedRoute>
            <ProtectedRoute exact path="/conversations">
              <Navigation isLoaded={isLoaded} />
              <DirectMessages />
              <DeveloperList />
              <LogoutNav />
            </ProtectedRoute>
            <ProtectedRoute exact path="/conversations/:conversationId">
              <Navigation isLoaded={isLoaded} />
              <DirectMessages />
              <ConversationMessages />
              <DeveloperList />
              <LogoutNav />
            </ProtectedRoute>
            <ProtectedRoute exact path="/voiceChannel/:serverId/:channelId">
              <Navigation isLoaded={isLoaded} />
              <ChannelList
                voiceState={voiceState}
                setVoiceState={setVoiceState}
                voiceUsers={voiceUsers}
                setVoiceUsers={setVoiceUsers}
              />
              <VoiceChannels
                callStarted={callStarted}
                callButtonFunction={callButtonFunction}
                setCallStarted={setCallStarted}
                addScreenToStream={addScreenToStream}
                addWebcamToStream={addWebcamToStream}
                hideVideoFunction={hideVideoFunction}
                sendScreen={sendScreen}
                setSendScreen={setSendScreen}
                sendWebcam={sendWebcam}
                setSendWebcam={setSendWebcam}
                videoToggle={videoToggle}
                setVideoToggle={setVideoToggle}
                resolution={resolution}
                setResolution={setResolution}
                voiceState={voiceState}
                setVoiceState={setVoiceState}
                localAudioRef={localAudioRef}
                micMuted={micMuted}
                setMicMuted={setMicMuted}
                setVoiceUsers={setVoiceUsers}
              />
              <ServerUserList />
              <LogoutNav
                callStarted={callStarted}
                callButtonFunction={callButtonFunction}
                setCallStarted={setCallStarted}
                addScreenToStream={addScreenToStream}
                addWebcamToStream={addWebcamToStream}
                hideVideoFunction={hideVideoFunction}
                sendScreen={sendScreen}
                setSendScreen={setSendScreen}
                sendWebcam={sendWebcam}
                setSendWebcam={setSendWebcam}
                videoToggle={videoToggle}
                setVideoToggle={setVideoToggle}
                resolution={resolution}
                setResolution={setResolution}
                voiceState={voiceState}
                setVoiceState={setVoiceState}
                localAudioRef={localAudioRef}
                micMuted={micMuted}
                setMicMuted={setMicMuted}
              />
            </ProtectedRoute>
            <ProtectedRoute exact path="/channels/:serverId/:channelId">
              <Navigation isLoaded={isLoaded} />
              <ChannelList
                voiceState={voiceState}
                setVoiceState={setVoiceState}
                voiceUsers={voiceUsers}
                setVoiceUsers={setVoiceUsers}
              />
              <ChannelMessages />
              <ServerUserList />
              <LogoutNav />
            </ProtectedRoute>
            <ProtectedRoute exact path="/servers/explore">
              <Navigation isLoaded={isLoaded} />
              <ExploreServers />
            </ProtectedRoute>
            <Route>
              <Redirect to="/home" />
            </Route>
          </Switch>
        </>
      )}
    </>
  );
}

export default App;
