from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User, Challenge, UserChallengeProgress, CommunityChat
from dotenv import load_dotenv
from datetime import datetime
import os
# Firebase Token Verification Decorator
from functools import wraps

# Firebase Admin Setup
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

cred = credentials.Certificate("firebase_admin_config.json")
firebase_admin.initialize_app(cred)


def firebase_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split(" ")
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            decoded_token = firebase_auth.verify_id_token(token)
            request.user = decoded_token  # You can access request.user['uid']
        except Exception as e:
            return jsonify({'message': 'Invalid or expired token', 'error': str(e)}), 401

        return f(*args, **kwargs)
    return decorated


app = Flask(__name__)
CORS(app)
load_dotenv()
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SECRET_KEY'] = 'your-secret-key'

db.init_app(app)


@app.route('/')
def home():
    return "Fitness Challenge App backend"


# Create a Fitness Challenge
@app.route('/challenges', methods=['POST'])
@firebase_token_required
def create_challenge():
    data = request.get_json()

    # Get Firebase UID from the token
    firebase_uid = request.user['uid']

    # Create the challenge using that UID
    try:
        new_challenge = Challenge(
            title=data['title'],
            description=data.get('description', ''),
            goal=data.get('goal'),
            unit=data.get('unit'),
            difficulty=data.get('difficulty'),
            start_date=datetime.strptime(data.get('start_date'), "%Y-%m-%d").date() if data.get('start_date') else None,
            end_date=datetime.strptime(data.get('end_date'), "%Y-%m-%d").date() if data.get('end_date') else None,
            creator=firebase_uid
        )
        db.session.add(new_challenge)
        db.session.commit()
        return jsonify({'message': 'Challenge created'}), 201

    except Exception as e:
        return jsonify({'error': 'Invalid input', 'details': str(e)}), 400


# Route to retrieve all challenges from the database
@app.route('/challenges', methods=['GET'])
@firebase_token_required
def get_challenges():
    # Get the authenticated user's UID from the decoded Firebase token
    user_id = request.user['uid']
    print("Authenticated Firebase UID:", user_id)

    # Fetch all challenges from the database
    challenges = Challenge.query.all()
    output = []

    for c in challenges:
        challenge_data = {
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'goal': c.goal,
            'unit': c.unit,
            'difficulty': c.difficulty,
            'start_date': c.start_date.isoformat() if c.start_date else None,
            'end_date': c.end_date.isoformat() if c.end_date else None,
            'created_at': c.created_at.isoformat() if c.created_at else None,
            'creator': c.creator
        }
        output.append(challenge_data)

    return jsonify({'challenges': output}), 200


# Route to fetch the details of a specific challenge by its ID
@app.route('/challenges/<int:challenge_id>', methods=['GET'])
@firebase_token_required
def get_challenge_by_id(challenge_id):
    challenge = Challenge.query.get_or_404(challenge_id)

    # Return the challenge details as JSON.
    return jsonify({
        'id': challenge.id,
        'title': challenge.title,
        'description': challenge.description,
        'goal': challenge.goal,
        'unit': challenge.unit,
        'difficulty': challenge.difficulty,
        'start_date': challenge.start_date.isoformat() if challenge.start_date else None,
        'end_date': challenge.end_date.isoformat() if challenge.end_date else None,
        'created_at': challenge.created_at.isoformat() if challenge.created_at else None,
        'creator': challenge.creator,
        'goal_list': challenge.goal_list or []
    }), 200


