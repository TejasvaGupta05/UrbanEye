from app import app, db
from sqlalchemy import text

def run_migration():
    with app.app_context():
        print("Running migration to add assigned_to column...")
        try:
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE reports ADD COLUMN assigned_to VARCHAR(36)"))
                conn.commit()
            print("Migration successful!")
        except Exception as e:
            print(f"Migration failed (maybe column exists?): {e}")

if __name__ == "__main__":
    run_migration()
