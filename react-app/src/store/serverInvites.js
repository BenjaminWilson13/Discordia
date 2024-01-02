import { editServer } from "./servers";

const GET_SERVER_INVITES = "serverInvites/GET_SERVER_INVITES";
const DELETE_SERVER_INVITE = "serverInvites/DELETE_SERVER_INVITE";

// --------------------------Actions----------------------------------

const getServerInvites = (invites) => ({
  type: GET_SERVER_INVITES,
  payload: invites,
});

const deleteSeverInvite = (inviteId) => ({
  type: DELETE_SERVER_INVITE,
  payload: inviteId
})

// --------------------------Thunks----------------------------------

export const serverInvitesGet = () => async (dispatch) => {
  const res = await fetch("/api/invites/");
  const data = await res.json();

  if (res.ok) {
    dispatch(getServerInvites(data));
  } else {
    return data;
  }
};

export const acceptInvite = (inviteId) => async (dispatch) => {
  const res = await fetch(`/api/invites/accept/${inviteId}`);
  const data = await res.json();

  if (res.ok) {
    dispatch(deleteSeverInvite(inviteId));
    dispatch(editServer(data));
    return null;
  } else {
    return data
  }
}

export const declineServerInvite = (inviteId) => async (dispatch) => {
  const res = await fetch(`/api/invites/decline/${inviteId}`, {
    method: "DELETE"
  });
  const data = await res.json();

  if (res.ok) {
    dispatch(deleteSeverInvite(inviteId));
    return null
  } else {
    return data;
  }
}

// ---------------------Server Invites Initial State----------------------------
const initialState = {};

// -----------------------Server Invites Reducer--------------------------------
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_SERVER_INVITES:
      return {...action.payload.invites};
    case DELETE_SERVER_INVITE:
      const newState = {...state};
      delete newState[action.payload];
      return newState;
    default:
      return state;
  }
}