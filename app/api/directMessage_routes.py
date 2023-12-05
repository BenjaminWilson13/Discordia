from flask import Blueprint, request
from flask_login import current_user, login_required

from app.models import (
    DirectMessage,
    DirectMessageConversation,
    DirectMessageReaction,
    db,
)

directMessage_routes = Blueprint("", __name__)
