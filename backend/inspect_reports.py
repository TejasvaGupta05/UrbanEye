from app import app, db, Report, User
from sqlalchemy import text

with app.app_context():
    print("\n--- DATABASE INSPECTION ---")
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Check Users
    user_count = User.query.count()
    print(f"\nTotal Users: {user_count}")
    super_admins = User.query.filter_by(role='super_admin').all()
    print(f"Super Admins: {len(super_admins)}")
    for sa in super_admins:
        print(f" - {sa.name} ({sa.email})")

    # Check Reports
    report_count = Report.query.count()
    print(f"\nTotal Reports: {report_count}")
    
    if report_count > 0:
        print("\nLast 5 Reports:")
        reports = Report.query.order_by(Report.created_at.desc()).limit(5).all()
        for r in reports:
            print(f" - [{r.id}] {r.category} ({r.status}) - Dept: {r.department}")
    else:
        print("\n❌ NO REPORTS FOUND!")

    print("\n---------------------------")
