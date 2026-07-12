"""
Migration Script: Add user_id column to reports table
Run this to fix the missing column error
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env")
    exit(1)

print("Connecting to NeonDB...")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # Check if column exists
        result = connection.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'reports' AND column_name = 'user_id'
        """))
        
        if result.fetchone():
            print("[OK] user_id column already exists in reports table")
        else:
            print("[!] Adding user_id column to reports table...")
            connection.execute(text("""
                ALTER TABLE reports 
                ADD COLUMN user_id VARCHAR(36) REFERENCES users(id)
            """))
            connection.commit()
            print("[OK] user_id column added successfully!")
        
        # Verify the column
        result = connection.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'reports'"))
        columns = [row[0] for row in result.fetchall()]
        print(f"\nReports table columns: {columns}")
        
except Exception as e:
    print(f"\nError: {e}")
