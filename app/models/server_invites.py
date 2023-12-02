from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class ServerInvite(db.Model):
    __tablename__ = 'server_invites'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("users.id")), nullable = False)
    server_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod("servers.id")), nullable = False)
    created_at = db.Column(db.Date, default=datetime.utcnow)

    server = db.relationship("Server", back_populates="server_invites")
    user = db.relationship("User", back_populates="server_invites")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "server_id": self.server_id,
            "created_at": self.created_at
        }