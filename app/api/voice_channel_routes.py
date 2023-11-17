from flask import Blueprint, jsonify, session, request, redirect
from flask_login import current_user, login_user, logout_user, login_required
from app.models import Channel, ChannelGroup, User, PrivateChannel, ServerUser, Server, db, VoiceChannel
from app.forms import ServerUserForm, ServerForm, ChannelForm, VoiceChannelForm
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

@voice_channel_routes.route("/<int:server_id>", methods=['POST'])
@login_required
def create_voice_channel_by_server_id(server_id): 
    server = Server.query.get(server_id).single_to_dict()
    print(server['userRoles']['owner'], server['userRoles']['admins'], server['userRoles']['users'])
    
    if (current_user.id not in server['userRoles']['owner'] and current_user.id not in server['userRoles']['admins']): 
        return {"error": "Only Admin and Owners can add voice channels"}, 400
    form = VoiceChannelForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    form['server_id'].data = server_id
    
    if form.validate(): 
        res = VoiceChannel(name = form.data['name'], 
                           server_id = form.data['server_id'])
        
        db.session.add(res)
        db.session.commit()
        return {res.id: res.to_dict()}
    else: 
        errors = form.errors
        return errors, 400
    
    



@voice_channel_routes.route("/ice_servers")
@login_required
def get_ice_servers(): 
    res = requests.get('https://discordia.metered.live/api/v1/turn/credentials?apiKey=f7e65de0a80300fc8bddabcc1eb869eab049')
    response = json.loads(res.text)
    return response; 