from app import app, db
from models import Report
import sys

with open('status_check.txt', 'w') as f:
    try:
        with app.app_context():
            count = Report.query.count()
            f.write(f"Reports: {count}\n")
            try:
                # Check column existence by querying it
                db.session.execute("SELECT assigned_to FROM reports LIMIT 1")
                f.write("Column 'assigned_to' exists.\n")
            except Exception as e:
                f.write(f"Column check failed: {e}\n")
    except Exception as e:
        f.write(f"DB Error: {e}\n")
