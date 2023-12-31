from datetime import datetime

from .db import SCHEMA, add_prefix_for_prod, db, environment


class DirectMessage(db.Model):
    __tablename__ = "direct_messages"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("direct_message_conversations.id")),
        nullable=False,
    )
    message = db.Column(db.String(255), nullable=False)
    user_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    conversation = db.relationship(
        "DirectMessageConversation", back_populates="directMessages"
    )
    user = db.relationship("User", back_populates="directMessages")
    direct_reactions = db.relationship(
        "DirectMessageReaction",
        back_populates="direct_message",
        cascade="delete-orphan, all",
    )

    def to_dict(self):
        reactions = {
            reaction.id: reaction.to_dict() for reaction in self.direct_reactions
        }
        return {
            "conversationId": self.conversation_id,
            "message": self.message,
            "id": self.id,
            "userId": self.user_id,
            "UserInfo": self.user.to_dict(),
            "reactions": reactions,
            "createdAt": self.created_at.strftime("%m/%d/%Y, %H:%M:%S"),
            "updatedAt": self.updated_at.strftime("%m/%d/%Y, %H:%M:%S"),
        }
