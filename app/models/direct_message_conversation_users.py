from datetime import datetime

from .db import SCHEMA, add_prefix_for_prod, db, environment


class DirectMessageConversationUser(db.Model):
    __tablename__ = "direct_message_conversation_users"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    created_at = db.Column(db.Date, default=datetime.utcnow)
    conversation_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("direct_message_conversations.id")),
        nullable=False,
    )

    conversation = db.relationship(
        "DirectMessageConversation", back_populates="directMessageConversationUsers"
    )
    user = db.relationship("User", back_populates="directMessageConversationUsers")

    def to_dict(self):
        return {"conversationId": self.conversation_id}
