from sqlalchemy.sql import text

from app.models import SCHEMA, DirectMessageConversationUser, db, environment


def seed_direct_message_conversation_users():
    for conversationUsers in [
        {"conversation_id": 1, "user_id": 1},
        {"conversation_id": 1, "user_id": 2},
        {"conversation_id": 2, "user_id": 1},
        {"conversation_id": 2, "user_id": 3},
        {"conversation_id": 3, "user_id": 1},
        {"conversation_id": 3, "user_id": 4},
        {"conversation_id": 4, "user_id": 2},
        {"conversation_id": 4, "user_id": 3},
        {"conversation_id": 5, "user_id": 2},
        {"conversation_id": 5, "user_id": 4},
    ]:
        db.session.add(DirectMessageConversationUser(**conversationUsers))
    db.session.commit()


def undo_direct_message_conversation_users():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.direct_message_conversation_users RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM direct_message_conversation_users"))

    db.session.commit()
