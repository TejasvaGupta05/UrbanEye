import bcrypt
from flask_jwt_extended import create_access_token

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed_password):
    """Check a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user_id, role, additional_claims=None):
    """Generate a JWT token with user role"""
    claims = {"role": role}
    if additional_claims:
        claims.update(additional_claims)
    return create_access_token(identity=user_id, additional_claims=claims)
