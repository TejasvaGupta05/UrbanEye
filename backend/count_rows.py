from app import app, db
from models import Report, User

with app.app_context():
    user_count = User.query.count()
    report_count = Report.query.count()
    print(f"Users: {user_count}")
    print(f"Reports: {report_count}")
