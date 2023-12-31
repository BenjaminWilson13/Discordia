from sqlalchemy.sql import text

from app.models import SCHEMA, ChannelGroup, db, environment


def seed_channel_groups():
    for group in [
        {"server_id": 1, "name": "FIRST GROUP!!!!"},
        {"server_id": 1, "name": "BEST GROUP"},
        {"server_id": 1, "name": "Study group"},
        {"server_id": 2, "name": "General"},
        {"server_id": 2, "name": "Boring stuff"},
        {"server_id": 2, "name": "Super fun awesome stuff"},
        {"server_id": 3, "name": "Cool stuff"},
        {"server_id": 3, "name": "Resources"},
        {"server_id": 3, "name": "Other"},
        {"server_id": 4, "name": "General"},
        {"server_id": 5, "name": "General"},
    ]:
        db.session.add(ChannelGroup(**group))

    db.session.commit()


def undo_channel_groups():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.channel_groups RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM channel_groups"))

    db.session.commit()
