from .db import SCHEMA, add_prefix_for_prod, db, environment


class ChannelGroup(db.Model):
    __tablename__ = "channel_groups"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    server_id = db.Column(
        db.Integer, db.ForeignKey(add_prefix_for_prod("servers.id")), nullable=False
    )
    name = db.Column(db.String, nullable=False)

    server = db.relationship("Server", back_populates="groups")
    channels = db.relationship(
        "Channel", back_populates="group", cascade="delete-orphan, all"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "server_id": self.server_id,
            "name": self.name,
            # "server": self.server.to_dict(),
            # "channels": self.channels.to_dict()
        }
