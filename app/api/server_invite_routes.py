from flask import Blueprint, Response, request
from app.sse_manager import manager, format_sse
from flask_login import current_user, login_required


server_invite_routes = Blueprint('invites', __name__)

@server_invite_routes.route('/listen')
@login_required
def listen():

    user_id = current_user.id
    def stream():
        messages = manager.listen(user_id)  # Assume announcer.listen() returns a queue.Queue
        while True:
            # print('New SSE connection')
            msg = messages.get();  # blocks until a new message arrives
            yield f"data: {msg}\n\n"

    return Response(stream(), mimetype='text/event-stream')

@server_invite_routes.route('/send_invite/<int:userId>')
@login_required
def send_invite(userId):
    msg = format_sse(data='pong')
    manager.announce(msg=msg, user_id=7)
    return {}, 200


