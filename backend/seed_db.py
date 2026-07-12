from app import app, db
from models import User, Report, ReportLog
import uuid
import json
import auth_utils

def seed_db():
    with app.app_context():
        # --- USERS SEEDING ---
        if User.query.first():
            print("Users already seeded.")
        else:
            print("Seeding database from users.json...")
            try:
                with open('users.json', 'r') as f:
                    users_data = json.load(f)
                
                for u in users_data:
                    # Check if user exists (redundancy check)
                    if not User.query.filter_by(email=u['email']).first():
                        user = User(
                            id=u.get('id', str(uuid.uuid4())),
                            email=u['email'],
                            password_hash=u['password_hash'],
                            name=u['name'],
                            role=u['role'],
                            department=u.get('department')
                        )
                        db.session.add(user)
                
                db.session.commit()
                print(f"Successfully seeded {len(users_data)} users!")
            except FileNotFoundError:
                print("users.json not found, skipping user seed.")
            except Exception as e:
                print(f"Error seeding users: {e}")

        # --- REPORTS SEEDING ---
        if Report.query.first():
             print("Reports already seeded.")
        else:
            print("Seeding database from reports.json...")
            try:
                with open('reports.json', 'r') as f:
                    reports_data = json.load(f)
                
                # Department Mapping
                DEPT_MAPPING = {
                    'pothole': 'Roads',
                    'street_light': 'Roads',
                    'traffic_signal': 'Roads',
                    'sidewalk': 'Roads',
                    'infrastructure': 'Roads',
                    'garbage': 'Waste',
                    'illegal_dumping': 'Waste',
                    'sewage': 'Water',
                    'drainage': 'Water',
                    'waterlogging': 'Water'
                }

                report_count = 0
                for item in reports_data:
                    timestamp = item.get('timestamp')
                    lat = item.get('latitude')
                    lng = item.get('longitude')
                    
                    for issue in item.get('issues', []):
                        category = issue.get('category')
                        department = DEPT_MAPPING.get(category, 'General')
                        
                        report = Report(
                            category=category,
                            department=department,
                            description=issue.get('description'),
                            severity=issue.get('severity'),
                            latitude=lat,
                            longitude=lng,
                            status='open',
                            created_at=timestamp
                        )
                        
                        log = ReportLog(
                            status='open',
                            message='Issue ported from legacy system',
                            timestamp=timestamp
                        )
                        report.logs.append(log)
                        
                        # Assign 30% of reports to field_officer_1 for testing
                        import random
                        if random.random() < 0.3:
                            officer = User.query.filter_by(role='field_officer').first()
                            if officer:
                                report.assigned_to = officer.id
                                report.status = 'assigned'

                        db.session.add(report)
                        report_count += 1
                
                db.session.commit()
                print(f"Successfully seeded {report_count} reports!")

            except FileNotFoundError:
                print("reports.json not found, skipping report seed.")
            except Exception as e:
                print(f"Error seeding reports: {e}")

if __name__ == '__main__':
    seed_db()
