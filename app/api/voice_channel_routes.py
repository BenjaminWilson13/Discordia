import json

import requests
from flask import Blueprint, jsonify, redirect, request, session
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import or_

from app.api.utils import get_user_role
from app.forms import ChannelForm, ServerForm, ServerUserForm, VoiceChannelForm
from app.models import (
    Channel,
    ChannelGroup,
    PrivateChannel,
    Server,
    ServerUser,
    User,
    VoiceChannel,
    db,
)

voice_channel_routes = Blueprint("voiceChannels", __name__)


@voice_channel_routes.route("/<int:server_id>")
@login_required
def get_voice_channels_by_serverId(server_id):
    server = Server.query.get(server_id)
    return {
        voice_channel.id: voice_channel.to_dict()
        for voice_channel in server.voice_channels
    }


@voice_channel_routes.route("/<int:server_id>", methods=["POST"])
@login_required
def create_voice_channel_by_server_id(server_id):
    server = Server.query.get(server_id).single_to_dict()
    print(
        server["userRoles"]["owner"],
        server["userRoles"]["admins"],
        server["userRoles"]["users"],
    )

    if (
        current_user.id not in server["userRoles"]["owner"]
        and current_user.id not in server["userRoles"]["admins"]
    ):
        return {"error": "Only Admin and Owners can add voice channels"}, 400
    form = VoiceChannelForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    form["server_id"].data = server_id

    if form.validate():
        res = VoiceChannel(name=form.data["name"], server_id=form.data["server_id"])

        db.session.add(res)
        db.session.commit()
        return {res.id: res.to_dict()}
    else:
        errors = form.errors
        return errors, 400


@voice_channel_routes.route("/<int:channel_id>", methods=["PUT", "PATCH"])
@login_required
def edit_voice_channel_by_channel_id(channel_id):
    voiceChan = VoiceChannel.query.get(channel_id)
    role = get_user_role(current_user.id, voiceChan.server_id)
    print("checking role", role)
    if role != "owner" and role != "admin":
        return {
            "errors": "Insufficient permission to edit voice channels on this server"
        }, 403
    form = VoiceChannelForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    form["server_id"].data = voiceChan.server_id
    if form.validate():
        voiceChan.name = form.data["name"]
        db.session.commit()
        return {voiceChan.id: voiceChan.to_dict()}
    else:
        return form.errors, 400


@voice_channel_routes.route("/<int:channel_id>", methods=["DELETE"])
@login_required
def delete_voice_channel_by_channel_id(channel_id):
    voiceChan = VoiceChannel.query.get(channel_id)

    if not voiceChan:
        return {"message": "Voice Channel not found..."}, 400

    role = get_user_role(current_user.id, voiceChan.server_id)
    print("checking role", role)
    if role != "owner" and role != "admin":
        return {
            "errors": "Insufficient permission to delete voice channels from this server"
        }, 403

    db.session.delete(voiceChan)
    db.session.commit()
    return {"message": "Server successfully deleted"}
