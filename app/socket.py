import os
from datetime import datetime

from engineio.payload import Payload
from flask import request
from flask_login import current_user, login_required
from flask_socketio import SocketIO, emit, join_room, leave_room, send

from .models import (
    ChannelMessage,
    DirectMessage,
    DirectMessageConversation,
    DirectMessageReaction,
    User,
    db,
)
# Had to be set higher because session descriptions were much larger in production vs 
# local testing due to far more complex P2P connection methods. 
Payload.max_decode_packets = 1000


# This is the shape of the voice_channel_users dictionary,
# it keeps track of which user is in which voice channel

voice_channel_users = {}
# voice_channel_users = {server_id: [[channel_id, user_id], [channel_id, user_id]]}
# the [channel_id, user_id] are tuples.


# configure allowed cors origin
if os.environ.get("FLASK_ENV") == "production":
    origins = "*"
else:
    origins = "*"

# create your socketIO instance
socketio = SocketIO(cors_allowed_origin=origins, ping_timeout=120, ping_interval=60000)


def create_reply(server_id):
    # reply = {channel_id: [user_id, user_id]}
    # This is what the front end is expecting as a reply inorder to update the channel_list component

    reply = {}
    room = str(server_id) + "voiceChannelWatch"
    if server_id in voice_channel_users:
        for tup in voice_channel_users[server_id]:
            if tup[0] in reply:
                reply[tup[0]] = [*reply[tup[0]], tup[1]]
            else:
                reply[tup[0]] = [tup[1]]
    emit("usersInVoice", reply, to=room)


@socketio.on("lookingAtServer")
def users_in_voice(message):
    server_id = int(message["serverId"])
    room = str(server_id) + "voiceChannelWatch"
    join_room(room)
    create_reply(server_id)


@socketio.on("signal")
def signal_exchange(message):
    room = str(message["to"]) + "user"
    emit("signal", message, to=room, skip_sid=request.sid)


@socketio.on("userJoinedVoiceChannel")
def newUser(message):
    server_id = int(message["serverId"])
    channel_id = int(message["channelId"])
    user_id = int(message["userId"])

    if server_id in voice_channel_users:
        voice_channel_users[server_id] = [
            *voice_channel_users[server_id],
            tuple([channel_id, user_id]),
        ]
    else:
        voice_channel_users[server_id] = [tuple([channel_id, user_id])]

    join_room(channel_id)
    join_room(str(current_user.id) + "user")

    emit(
        "newUserJoining",
        {"from": current_user.id},
        skip_sid=request.sid,
        to=channel_id,
    )

    create_reply(server_id)


@socketio.on("userLeavingChannel")
def leaveChannel(message):
    server_id = int(message["serverId"])
    channel_id = int(message["channelId"])
    voice_channel_users[server_id] = [
        tup for tup in voice_channel_users[server_id] if tup[1] != message["userId"]
    ]
    leave_room(channel_id)
    leave_room(str(current_user.id) + "user")
    emit("userLeavingChannel", message, to=channel_id)

    create_reply(server_id)


@socketio.on_error_default
def default_error_handler(e):
    print("Error: {}".format(e))


@socketio.event
def connect():
    current_user.status = "online"
    emit("updateUser", [current_user.id, "online"], broadcast=True)
    join_room(str(current_user.id) + "direct_message")
    db.session.commit()


@socketio.event
def disconnect():
    current_user.status = "offline"
    emit("updateUser", [current_user.id, "offline"], broadcast=True)
    leave_room(str(current_user.id) + "direct_message")
    db.session.commit()

    for server in voice_channel_users:
        voice_channel_users[server] = [
            tup for tup in voice_channel_users[server] if tup[1] != current_user.id
        ]

    for server_id in voice_channel_users.keys():
        create_reply(server_id)


# handle direct messages - parameter is bananable but must use the same in the front end
@socketio.on("direct_message")
def handle_direct_message(data):
    # handle data by creating a new direct message
    message = DirectMessage(
        message=data["message"],
        conversation_id=data["conversation_id"],
        user_id=data["user_id"],
        created_at=datetime.utcnow(),
    )
    print(data["user_id"])
    # add to seesion and commit
    db.session.add(message)
    conversation = DirectMessageConversation.query.get(data["conversation_id"])
    conversation.updated_at = datetime.utcnow()
    db.session.commit()
    temp = message.to_dict()
    # temp['created_at'] = temp['created_at'].strftime("%m/%d/%Y, %H:%M:%S")
    for user in conversation.directMessageConversationUsers:
        emit("direct_message", temp, to=str(user.user_id) + "direct_message")


@socketio.on("delete_direct_message")
def delete_message(data):
    message = DirectMessage.query.get(data["messageId"])
    temp = message.to_dict()
    for user in message.conversation.directMessageConversationUsers:
        emit("delete_direct_message", temp, to=str(user.user_id) + "direct_message")
    db.session.delete(message)
    db.session.commit()


@socketio.on("update_direct_message")
def update_direct_message(data):
    message = DirectMessage.query.get(data["messageId"])
    message.message = data["message"]
    # message.updated_at = datetime.utcnow()
    temp = message.to_dict()
    print(message.conversation)
    for user in message.conversation.directMessageConversationUsers:
        emit("update_direct_message", temp, to=str(user.user_id) + "direct_message")
    db.session.commit()
    # print("TEMP MESSAGE",temp)


@socketio.on("add_reaction_direct")
def add_reaction_direct(data):
    new_reaction = DirectMessageReaction(
        message_id=data["message_id"],
        reaction=data["reaction"],
        user_id=data["user_id"],
    )
    db.session.add(new_reaction)
    db.session.commit()
    temp = new_reaction.to_dict()
    emit("add_reaction_direct", temp, broadcast=True)


@socketio.on("join_channel")
def user_joining_server_channel(channel_id):
    join_room("text_channel_" + str(channel_id["channelId"]))


@socketio.on("leaving_channel")
def user_leaving_server_channel(channel_id):
    leave_room("text_channel_" + str(channel_id["channelId"]))


# post / create a new message in a channel
@socketio.on("channel_message")
def handle_channel_message(data):
    message = ChannelMessage(
        message=data["message"], user_id=data["user_id"], channel_id=data["channel_id"]
    )
    room = "text_channel_" + str(data["channel_id"])
    # add to session and commit
    db.session.add(message)
    db.session.commit()
    temp = message.to_dict()
    # temp['created_at'] = temp['created_at'].strftime("%m/%d/%Y, %H:%M:%S")
    emit("channel_message", temp, to=room)


# edit a message in a channel
@socketio.on("update_channel_message")
def update_channel_message(data):
    # find the message you want to update with a query
    # update the message and update at time
    # turn to a to_dict to send over
    message = ChannelMessage.query.get(data["message_id"])
    print(message.channel_id)
    message.message = data["message"]
    room = "text_channel_" + str(message.channel_id)
    # message.updated_at = datetime.utcnow()
    temp = message.to_dict()
    db.session.commit()
    emit("update_channel_message", temp, to=room)


# delete a message in a channel
@socketio.on("delete_channel_message")
def delete_channel_message(data):
    message = ChannelMessage.query.get(data["message_id"])
    temp = message.to_dict()
    room = "text_channel_" + str(message.channel_id)

    # delete meesage and commit change
    db.session.delete(message)
    db.session.commit()
    emit("delete_channel_message", temp, to=room)
