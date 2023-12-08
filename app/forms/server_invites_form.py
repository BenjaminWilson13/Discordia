from flask_wtf import FlaskForm
from wtforms import IntegerField
from wtforms.validators import DataRequired, ValidationError
from app.models import User, Server


def user_id_exists(form, field):
    user_id = field.data
    user = User.query.get(user_id)
    if not user:
        raise ValidationError("User does not exist")

def server_exists(form, field):
    server_id = field.data
    server = Server.query.get(server_id)
    if not server:
        raise ValidationError("Server does not exist")

class ServerInviteForm(FlaskForm):
    user_id = IntegerField("userId", validators=[DataRequired(), user_id_exists])
    server_id = IntegerField("serverId", validators=[DataRequired(), server_exists])