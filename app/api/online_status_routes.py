from flask import Blueprint, jsonify, redirect, request, session
from flask_login import current_user, login_required, login_user, logout_user

from app.api.utils import get_user_role
from app.forms import ServerForm, ServerUserForm
from app.models import Channel, ChannelGroup, Server, ServerUser, User, db

online_status_routes = Blueprint("onlineStatus", __name__)


@online_status_routes.route("/")
@login_required
def get_users_online_status():
    user_status = User.query.all()

    return {user.id: user.status for user in user_status}
