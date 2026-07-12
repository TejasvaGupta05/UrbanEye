from app import app
from dotenv import load_dotenv
import os

load_dotenv() # Load explicitly to check if it fixes it

print(f"Configured DB: {app.config['SQLALCHEMY_DATABASE_URI']}")
print(f"Env DB: {os.getenv('DATABASE_URL')}")
