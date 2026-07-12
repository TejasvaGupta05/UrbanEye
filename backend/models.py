from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import time

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False, index=True) # civilian, social_worker, gov_admin, dept_head, field_officer
    department = db.Column(db.String(50), nullable=True, index=True) # Roads, Waste, etc.
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'department': self.department
        }

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category = db.Column(db.String(50), nullable=False, index=True)
    department = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(20), default='medium', index=True)
    status = db.Column(db.String(20), default='open', index=True) # open, assigned, in_progress, resolved
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True, index=True) # Link to reporter
    assigned_to = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True, index=True) # Link to field officer
    
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.Integer, default=lambda: int(time.time()), index=True)
    
    # Relationship with logs
    logs = db.relationship('ReportLog', backref='report', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'department': self.department,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'image_url': self.image_url,
            'assigned_to': self.assigned_to,
            'timestamp': self.created_at,
            'timeline': [log.to_dict() for log in self.logs]
        }

class ReportLog(db.Model):
    __tablename__ = 'report_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    updated_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    timestamp = db.Column(db.Integer, default=lambda: int(time.time()))
    
    def to_dict(self):
        return {
            'status': self.status,
            'message': self.message,
            'updated_by': self.updated_by,
            'timestamp': self.timestamp
        }

class Worker(db.Model):
    __tablename__ = 'workers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False) # mcd, gig, ngo
    skills = db.Column(db.JSON, nullable=True) # e.g. ["animal_handling", "heavy_lifting"]
    vehicle_type = db.Column(db.String(50), nullable=True)
    
    current_latitude = db.Column(db.Float, nullable=True)
    current_longitude = db.Column(db.Float, nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Float, default=5.0)
    
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'skills': self.skills,
            'vehicle_type': self.vehicle_type,
            'location': {'lat': self.current_latitude, 'lng': self.current_longitude},
            'is_available': self.is_available,
            'rating': self.rating
        }

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id'), nullable=False)
    worker_id = db.Column(db.String(36), db.ForeignKey('workers.id'), nullable=True)
    
    status = db.Column(db.String(20), default='posted', index=True) # posted, accepted, in_progress, completed, verified
    service_type = db.Column(db.String(20), nullable=False) # municipal, private, ngo
    
    quoted_price = db.Column(db.Float, nullable=True)
    proof_image_url = db.Column(db.String(255), nullable=True)
    
    started_at = db.Column(db.Integer, nullable=True)
    completed_at = db.Column(db.Integer, nullable=True)
    
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'worker_id': self.worker_id,
            'status': self.status,
            'service_type': self.service_type,
            'quoted_price': self.quoted_price,
            'proof_image_url': self.proof_image_url,
            'started_at': self.started_at,
            'completed_at': self.completed_at
        }

class Booking(db.Model):
    """Urban Company style booking for civic services"""
    __tablename__ = 'bookings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    report_id = db.Column(db.String(36), db.ForeignKey('reports.id'), nullable=True, index=True)
    worker_id = db.Column(db.String(36), db.ForeignKey('workers.id'), nullable=True, index=True)
    
    service_type = db.Column(db.String(20), nullable=False)  # express, premium
    time_slot = db.Column(db.String(30), nullable=False)  # today_morning, today_evening, tomorrow, custom
    scheduled_at = db.Column(db.Integer, nullable=True)  # timestamp for custom time
    
    status = db.Column(db.String(20), default='pending', index=True)  # pending, confirmed, assigned, in_progress, completed, cancelled
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, refunded
    
    worker_name = db.Column(db.String(100), nullable=True)
    worker_phone = db.Column(db.String(15), nullable=True)
    worker_rating = db.Column(db.Float, nullable=True)
    
    eta_minutes = db.Column(db.Integer, nullable=True)
    
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    updated_at = db.Column(db.Integer, default=lambda: int(time.time()), onupdate=lambda: int(time.time()))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'report_id': self.report_id,
            'worker_id': self.worker_id,
            'service_type': self.service_type,
            'time_slot': self.time_slot,
            'scheduled_at': self.scheduled_at,
            'status': self.status,
            'amount': self.amount,
            'payment_status': self.payment_status,
            'worker': {
                'name': self.worker_name,
                'phone': self.worker_phone,
                'rating': self.worker_rating
            } if self.worker_name else None,
            'eta_minutes': self.eta_minutes,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

