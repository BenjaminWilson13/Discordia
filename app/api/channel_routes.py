from flask import Blueprint, jsonify, redirect, request, session
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import or_

from app.api.utils import get_user_role
from app.forms import ChannelForm, ServerForm, ServerUserForm
from app.models import (
    Channel,
    ChannelGroup,
    PrivateChannel,
    Server,
    ServerUser,
    User,
    db,
)

channel_routes = Blueprint("channels", __name__)


@channel_routes.route("/", methods=["POST"])
@login_required
def create_channel():
    """
    Method: POST
    Body: {
    serverId: Int,
    groupId: Int,
    name: String,
    isPrivate: Boolean
    }
    """

    data = request.get_json()
    serverId = data["serverId"]

    role = get_user_role(current_user.id, serverId)

    if role != "owner" and role != "admin":
        return {"errors": "Must be an owner or admin to create a channel"}, 403

    form = ChannelForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    form.server_id.data = serverId
    form.group_id.data = data["groupId"]
    form.name.data = data["name"]
    form.isPrivate.data = data["isPrivate"]

    if form.validate():
        newChannel = Channel(
            server_id=serverId,
            group_id=data["groupId"],
            name=data["name"],
            isPrivate=form.data["isPrivate"],
        )
        db.session.add(newChannel)
        db.session.commit()
        return newChannel.to_dict()
    else:
        errors = form.errors
        return errors, 400


@channel_routes.route("/<int:channelId>", methods=["PUT"])
@login_required
def edit_channel(channelId):
    """
    method: PUT
    body: {
    serverId: Int,
    groupId: Int,
    name: String,
    isPrivate: Boolean
    }
    """
    data = request.get_json()
    serverId = data["serverId"]

    role = get_user_role(current_user.id, serverId)

    if role != "owner" and role != "admin":
        return {"errors": "Must be an owner or admin to edit a channel"}, 403

    form = ChannelForm()
    edit_channel = Channel.query.get(channelId)
    if edit_channel.name != data["name"]:
        form.name.data = data["name"]
    else:
        form.name.data = "@#$@()#SLDFSDH#Hlsdhfl2"

    form["csrf_token"].data = request.cookies["csrf_token"]
    form.server_id.data = serverId
    form.group_id.data = data["groupId"]
    form.isPrivate.data = data["isPrivate"]

    if form.validate():
        channel = Channel.query.get(channelId)
        channel.name = data["name"]
        channel.isPrivate = data["isPrivate"]
        channel.group_id = data["groupId"]
        db.session.add(channel)
        db.session.commit()
        return channel.to_dict(), 201
    else:
        errors = form.errors
        return errors, 400


@channel_routes.route("/<int:channelId>", methods=["DELETE"])
@login_required
def delete_channel(channelId):
    channel = Channel.query.get(channelId)

    role = get_user_role(current_user.id, channel.server_id)

    if role != "owner" and role != "admin":
        return {"errors": "Must be an owner or admin to delete a channel"}, 403

    db.session.delete(channel)
    db.session.commit()
    return {"message": "Channel successfully deleted from server."}
