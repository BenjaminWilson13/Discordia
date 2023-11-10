const GET_VOICE_CHANNELS_BY_SERVER_ID = "voicechannels/GET_THEM_VOICE_CHANNELS"
const GET_ICE_SERVERS = "voicechannels/GET_ICE_SERVERS"




const getVoiceChannelsByServer = (data) => ({
    type: GET_VOICE_CHANNELS_BY_SERVER_ID, 
    payload: data
})

const getIceServers = (data) => ({
    type: GET_ICE_SERVERS, 
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

export const getApiIceServers = () => async (dispatch) => {
    const res = await fetch('/api/voiceChannels/ice_servers'); 
    const data = await res.json(); 
    if (res.ok) {
        dispatch(getIceServers(data)); 
        return null; 
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
        default: 
            return state; 
    }
}
