"""empty message

Revision ID: 3f6bd487cf8b
Revises: 
Create Date: 2023-06-07 16:23:38.471852

"""
import os

import sqlalchemy as sa
from alembic import op

environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")


# revision identifiers, used by Alembic.
revision = "3f6bd487cf8b"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "direct_message_conversations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=40), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("imageUrl", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_table(
        "direct_message_conversation_users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.Date(), nullable=True),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["direct_message_conversations.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "direct_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["direct_message_conversations.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "servers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("imageUrl", sa.String(), nullable=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("default_channel_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "channel_groups",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("server_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["server_id"],
            ["servers.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "direct_message_reactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("reaction", sa.String(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["message_id"],
            ["direct_messages.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "server_users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("server_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(), nullable=True),
        sa.Column("created_at", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(
            ["server_id"],
            ["servers.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "channels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("server_id", sa.Integer(), nullable=False),
        sa.Column("group_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("created_at", sa.Date(), nullable=True),
        sa.Column("isPrivate", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(
            ["group_id"],
            ["channel_groups.id"],
        ),
        sa.ForeignKeyConstraint(
            ["server_id"],
            ["servers.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "channel_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("channel_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["channel_id"],
            ["channels.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "private_channels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("channel_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["channel_id"],
            ["channels.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "channel_message_reactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("reaction", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["message_id"],
            ["channel_messages.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    if environment == "production":
        op.execute(f"ALTER TABLE users SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE servers SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE server_users SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE channel_groups SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE direct_message_conversations SET SCHEMA {SCHEMA};")
        op.execute(
            f"ALTER TABLE direct_message_conversation_users SET SCHEMA {SCHEMA};"
        )
        op.execute(f"ALTER TABLE direct_messages SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE direct_message_reactions SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE channels SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE channel_messages SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE private_channels SET SCHEMA {SCHEMA};")
        op.execute(f"ALTER TABLE channel_message_reactions SET SCHEMA {SCHEMA};")

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("channel_message_reactions", schema=SCHEMA)
    op.drop_table("private_channels", schema=SCHEMA)
    op.drop_table("channel_messages", schema=SCHEMA)
    op.drop_table("channels", schema=SCHEMA)
    op.drop_table("server_users", schema=SCHEMA)
    op.drop_table("direct_message_reactions", schema=SCHEMA)
    op.drop_table("channel_groups", schema=SCHEMA)
    op.drop_table("servers", schema=SCHEMA)
    op.drop_table("direct_messages", schema=SCHEMA)
    op.drop_table("direct_message_conversation_users", schema=SCHEMA)
    op.drop_table("users", schema=SCHEMA)
    op.drop_table("direct_message_conversations", schema=SCHEMA)
    # ### end Alembic commands ###
