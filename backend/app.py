from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User, Challenge, UserChallengeProgress
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


@app.route('/challenges', methods=['GET'])
@firebase_token_required
def get_challenges():
    user_id = request.user['uid']
    print("Authenticated Firebase UID:", user_id)

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


@app.route('/challenges/<int:challenge_id>', methods=['GET'])
@firebase_token_required
def get_challenge_by_id(challenge_id):
    challenge = Challenge.query.get_or_404(challenge_id)

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


@app.route('/challenges/<int:challenge_id>', methods=['DELETE'])
@firebase_token_required
def delete_challenge(challenge_id):
    challenge = Challenge.query.get_or_404(challenge_id)

    # Optional: Only allow the creator to delete their own challenge
    if challenge.creator != request.user['uid']:
        return jsonify({'message': 'Unauthorized'}), 403

    try:
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


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