# Route to delete a specific challenge by its ID
@app.route('/challenges/<int:challenge_id>', methods=['DELETE'])
@firebase_token_required
def delete_challenge(challenge_id):
    # Attempt to find the challenge by ID, or return 404 if not found
    challenge = Challenge.query.get_or_404(challenge_id)

    # Only allow the creator to delete their own challenge
    if challenge.creator != request.user['uid']:
        return jsonify({'message': 'Unauthorized'}), 403

    try:
        # Delete the challenge from the database
        db.session.delete(challenge)
        db.session.commit()
        return jsonify({'message': 'Challenge deleted'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to delete challenge', 'error': str(e)}), 500


@app.route('/progress/<int:challenge_id>', methods=['POST'])
@firebase_token_required
def update_progress(challenge_id):
    user_id = request.user['uid']

    progress = UserChallengeProgress.query.filter_by(
        user_id=user_id,
        challenge_id=challenge_id
    ).first()

    if not progress:
        progress = UserChallengeProgress(
            user_id=user_id,
            challenge_id=challenge_id,
            current_day=1,
            completed=False
        )
    else:
        if progress.completed:
            return jsonify({'message': 'Challenge already completed'}), 200

        progress.current_day += 1
        if progress.current_day >= 7:
            progress.completed = True

    db.session.add(progress)
    db.session.commit()

    return jsonify({
        'message': 'Progress updated',
        'current_day': progress.current_day,
        'completed': progress.completed
    }), 200


@app.route('/progress/<int:challenge_id>', methods=['GET'])
@firebase_token_required
def get_progress(challenge_id):
    user_id = request.user['uid']
    progress = UserChallengeProgress.query.filter_by(
        user_id=user_id,
        challenge_id=challenge_id
    ).first()

    if not progress:
        return jsonify({'current_day': 0, 'completed': False}), 200

    return jsonify({
        'current_day': progress.current_day,
        'completed': progress.completed
    }), 200


# Get challenge by creator ID
@app.route('/challenges/creator/<string:creator_uid>', methods=['GET'])
@firebase_token_required
def get_challenges_by_creator(creator_uid):
    challenges = Challenge.query.filter_by(creator=creator_uid).all()
    output = [{
        'id': challenge.id,
        'title': challenge.title,
        'description': challenge.description,
        'goal': challenge.goal,
        'unit': challenge.unit,
        'difficulty': challenge.difficulty,
        'start_date': challenge.start_date.isoformat() if challenge.start_date else None,
        'end_date': challenge.end_date.isoformat() if challenge.end_date else None,
        'created_at': challenge.created_at.isoformat() if challenge.created_at else None,
        'creator': challenge.creator,
        'goal_list': challenge.goal_list or []
    } for challenge in challenges]
    return jsonify({'challenges': output}), 200


# GET account info
@app.route('/account', methods=['GET'])
@firebase_token_required
def get_account():
    firebase_uid = request.user['uid']
    user = User.query.filter_by(firebase_uid=firebase_uid).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'bronze_badges': user.bronze_badges,
        'silver_badges': user.silver_badges,
        'gold_badges': user.gold_badges,
        'firebase_uid': user.firebase_uid
    }), 200


# Create account
@app.route('/account', methods=['POST'])
@firebase_token_required
def create_account():
    firebase_uid = request.user['uid']

    # Exit if account exists
    existing = User.query.filter_by(firebase_uid=firebase_uid).first()
    if existing:
        return jsonify({'message': 'Account already exists'}), 400

    data = request.get_json() or {}
    username = data.get('username')
    if not username:
        return jsonify({'message': 'Username is required'}), 400

    email = request.user.get('email') or data.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400

    try:
        new_user = User(
            firebase_uid=firebase_uid,
            username=username,
            email=email,
            bronze_badges=0,
            silver_badges=0,
            gold_badges=0
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'id': new_user.id,
            'firebase_uid': new_user.firebase_uid,
            'username': new_user.username,
            'email': new_user.email,
            'bronze_badges': new_user.bronze_badges,
            'silver_badges': new_user.silver_badges,
            'gold_badges': new_user.gold_badges,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Could not create account', 'error': str(e)}), 500


# Route to fetch for community chat 
@app.route('/community_chat', methods=['GET'])
def get_community_chat():
    messages = CommunityChat.query.order_by(CommunityChat.timestamp.desc()).all()
    return jsonify([
        {
            "id": msg.id,
            "user": msg.user,
            "text": msg.text,
            "image_url": msg.image_url,
            "timestamp": msg.timestamp.isoformat()
        } for msg in messages
    ])


# Route to post a community chat message
@app.route('/community_chat', methods=['POST'])
def post_community_chat():
    data = request.get_json()

    try:
        new_msg = CommunityChat(
            user=data['user'],
            text=data.get('text', ''),
            image_url=data.get('image_url')
        )
        db.session.add(new_msg)
        db.session.commit()

        return jsonify({"message": "Chat message posted"}), 201
    except Exception as e:
        return jsonify({"error": "Failed to post message", "details": str(e)}), 400


# Route for home screen
@app.route('/latest', methods=['GET'])
def get_latest_content():
    try:
        # Latest 5 challenges
        latest_challenges = Challenge.query.order_by(Challenge.created_at.desc()).limit(5).all()
        challenge_output = [{
            'title': c.title,
            'description': c.description,
            'difficulty': c.difficulty
        } for c in latest_challenges]

        # Latest 5 chat messages
        latest_messages = CommunityChat.query.order_by(CommunityChat.timestamp.desc()).limit(7).all()
        message_output = [{
            'id': m.id,
            'user': m.user,
            'text': m.text,
            'image_url': m.image_url,
            'timestamp': m.timestamp.isoformat()
        } for m in latest_messages]

        return jsonify({
            'latest_challenges': challenge_output,
            'latest_community_messages': message_output
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to fetch latest content', 'details': str(e)}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0")