class NGORequest(db.Model):
    """NGO help request from civilians"""
    __tablename__ = 'ngo_requests'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # environment, animal_welfare, sanitation, community, other
    scale = db.Column(db.String(20), nullable=False)  # small, medium, large
    
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    address = db.Column(db.String(255), nullable=True)
    
    status = db.Column(db.String(20), default='submitted', index=True)  # submitted, reviewing, assigned, in_progress, resolved, closed
    ngo_id = db.Column(db.String(36), nullable=True)  # Assigned NGO
    ngo_name = db.Column(db.String(100), nullable=True)
    ngo_contact = db.Column(db.String(100), nullable=True)
    
    notes = db.Column(db.Text, nullable=True)  # NGO notes/updates
    
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    updated_at = db.Column(db.Integer, default=lambda: int(time.time()), onupdate=lambda: int(time.time()))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'description': self.description,
            'category': self.category,
            'scale': self.scale,
            'location': {
                'lat': self.latitude,
                'lng': self.longitude,
                'address': self.address
            },
            'status': self.status,
            'ngo': {
                'id': self.ngo_id,
                'name': self.ngo_name,
                'contact': self.ngo_contact
            } if self.ngo_id else None,
            'notes': self.notes,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

class EmployeeProfile(db.Model):
    __tablename__ = 'employee_profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    designation = db.Column(db.String(100), nullable=False)
    joining_date = db.Column(db.String(20), nullable=True)
    basic_salary = db.Column(db.Float, nullable=True)
    bank_account_no = db.Column(db.String(50), nullable=True)
    ifsc_code = db.Column(db.String(20), nullable=True)
    
    updated_at = db.Column(db.Integer, default=lambda: int(time.time()), onupdate=lambda: int(time.time()))
    
    def to_dict(self):
        return {
            'designation': self.designation,
            'joining_date': self.joining_date,
            'basic_salary': self.basic_salary,
            'bank_details': {
                'account_no': self.bank_account_no,
                'ifsc': self.ifsc_code
            }
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    date = db.Column(db.String(20), nullable=False, index=True) # YYYY-MM-DD
    check_in = db.Column(db.String(20), nullable=True) # HH:MM AM/PM
    check_out = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), default='absent', index=True) # present, absent, late, half_day
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date,
            'check_in': self.check_in,
            'check_out': self.check_out,
            'status': self.status
        }

class Payroll(db.Model):
    __tablename__ = 'payroll'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    month = db.Column(db.String(20), nullable=False, index=True) # e.g. "October 2024"
    year = db.Column(db.Integer, nullable=False, index=True)
    
    base_salary = db.Column(db.Float, nullable=False)
    deductions = db.Column(db.Float, default=0.0)
    bonus = db.Column(db.Float, default=0.0)
    net_salary = db.Column(db.Float, nullable=False)
    
    status = db.Column(db.String(20), default='pending') # pending, paid
    payment_date = db.Column(db.Integer, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'month': self.month,
            'year': self.year,
            'base_salary': self.base_salary,
            'net_salary': self.net_salary,
            'status': self.status,
            'payment_date': self.payment_date
        }

class Candidate(db.Model):
    __tablename__ = 'candidates'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    experience = db.Column(db.String(50), nullable=True)
    resume_url = db.Column(db.String(255), nullable=True)
    
    status = db.Column(db.String(20), default='applied', index=True) # applied, shortlisted, interview, hired, rejected
    created_at = db.Column(db.Integer, default=lambda: int(time.time()), index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'position': self.position,
            'experience': self.experience,
            'status': self.status,
            'applied_at': self.created_at
        }
