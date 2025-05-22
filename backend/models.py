from datetime import date, datetime
from extensions import db
from sqlalchemy.dialects.postgresql import ARRAY 


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)

    # User Info
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    firebase_uid =  db.Column(db.String(80), unique=True, nullable=False)

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
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'), nullable=False)
    completed_days = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
