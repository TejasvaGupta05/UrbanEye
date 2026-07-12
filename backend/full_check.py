import requests
try:
    r = requests.get('http://localhost:5000/api/v1/health')
    print(f"Health Check: {r.status_code} - {r.text}")
except Exception as e:
    print(f"Health Check Failed: {e}")

from app import app, db
from models import Report, User
try:
    with app.app_context():
        user_count = User.query.count()
        report_count = Report.query.count()
        print(f"DB Check: Users={user_count}, Reports={report_count}")
        
        # Check specific column
        try:
            r = Report.query.first()
            if r:
                print(f"Sample Report Assigned To: {r.assigned_to}")
            else:
                print("No reports found to check column.")
        except Exception as e:
            print(f"Column Check Failed: {e}")

except Exception as e:
    print(f"DB Connection Failed: {e}")
