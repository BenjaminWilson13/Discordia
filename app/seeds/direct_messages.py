from sqlalchemy.sql import text

from app.models import SCHEMA, DirectMessage, db, environment


def seed_direct_messages():
    for message in [
        {"conversation_id": 1, "user_id": 1, "message": "Testing testing"},
        {"conversation_id": 1, "user_id": 2, "message": "yes yes I hear you"},
        {"conversation_id": 1, "user_id": 1, "message": "are you sure though"},
        {"conversation_id": 1, "user_id": 2, "message": "uh yes very sure"},
        {"conversation_id": 2, "user_id": 1, "message": "sup stranger"},
        {"conversation_id": 2, "user_id": 1, "message": "are you leaving me on read?"},
        {"conversation_id": 2, "user_id": 1, "message": ":("},
        {"conversation_id": 3, "user_id": 4, "message": "hi best friend"},
        {"conversation_id": 3, "user_id": 1, "message": "best friend??"},
        {"conversation_id": 3, "user_id": 4, "message": "too forward?"},
        {"conversation_id": 3, "user_id": 1, "message": "oof"},
    ]:
        db.session.add(DirectMessage(**message))
    db.session.commit()


def undo_direct_messages():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.direct_messages RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM direct_messages"))

    db.session.commit()
