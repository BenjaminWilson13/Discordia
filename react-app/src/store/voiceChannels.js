const GET_VOICE_CHANNELS_BY_SERVER_ID = "voicechannels/GET_THEM_VOICE_CHANNELS"
const GET_ICE_SERVERS = "voicechannels/GET_ICE_SERVERS"
const POST_NEW_VOICE_CHANNEL = "voicechannels/POST_NEW_VOICE_CHANNEL"




const getVoiceChannelsByServer = (data) => ({
    type: GET_VOICE_CHANNELS_BY_SERVER_ID, 
    payload: data
})

const getIceServers = (data) => ({
    type: GET_ICE_SERVERS, 
    payload: data
})

const postNewVoiceChannel = (data) => ({
    type: POST_NEW_VOICE_CHANNEL, 
    payload: data
})

export const getVoiceChannelsByServerId = (serverId) => async (dispatch) => {
    const res = await fetch(`/api/voiceChannels/${serverId}`); 
    const data = await res.json(); 
    if (res.ok) {
        dispatch(getVoiceChannelsByServer(data))
        return null; 
    } else {
        return data; 
    }
}

export const postNewVoiceChannelByServerId = (server_id, name) => async (dispatch) => {
    const res = await fetch(`/api/voiceChannels/${server_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            server_id, 
            name
        })
    })
    const data = await res.json(); 
    if (res.ok) {
        dispatch(postNewVoiceChannel(data)); 
        return data; 
    } else {
        return data; 
    }
}



const initialState = {
    channels: {}, 
    iceServers: []
}

export default function reducer (state = initialState, action) {
    const newState = {...state, channels: {...state.channels}, iceServers: [...state.iceServers]}; 
    switch (action.type) {
        case GET_VOICE_CHANNELS_BY_SERVER_ID: 
            newState.channels = {...action.payload}
            return newState
        case GET_ICE_SERVERS:
            newState.iceServers = [...action.payload]
            return newState; 
        case POST_NEW_VOICE_CHANNEL: 
            newState.channels = {...newState.channels, ...action.payload}; 
            return newState; 
        default: 
            return state; 
    }
}
