from sqlalchemy.sql import text

from app.models import SCHEMA, ServerUser, User, db, environment


def seed_server_users():
    demo1 = ServerUser(user_id=4, server_id=1, role="owner")

    demo2 = ServerUser(user_id=1, server_id=2, role="user")

    demo3 = ServerUser(user_id=6, server_id=3, role="owner")

    demo4 = ServerUser(user_id=7, server_id=4, role="owner")

    marnie1 = ServerUser(
        user_id=User.query.filter(User.username == "marnie").first().id,
        server_id=1,
        role="admin",
    )

    marnie2 = ServerUser(user_id=5, server_id=2, role="owner")

    marnie3 = ServerUser(user_id=marnie1.user_id, server_id=3, role="user")

    bobbie1 = ServerUser(
        user_id=User.query.filter(User.username == "bobbie").first().id,
        server_id=1,
        role="user",
    )

    bobbie2 = ServerUser(user_id=bobbie1.user_id, server_id=2, role="admin")

    bobbie3 = ServerUser(user_id=bobbie1.user_id, server_id=2, role="user")

    bev1 = ServerUser(
        user_id=User.query.filter(User.username == "bev").first().id,
        server_id=4,
        role="user",
    )

    bev2 = ServerUser(user_id=bev1.user_id, server_id=2, role="admin")

    bev3 = ServerUser(user_id=bev1.user_id, server_id=3, role="user")

    ben1 = ServerUser(
        user_id=User.query.filter(User.username == "ben").first().id,
        server_id=1,
        role="user",
    )

    jay1 = ServerUser(
        user_id=User.query.filter(User.username == "jay").first().id,
        server_id=1,
        role="user",
    )

    mel1 = ServerUser(
        user_id=User.query.filter(User.username == "mel").first().id,
        server_id=1,
        role="user",
    )

    ben2 = ServerUser(
        user_id=User.query.filter(User.username == "ben").first().id,
        server_id=5,
        role="owner",
    )

    luis = ServerUser(
        user_id=User.query.filter(User.username == "leeplayj").first().id,
        server_id=5,
        role="admin",
    )

    ryan = ServerUser(
        user_id=User.query.filter(User.username == "bloodshot").first().id,
        server_id=5,
        role="admin",
    )

    evan = ServerUser(
        user_id=User.query.filter(User.username == "corvax").first().id,
        server_id=5,
        role="admin",
    )

    cameron = ServerUser(
        user_id=User.query.filter(User.username == "camoman13").first().id,
        server_id=5,
        role="admin",
    )

    db.session.add(demo1)
    db.session.add(demo2)
    db.session.add(demo3)
    db.session.add(demo4)
    db.session.add(marnie1)
    db.session.add(marnie2)
    db.session.add(marnie3)
    db.session.add(bobbie1)
    db.session.add(bobbie2)
    db.session.add(bobbie3)
    db.session.add(bev1)
    db.session.add(bev2)
    db.session.add(bev3)
    db.session.add(ben1)
    db.session.add(jay1)
    db.session.add(mel1)
    db.session.add(ben2)
    db.session.add(luis)
    db.session.add(ryan)
    db.session.add(evan)
    db.session.add(cameron)

    db.session.commit()


def undo_server_users():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.server_users RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM server_users"))

    db.session.commit()
