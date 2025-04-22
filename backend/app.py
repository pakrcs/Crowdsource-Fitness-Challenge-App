from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User, Challenge

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'your-secret-key'

db.init_app(app)

@app.route('/')
def home():
    return "Fitness Challenge App backend"

# User Registration
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409

    hashed_pw = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = User(username=data['username'], password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'})

# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login successful'})
    return jsonify({'message': 'Invalid credentials'}), 401

# Create a Fitness Challenge
@app.route('/challenges', methods=['POST'])
def create_challenge():
    data = request.get_json()

    # Check if creator exists
    user = User.query.filter_by(username=data['creator']).first()
    if not user:
        return jsonify({'message': 'Creator does not exist'}), 400

    new_challenge = Challenge(
        title=data['title'],
        description=data.get('description', ''),
        creator=data['creator']
    )
    db.session.add(new_challenge)
    db.session.commit()
    return jsonify({'message': 'Challenge created'})

@app.route('/challenges', methods=['GET'])
def get_challenges():
    challenges = Challenge.query.all()
    output = []

    for c in challenges:
        challenge_data = {
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'creator': c.creator
        }
        output.append(challenge_data)

    return jsonify({'challenges': output})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
