from flask import Blueprint, request
from flask_login import current_user, login_required

from ..forms import ChannelGroupForm
from ..models import ChannelGroup, Server, db
from .utils import get_user_role

channel_group_routes = Blueprint("channel_groups", __name__)


@channel_group_routes.route("/<int:serverId>", methods=["POST"])
@login_required
def index(serverId):
    role = get_user_role(current_user.id, serverId)
    if role != "owner" and role != "admin":
        return {"errors": "Must be an owner or admin to create a channel group"}, 403

    data = request.get_json()
    groups = {group.name for group in Server.query.get(serverId).groups}
    if data["name"] in groups:
        return {"errors": "A group with that name already exists on the server"}, 403

    form = ChannelGroupForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    form.name.data = data["name"]
    form.server_id.data = serverId

    if form.validate():
        newGroup = ChannelGroup(server_id=serverId, name=data["name"])
        db.session.add(newGroup)
        db.session.commit()
        return newGroup.to_dict()
    else:
        errors = form.errors
        return errors, 400
