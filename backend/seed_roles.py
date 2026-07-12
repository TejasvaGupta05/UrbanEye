"""
Seed all 7 demo roles into Neon PostgreSQL database.
Matches the demo credentials shown on the Login page.

Usage: python seed_roles.py
All users get password: ayankhan
"""

from app import app, db
from models import User
import auth_utils
import uuid


DEMO_USERS = [
    {
        "id": "gov_admin_1",
        "email": "admin@gov.in",
        "name": "City Commissioner",
        "role": "gov_admin",
        "department": None,
    },
    {
        "id": "super_admin_1",
        "email": "ayanpthan768@gmail.com",
        "name": "Ayan Ahmed Khan",
        "role": "super_admin",
        "department": None,
    },
    {
        "id": "dept_head_1",
        "email": "depthead@roads.gov.in",
        "name": "Rajesh Kumar",
        "role": "dept_head",
        "department": "Roads",
    },
    {
        "id": "field_officer_1",
        "email": "officer@mcd.gov.in",
        "name": "Vikram Singh",
        "role": "field_officer",
        "department": "Roads",
    },
    {
        "id": "civilian_1",
        "email": "ayan.ahmedkhan591@gmail.com",
        "name": "Ayan Khan",
        "role": "civilian",
        "department": None,
    },
    {
        "id": "gig_worker_1",
        "email": "gig@urbaneye.in",
        "name": "Ramesh Yadav",
        "role": "gig_worker",
        "department": None,
    },
    {
        "id": "social_worker_1",
        "email": "ngo@urbaneye.in",
        "name": "Priya Sharma",
        "role": "social_worker",
        "department": None,
    },
]

DEFAULT_PASSWORD = "ayankhan"


def seed_roles():
    with app.app_context():
        hashed_pw = auth_utils.hash_password(DEFAULT_PASSWORD)
        created = 0
        updated = 0

        for u in DEMO_USERS:
            existing = User.query.filter_by(email=u["email"]).first()
            if existing:
                # Update password hash and details
                existing.password_hash = hashed_pw
                existing.name = u["name"]
                existing.role = u["role"]
                existing.department = u["department"]
                updated += 1
                print(f"  ✓ Updated: {u['role']:15s}  {u['email']}")
            else:
                user = User(
                    id=u["id"],
                    email=u["email"],
                    password_hash=hashed_pw,
                    name=u["name"],
                    role=u["role"],
                    department=u["department"],
                )
                db.session.add(user)
                created += 1
                print(f"  + Created: {u['role']:15s}  {u['email']}")

        db.session.commit()
        print(f"\n✅ Done! Created: {created}, Updated: {updated}")
        print(f"   Password for all: {DEFAULT_PASSWORD}")

        # Verify
        print("\n--- All users in DB ---")
        for user in User.query.all():
            print(f"  {user.role:15s}  {user.email}")


if __name__ == "__main__":
    print("🔧 Seeding all 7 demo roles into Neon DB...")
    print(f"   Password: {DEFAULT_PASSWORD}\n")
    seed_roles()
