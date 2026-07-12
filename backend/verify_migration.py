from app import app, db
from models import User, Report

def check_counts():
    with app.app_context():
        try:
            user_count = User.query.count()
            report_count = Report.query.count()
            print(f"Users: {user_count}")
            print(f"Reports: {report_count}")
        except Exception as e:
            print(f"Error checking counts: {e}")

if __name__ == "__main__":
    check_counts()
