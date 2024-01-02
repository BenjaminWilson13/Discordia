from flask_wtf import FlaskForm
from wtforms import IntegerField
from wtforms.validators import DataRequired, ValidationError
from app.models import User


def user_id_exists(form, field):
    user_id = field.data
    user = User.query.get(user_id)
    if not user:
        raise ValidationError("User does not exist")


class ServerInviteForm(FlaskForm):
    user_id = IntegerField("userId", validators=[DataRequired(), user_id_exists])
    server_id = IntegerField("serverId", validators=[DataRequired()])