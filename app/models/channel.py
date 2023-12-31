from datetime import datetime

from .db import SCHEMA, add_prefix_for_prod, db, environment


class Channel(db.Model):
    __tablename__ = "channels"
    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    server_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("servers.id")), nullable=False
    )
    group_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("channel_groups.id")),
        nullable=False,
    )
    name = db.Column(db.String, nullable=False)
    created_at = db.Column(db.Date, default=datetime.utcnow)
    isPrivate = db.Column(db.Boolean, default=False)

    server = db.relationship("Server", back_populates="channels")
    group = db.relationship("ChannelGroup", back_populates="channels")
    privateChannels = db.relationship(
        "PrivateChannel", back_populates="channel", cascade="delete-orphan, all"
    )
    channelMessages = db.relationship(
        "ChannelMessage", back_populates="channel", cascade="delete-orphan, all"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "server_id": self.server_id,
            "group_id": self.group_id,
            "name": self.name,
            "created_at": self.created_at,
            "isPrivate": self.isPrivate,
            "group_name": self.group.name,
        }
