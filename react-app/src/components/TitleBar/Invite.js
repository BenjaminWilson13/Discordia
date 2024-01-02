import React from "react";
import { useDispatch } from "react-redux";
import { acceptInvite, declineServerInvite } from "../../store/serverInvites";

function Invite({ invite }) {
  const dispatch = useDispatch();

  const handleJoin = (e) => {
    e.preventDefault();
    dispatch(acceptInvite(invite.id)).then((data) => {
      if (data) {
        // TODO: Flash message Error handling
      } else {
        // TODO: Flash message successfully joined
      }
    });
  };

  const handleDecline = (e) => {
    e.preventDefault();
    dispatch(declineServerInvite(invite.id)).then((data) => {
      if (data) {
        // TODO: Flash message Error handling
      } else {
        // TODO: Flash message successfully joined
      }
    });
  };

  if (!invite)  return null;

  return (
    <div className="invite-wrapper">
      <p>YOU'VE BEEN INVITED TO JOIN A SERVER</p>
      <div className="invite-info">
        <img
          alt={`Display icon for ${invite.server.name}`}
          className="server-icons"
          src={invite.server.imageUrl}
        />
        <p>{invite.server.name}</p>
        <p>
          {invite.server.userCount} member
          {invite.server.userCount > 1 ? "s" : null}
        </p>
        <button onClick={handleJoin}>Join</button>
        <button onClick={handleDecline}>Decline</button>
      </div>
    </div>
  );
}

export default Invite;
