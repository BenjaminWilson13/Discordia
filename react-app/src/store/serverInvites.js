const GET_SERVER_INVITES = "serverInvites/GET_SERVER_INVITES";

// Actions

const getServerInvites = (invites) => ({
  type: GET_SERVER_INVITES,
  payload: invites,
});

// Thunks

export const serverInvitesGet = () => async (dispatch) => {
  const res = await fetch("/api/invites");
  const data = await res.json();

  if (res.ok) {
    getServerInvites(data)
  } else {
    return data
  }
};

// Server Invites Initial State
const initialState = {};

// Server Invites Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_SERVER_INVITES:
      return {...action.payload.invites};
    default:
      return state;
  }
}