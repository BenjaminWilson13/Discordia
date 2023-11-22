import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./ChannelList.css";
import { userServersGet, serverDetailsGet } from "../../store/servers";
import OpenModalButton from "../OpenModalButton";
import EditChannelModal from "../EditChannelModal"
import CreateChannelModal from "../CreateChannelModal";
import EditVoiceChannelModal from "../EditVoiceChannelModal";
import TitleBar from "../TitleBar";
import { getVoiceChannelsByServerId, postNewVoiceChannelByServerId } from "../../store/voiceChannels";
import { NavLink } from "react-router-dom/cjs/react-router-dom";

export default function ChannelList() {
  const params = useParams();
  const history = useHistory();
  const { serverId, channelId } = params;
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const serverDetails = useSelector((state) => state.servers.ServerDetails);
  const allServers = useSelector((state) => state.servers.AllServers);
  const [serverDetail, setServerDetail] = useState(null);
  const voiceChannels = useSelector((state) => state.voiceChannels.channels);

  const href = window.location.href; 


  useEffect(() => {
    if (!Object.keys(allServers).length) {
      dispatch(userServersGet(sessionUser.userId));
    }
  }, [dispatch, allServers, sessionUser.userId]);

  useEffect(() => {
    dispatch(getVoiceChannelsByServerId(serverId));
    if (
      (Object.keys(allServers) && !serverDetails) ||
      !serverDetails[serverId]
    ) {
      dispatch(serverDetailsGet(serverId));
    }
  }, [dispatch, serverId, serverDetails, allServers]);



  if (!serverDetails[serverId] || !allServers[serverId]) {
    return (<div id="conversations-container"></div>)
  }

  const serverDisplay = serverDetails[serverId];
  const { channels } = serverDisplay;

  const groupNames = Object.keys(channels);
  const groupIds = serverDetails[serverId].groupIds
  let defaultChannel;
  if (allServers[serverId]) {
    defaultChannel = allServers[serverId].default_channel_id
  }


  return (
    <>
      <TitleBar serverId={serverId} title={allServers[serverId].name} />
      <div id="conversations-container" className="channel-list-scroll">
        {
          groupNames.map(name => {
            return (
              <div key={name}>
                <div className="group-container" onMouseOver={(e) => {
                  const button = document.getElementById(`new-channel-button-${name}`)
                  button.className = "edit-channel-name-button"
                }} onMouseLeave={(e) => {
                  const button = document.getElementById(`new-channel-button-${name}`)
                  button.className = "hidden"
                }}>
                  {name}
                  <OpenModalButton id={`new-channel-button-${name}`} buttonText={(<i className="fa-solid fa-plus add-channel"></i>)} className={"hidden"} modalComponent={<CreateChannelModal groupId={groupIds[name]} serverId={parseInt(serverId)} defaultChannel={defaultChannel} />} />
                </div>
                {Object.keys(channels[name]).map((channelName) => {
                  return (
                    <div key={channelName} className="channel-container" onMouseOver={(e) => {
                      const button = document.getElementById(`channel-edit-${channelName}`)
                      button.className = "edit-channel-name-button"
                    }} onMouseLeave={(e) => {
                      const button = document.getElementById(`channel-edit-${channelName}`)
                      button.className = "hidden"
                    }} onClick={() => history.push(`/channels/${serverId}/${channels[name][channelName].id}`)}>
                      <span id="channel" style={channelName === serverDisplay.channelIds[channelId] && href.includes('channels') ? { color: "white", fontWeight: "bold" } : {}}><i className="fa-solid fa-hashtag"></i>{channelName}</span>
                      <OpenModalButton id={`channel-edit-${channelName}`} buttonText={(<i className="fa-solid fa-gear" style={{ backgroundColor: "var(--channel-hover)", fontSize: ".8rem" }}></i>)} className={"hidden"} modalComponent={<EditChannelModal channels={channels} channelName={channelName} groupNames={groupNames} groupIds={groupIds} defaultChannel={defaultChannel} />} />
                    </div>
                  )
                })}
              </div>
            )
          })
        }
        <div className="group-container" onMouseOver={(e) => {
                  const button = document.getElementById(`new-channel-button-voice-channels`)
                  button.className = "edit-channel-name-button"
                }} onMouseLeave={(e) => {
                  const button = document.getElementById(`new-channel-button-voice-channels`)
                  button.className = "hidden"
                }}>
          Voice Channels
          <OpenModalButton id={`new-channel-button-voice-channels`} buttonText={(<i className="fa-solid fa-plus add-channel"></i>)} className={"hidden"} modalComponent={<CreateChannelModal groupId={null} serverId={parseInt(serverId)} voiceChannel={true} defaultChannel={defaultChannel} />} /></div>
        {
          Object.values(voiceChannels).map((voiceChannel) => {
            const channelName = voiceChannel.name
            console.log(voiceChannel)
            return (
              <div key={channelName} className="channel-container" onMouseOver={(e) => {
                const button = document.getElementById(`channel-edit-${channelName}`)
                button.className = "edit-channel-name-button"
              }} onMouseLeave={(e) => {
                const button = document.getElementById(`channel-edit-${channelName}`)
                button.className = "hidden"
              }} onClick={() => history.push(`/voiceChannel/${serverId}/${voiceChannel.id}`)}>
                <span id="channel" style={voiceChannel.id == channelId && href.includes("voiceChannel") ? { color: "white", fontWeight: "bold" } : {}}><i className="fa-solid fa-hashtag"></i>{channelName}</span>
                <OpenModalButton id={`channel-edit-${channelName}`} buttonText={(<i className="fa-solid fa-gear" style={{ backgroundColor: "var(--channel-hover)", fontSize: ".8rem" }}></i>)} className={"hidden"} modalComponent={<EditVoiceChannelModal voiceChannel={voiceChannel} defaultChannel={defaultChannel} />} />
              </div>

              // <NavLink to={`/voiceChannel/${serverId}/${voiceChannel.id}`}><div key={voiceChannel.id} className="channel-container"><i className="fa-solid fa-hashtag"></i>{voiceChannel.name}</div></ NavLink>
            )
          })
        }
      </div>
    </>);
}
