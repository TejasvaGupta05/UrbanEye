import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in .env")
    exit(1)

print(f"🔄 Attempting to connect to: {DATABASE_URL.split('@')[-1]}") # Hide credentials

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("\n✅ SUCCESS: Connected to Neon DB!")
        print(f"   Test Query Result: {result.scalar()}")
except Exception as e:
    print(f"\n❌ CONNECTION FAILED: {e}")
