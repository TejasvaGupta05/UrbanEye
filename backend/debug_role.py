from app import app, db
from models import User

with app.app_context():
    email = 'ayan.ahmedkhan591@gmail.com'
    user = User.query.filter_by(email=email).first()
    if user:
        print(f"User found: {user.name}")
        print(f"Email: {user.email}")
        print(f"Role: '{user.role}'") # Quotes to see whitespace
    else:
        print(f"User with email {email} not found.")
