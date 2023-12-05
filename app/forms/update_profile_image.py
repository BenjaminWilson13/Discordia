from flask_login import current_user
from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed, FileField
from wtforms import StringField
from wtforms.validators import ValidationError

from app.api.AWS_helpers import ALLOWED_EXTENSIONS
from app.models import User


def username_exists(form, field):
    # Checking if username is already in use
    username = field.data
    user = User.query.filter(User.username == username).first()
    if user and user.id != current_user.id:
        raise ValidationError("Username is already in use.")


class ProfileImage(FlaskForm):
    username = StringField("username", validators=[username_exists])
    image = FileField("image", validators=[FileAllowed(list(ALLOWED_EXTENSIONS))])
