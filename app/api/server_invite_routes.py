import queue

from flask import Blueprint, Response, request
from flask_login import current_user, login_required

from app.api.utils import get_user_role
from app.forms import ServerInviteForm, ServerUserForm
from app.models import Server, ServerInvite, db, ServerUser
from app.sse_manager import format_sse, manager

server_invite_routes = Blueprint("invites", __name__)


@server_invite_routes.route("/listen")
@login_required
def listen():
    """
    Open connection to the server and listen for new messages
    """
    user_id = current_user.id

    def stream():
        messages = manager.listen(
            user_id
        )  # Assume announcer.listen() returns a queue.Queue
        try:
            msg = messages.get()
            if msg is not None:
                yield msg
        except (GeneratorExit, queue.Empty):
            print("Client disconnected", GeneratorExit)  # Log when a client disconnects

    response = Response(stream(), mimetype="text/event-stream")
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"

    return response


@server_invite_routes.route("/")
@login_required
def get_invites():
    """
    Get all the current user's invites
    """

    return {
        "invites": {
            invite.id: invite.to_dict() for invite in current_user.server_invites
        }
    }


@server_invite_routes.route("/send_invite/<int:serverId>", methods=["POST"])
@login_required
def send_invite(serverId):
    """
    Create a new invite to the server

    Expected Keys:
    {
        "userId": Id of the user to invite
    }
    """
    server = Server.query.get(serverId)
    role = get_user_role(current_user.id, serverId)

    if role != "owner":
        return {"errors": ["Only owners may send invites"]}, 403

    form = ServerInviteForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    form["server_id"].data = serverId
    if form.validate():
        invite = ServerInvite(user_id=form.data["user_id"], server_id=serverId)

        db.session.add(invite)
        db.session.commit()

        # Format the msg for the server to announce
        msg = format_sse(data=server.to_dict(), event="Server Invite")
        # Send the message to the invited user
        manager.announce(msg=msg, user_id=form.data["user_id"])
        return {"message": "Invitation successfully sent!"}, 200
    else:
        errors = form.errors
        return errors, 400

@server_invite_routes.route("/accept/<int:inviteId>", methods=["GET"])
@login_required
def accept_invite(inviteId):
    invite = ServerInvite.query.get(inviteId)

    if current_user.id != invite.user_id:
        return {"error": "Only the invited user can accept an invite."}, 403
    
    form = ServerUserForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    form.user_id.data = invite.user_id
    form.server_id.data = invite.server_id
    form.role.data = "user"

    if form.validate():
        new_member = ServerUser(
            user_id=invite.user_id, server_id=invite.server_id, role="user"
        )
        db.session.add(new_member)
        db.session.delete(invite)
        db.session.commit()
        return new_member.server.to_dict(), 201
    else:
        return form.errors, 400


@server_invite_routes.route("/decline/<int:inviteId>", methods=["DELETE"])
@login_required
def decline_invite(inviteId):

    invite = ServerInvite.query.get(inviteId)

    if current_user.id != invite.user_id:
        return {"error": "Only the invited user can delete an invite."}, 403
    db.session.delete(invite)
    db.session.commit()

    return {"message": "Invite successfully deleted!"}
