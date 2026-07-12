"""
Database Reset Script
Drops and recreates all tables with the latest schema
"""
from app import app, db
from models import User, Report, ReportLog, Worker, Job, Booking, NGORequest
import auth_utils

def reset_db():
    with app.app_context():
        print("[!] Dropping all tables...")
        db.drop_all()
        
        print("[OK] Creating fresh tables...")
        db.create_all()
        
        print("[+] Adding users...")
        
        # Super Admin
        super_admin = User(
            id='super_admin_1',
            email='superadmin@urbaneye.com',
            password_hash=auth_utils.hash_password('admin123'),
            name='System Administrator',
            role='super_admin'
        )
        db.session.add(super_admin)
        
        # Civilian
        civilian = User(
            id='civilian_1',
            email='civilian@urbaneye.com',
            password_hash=auth_utils.hash_password('password123'),
            name='John Doe',
            role='civilian'
        )
        db.session.add(civilian)
        
        # Government Admin
        gov_admin = User(
            id='gov_admin_1',
            email='admin@gov.in',
            password_hash=auth_utils.hash_password('password123'),
            name='City Commissioner',
            role='gov_admin'
        )
        db.session.add(gov_admin)
        
        # Department Head
        dept_head = User(
            id='dept_head_1',
            email='head_roads@gov.in',
            password_hash=auth_utils.hash_password('password123'),
            name='Rajesh Kumar',
            role='dept_head',
            department='Roads'
        )
        db.session.add(dept_head)
        
        # Field Officer
        field_officer = User(
            id='field_officer_1',
            email='officer_1@gov.in',
            password_hash=auth_utils.hash_password('password123'),
            name='Vikram Singh',
            role='field_officer',
            department='Roads'
        )
        db.session.add(field_officer)
        
        # Social Worker / NGO
        ngo_user = User(
            id='ngo_1',
            email='ngo@urbaneye.com',
            password_hash=auth_utils.hash_password('password123'),
            name='Green Earth Foundation',
            role='social_worker'
        )
        db.session.add(ngo_user)
        
        # Gig Worker
        gig_worker = User(
            id='gig_worker_1',
            email='worker@urbaneye.com',
            password_hash=auth_utils.hash_password('password123'),
            name='Amit Sharma',
            role='gig_worker'
        )
        db.session.add(gig_worker)
        
        db.session.commit()
        print("[OK] Users created!")
        
        print("\n[OK] Database reset complete!")
        print("\n[*] Login Credentials:")
        print("   Super Admin:  superadmin@urbaneye.com / admin123")
        print("   Civilian:     civilian@urbaneye.com / password123")
        print("   Gov Admin:    admin@gov.in / password123")
        print("   Dept Head:    head_roads@gov.in / password123")
        print("   Field Officer: officer_1@gov.in / password123")
        print("   NGO:          ngo@urbaneye.com / password123")
        print("   Gig Worker:   worker@urbaneye.com / password123")

if __name__ == '__main__':
    reset_db()
