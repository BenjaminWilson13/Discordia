from sqlalchemy.sql import text

from app.models import SCHEMA, Server, db, environment


def seed_servers():
    for server in [
        {
            "name": "First server!!!",
            "imageUrl": "https://discordia-aa.s3.us-west-1.amazonaws.com/shubham-dhage-t0Bv0OBQuTg-unsplash.jpg",
            "owner_id": 4,
            "default_channel_id": 1,
        },
        {
            "name": "Demo server!!!",
            "imageUrl": "https://discordia-aa.s3.us-west-1.amazonaws.com/shubham-dhage-t0Bv0OBQuTg-unsplash.jpg",
            "owner_id": 5,
            "default_channel_id": 7,
        },
        {
            "name": "third is best",
            "imageUrl": "https://discordia-aa.s3.us-west-1.amazonaws.com/shubham-dhage-t0Bv0OBQuTg-unsplash.jpg",
            "owner_id": 6,
            "default_channel_id": 10,
        },
        {
            "name": "Dream team",
            "imageUrl": "https://discordia-aa.s3.us-west-1.amazonaws.com/shubham-dhage-t0Bv0OBQuTg-unsplash.jpg",
            "owner_id": 7,
            "default_channel_id": 13,
        },
        {
            "name": "Ben's Test Serv",
            "imageUrl": "https://discordia-aa.s3.us-west-1.amazonaws.com/shubham-dhage-t0Bv0OBQuTg-unsplash.jpg",
            "owner_id": 5,
            "default_channel_id": 14,
        },
    ]:
        db.session.add(Server(**server))

    db.session.commit()


def undo_servers():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.servers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM servers"))

    db.session.commit()
