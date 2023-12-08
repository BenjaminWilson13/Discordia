from .db import SCHEMA, add_prefix_for_prod, db, environment


class DirectMessageReaction(db.Model):
    __tablename__ = "direct_message_reactions"
    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("direct_messages.id")),
        nullable=False,
    )
    reaction = db.Column(db.String, nullable=False)
    user_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable=False
    )

    direct_message = db.relationship("DirectMessage", back_populates="direct_reactions")
    user = db.relationship("User", back_populates="directMessageReactions")

    def to_dict(self):
        return {
            "id": self.id,
            "message_id": self.message_id,
            "reaction": self.reaction,
            "user_id": self.user_id,
            "username": self.user.username,
        }
