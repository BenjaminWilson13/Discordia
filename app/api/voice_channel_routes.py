from flask import Blueprint, jsonify, session, request, redirect
from flask_login import current_user, login_user, logout_user, login_required
from app.models import Channel, ChannelGroup, User, PrivateChannel, ServerUser, Server, db
from app.forms import ServerUserForm, ServerForm, ChannelForm
from app.api.utils import get_user_role
from sqlalchemy import or_
import requests
import json


voice_channel_routes = Blueprint("voiceChannels", __name__)

@voice_channel_routes.route("/<int:server_id>")
@login_required
def get_voice_channels_by_serverId(server_id): 
    server = Server.query.get(server_id)

    return {voice_channel.id: voice_channel.to_dict() for voice_channel in server.voice_channels}



@voice_channel_routes.route("/ice_servers")
@login_required
def get_ice_servers(): 
    res = requests.get('https://discordia.metered.live/api/v1/turn/credentials?apiKey=f7e65de0a80300fc8bddabcc1eb869eab049')
    response = json.loads(res.text)
    return response; 