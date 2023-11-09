from flask_socketio import SocketIO, emit
from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from .models import DirectMessage, DirectMessageConversation, DirectMessageReaction, db, ChannelMessage, User
import os
from datetime import datetime
from flask_login import current_user, login_required
from flask_login import current_user, login_required



# configure allowed cors origin
if os.environ.get("FLASK_ENV") == "production":
    origins = "*"
else:
    origins = "*"

# create your socketIO instance
socketio = SocketIO(cors_allowed_origin=origins)
userList = {}

@socketio.on('answer')
def answer(message): 
    offererRoom = str(message['offerer']['userId']) + 'user'
    print(message, 'answer', offererRoom)
    emit('answer', message, to=offererRoom)

@socketio.on("offer")
def offer(message): 
    '''
        {'offer': {OFFEROBJECTHOLYCRAPIT'SHUGE}, 
        'offerer': {'userId': 1, 'channelId': '4', 'serverId': '4'}, 
        'answerer': {'userId': 1, 'serverId': 4, 'channelId': 4}}
    '''
    
    answererRoom = str(message['answerer']['userId']) + 'user'
    print(message, 'offer', 'answererRoom')

    emit("offer", message, to=answererRoom)

@socketio.on("userJoinedVoiceChannel")
def newUser(message): 
    userListString = 's{}c{}'.format(message['serverId'], message['channelId'])
    join_room(message['channelId'])
    join_room(str(current_user.id) + 'user')
    if (userListString not in userList or userList[userListString] <= 0): 
        userList[userListString] = 1
        print ('returning', userList)
        emit('newUserJoining', {'error': 'no users in channel'})
        return
    print("Joining Channel", message)
    print(message['channelId'], str(current_user.id) + ' user')
    emit("newUserJoining", message, skip_sid=request.sid, broadcast=True)

@socketio.on("userLeavingChannel")
def leaveChannel(message): 
    userListString = 's{}c{}'.format(message['serverId'], message['channelId'])
    userList[userListString] -= 1

    print("Leaving Channel", message, userList)
    leave_room(message['channelId'])






@socketio.on('join')
def join(message):
    username = message['username']
    room = message['room']
    join_room(room)
    print('RoomEvent: {} has joined the room {}\n'.format(username, room))
    emit('ready', {username: username}, to=room, skip_sid=request.sid)

@socketio.on('data')
def transfer_data(message):
    username = message['username']
    room = message['room']
    data = message['data']
    print('DataEvent: {} has sent the data:\n {}\n'.format(username, data))
    emit('data', data, to=room, skip_sid=request.sid)  


@socketio.on_error_default
def default_error_handler(e):
    print("Error: {}".format(e))





@socketio.event
def connect(): 
    current_user.status = "online"
    emit("updateUser", [current_user.id, "online"], broadcast=True)
    db.session.commit()

@socketio.event
def disconnect(): 
    current_user.status = "offline"
    emit("updateUser", [current_user.id, "offline"], broadcast=True)
    db.session.commit()

# handle direct messages - parameter is bananable but must use the same in the front end
@socketio.on("direct_message")
def handle_direct_message(data):

    # handle data by creating a new direct message
    message = DirectMessage(
        message= data['message'],
        conversation_id = data['conversation_id'],
        user_id = data['user_id'],
        created_at = datetime.utcnow()
    )
    # add to seesion and commit
    db.session.add(message)
    conversation = DirectMessageConversation.query.get(data['conversation_id'])
    conversation.updated_at = datetime.utcnow()
    db. session.commit()
    temp = message.to_dict()
    # temp['created_at'] = temp['created_at'].strftime("%m/%d/%Y, %H:%M:%S")
    emit("direct_message", temp, broadcast=True)

@socketio.on("delete_direct_message")
def delete_message(data):
    message = DirectMessage.query.get(data['messageId'])
    temp = message.to_dict()
    db.session.delete(message)

    db.session.commit()
    emit("delete_direct_message",temp,broadcast=True)

@socketio.on("update_direct_message")
def update_direct_message(data):
    message = DirectMessage.query.get(data['messageId'])
    message.message = data['message']
    # message.updated_at = datetime.utcnow()
    temp = message.to_dict()
    # print("TEMP MESSAGE",temp)
    db.session.commit()
    emit("update_direct_message",temp,broadcast=True)


@socketio.on("add_reaction_direct")
def add_reaction_direct(data):
    new_reaction = DirectMessageReaction (
        message_id = data['message_id'],
        reaction = data['reaction'],
        user_id = data['user_id']
    )
    db.session.add(new_reaction)
    db.session.commit()
    temp = new_reaction.to_dict()
    emit("add_reaction_direct", temp, broadcast=True)

# post / create a new message in a channel
@socketio.on("channel_message")
def handle_channel_message(data):
    message = ChannelMessage(
        message = data['message'],
        user_id = data['user_id'],
        channel_id = data['channel_id']
    )
    # add to session and commit
    db.session.add(message)
    db.session.commit()
    temp = message.to_dict()
    # temp['created_at'] = temp['created_at'].strftime("%m/%d/%Y, %H:%M:%S")
    emit("channel_message", temp, broadcast=True)

# edit a message in a channel
@socketio.on("update_channel_message")
def update_channel_message(data):
    # find the message you want to update with a query
    # update the message and update at time
    #turn to a to_dict to send over
    message = ChannelMessage.query.get(data['message_id'])
    message.message = data['message']
    # message.updated_at = datetime.utcnow()
    temp = message.to_dict()
    db.session.commit()
    emit("update_channel_message",temp,broadcast=True)


# delete a message in a channel
@socketio.on("delete_channel_message")
def delete_channel_message(data):
    message = ChannelMessage.query.get(data['message_id'])
    temp = message.to_dict()

    # delete meesage and commit change
    db.session.delete(message)
    db.session.commit()
    emit("delete_channel_message",temp,broadcast=True)
