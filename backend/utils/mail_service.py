
from flask_mail import Mail, Message
from flask import current_app
from .email_templates import get_welcome_email, get_report_confirmation_email
import threading

mail = Mail()

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print(f"✅ Email sent to {msg.recipients}")
        except Exception as e:
            print(f"❌ Failed to send email: {str(e)}")

def send_welcome_email(to_email, user_name):
    msg = Message(
        subject="Welcome to UrbanEye! 🚀",
        recipients=[to_email],
        html=get_welcome_email(user_name)
        # sender is configured in app config
    )
    # Threading to avoid blocking the request
    threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()

def send_report_confirmation(to_email, user_name, report_id, category, location):
    msg = Message(
        subject=f"Report Received: #{report_id}",
        recipients=[to_email],
        html=get_report_confirmation_email(user_name, report_id, category, location)
    )
    threading.Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
