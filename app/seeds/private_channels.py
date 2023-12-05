from sqlalchemy.sql import text

from app.models import SCHEMA, PrivateChannel, User, db, environment


def seed_private_channel_user():
    for privateChannelUser in [
        {"channel_id": 8, "user_id": 1},
        {"channel_id": 8, "user_id": 2},
        {"channel_id": 9, "user_id": 1},
        {"channel_id": 9, "user_id": 2},
    ]:
        db.session.add(PrivateChannel(**privateChannelUser))

    db.session.commit()


def undo_private_channel_user():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.private_channels RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM private_channels"))

    db.session.commit()
