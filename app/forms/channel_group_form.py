from flask_wtf import FlaskForm
from wtforms import IntegerField, StringField
from wtforms.validators import DataRequired, Length, ValidationError

from app.models import Server


def server_id_exists(form, field):
    server_id = field.data
    server = Server.query.get(server_id)
    if not server:
        raise ValidationError("Server does not exist")


class ChannelGroupForm(FlaskForm):
    server_id = IntegerField("Server ID", validators=[DataRequired(), server_id_exists])
    name = StringField(
        "Channel Group Name",
        validators=[
            DataRequired(),
            Length(
                min=5, max=25, message="Name must be between 5 and 25 characters long"
            ),
        ],
    )
