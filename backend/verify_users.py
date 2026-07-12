"""
Verify users in NeonDB
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env")
    exit(1)

print(f"Connecting to: {DATABASE_URL.split('@')[-1]}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # Check users table
        result = connection.execute(text("SELECT id, email, name, role FROM users"))
        users = result.fetchall()
        
        print(f"\nFound {len(users)} users in database:\n")
        print("-" * 80)
        for user in users:
            print(f"ID: {user[0]}")
            print(f"Email: {user[1]}")
            print(f"Name: {user[2]}")
            print(f"Role: {user[3]}")
            print("-" * 80)
            
except Exception as e:
    print(f"\nError: {e}")
