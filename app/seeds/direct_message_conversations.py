
from app.models import DirectMessageConversation, db, environment, SCHEMA
from sqlalchemy.sql import text

def direct_message_conversation():
    for conversation in [
        {},
        {},
        {},
        {},
        {}
    ]:
        db.session.add(DirectMessageConversation(**conversation))
    db.session.commit()

def undo_direct_message_conversation():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.directMessageConversations RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM directMessageConversations"))

    db.session.commit()