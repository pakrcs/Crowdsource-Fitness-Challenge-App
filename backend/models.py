from datetime import date, datetime
from extensions import db
from sqlalchemy.dialects.postgresql import ARRAY 


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)

    # User Info
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    firebase_uid = db.Column(db.String(80), unique=True, nullable=False)

    # Badge Count
    bronze_badges = db.Column(db.Integer, default=0)
    silver_badges = db.Column(db.Integer, default=0)
    gold_badges = db.Column(db.Integer, default=0)


class Challenge(db.Model):
    __tablename__ = 'challenges'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(500))
    goal = db.Column(db.Integer)
    unit = db.Column(db.String(50))
    difficulty = db.Column(db.String(20))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    creator = db.Column(db.String(120), nullable=False)
    goal_list = db.Column(ARRAY(db.Text))


class UserChallengeProgress(db.Model):
    __tablename__ = 'user_challenge_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    current_day = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)


class UserChallengeStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    challenge_id = db.Column(db.Integer, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class CommunityChat(db.Model):
    __tablename__ = 'community_chat'

    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String, nullable=False)
    text = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class FavoriteChallenge(db.Model):
    __tablename__ = 'favorite_challenges'

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        primary_key=True,
        nullable=False,
    )
    challenge_id = db.Column(
        db.Integer,
        db.ForeignKey('challenges.id'),
        primary_key=True,
        nullable=False,
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    is_completed = db.Column(db.Boolean, default=False)
