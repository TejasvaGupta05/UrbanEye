
# Modern HTML Email Templates for UrbanEye

def get_base_styles():
    return """
    body { font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 30px; text-align: center; position: relative; }
    .header-logo { width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; line-height: 50px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 40px 35px; color: #334155; line-height: 1.7; font-size: 16px; }
    .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: linear-gradient(to right, #4f46e5, #6366f1); color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 25px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3); transition: all 0.2s ease; }
    .highlight-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0; }
    .label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px; }
    .value { font-size: 18px; font-weight: 700; color: #1e293b; }
    """

def get_welcome_email(user_name):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>{get_base_styles()}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="header-logo">UE</div>
                <h1>Welcome to UrbanEye</h1>
            </div>
            <div class="content">
                <p>Hello <strong>{user_name}</strong>,</p>
                <p>We are thrilled to have you on board! <strong>UrbanEye</strong> is built on the belief that every citizen has the power to create positive change in their community.</p>
                
                <p>Your journey to a better city starts now:</p>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin: 25px 0;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="background: #e0e7ff; color: #4338ca; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</span>
                        <span><strong>Snap & Report</strong> civic issues instantly.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="background: #dcfce7; color: #15803d; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</span>
                        <span><strong>Track Progress</strong> in real-time.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="background: #fef9c3; color: #a16207; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">3</span>
                        <span><strong>Impact Your City</strong> and earn rewards.</span>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="https://web-app-urbaneye.vercel.app/login" class="btn">Access Dashboard</a>
                </div>
            </div>
            <div class="footer">
                <p>You received this email because you signed up for UrbanEye.<br>Together, let's build a smarter future.</p>
                <div style="margin-top: 15px; display: flex; justify-content: center; gap: 15px; opacity: 0.7;">
                    <span>Twitter</span> • <span>Instagram</span> • <span>LinkedIn</span>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def get_report_confirmation_email(user_name, report_id, category, location):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>{get_base_styles()}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <div class="header-logo" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">✓</div>
                <h1>Report Received</h1>
            </div>
            <div class="content">
                <p>Hi <strong>{user_name}</strong>,</p>
                <p>Thank you for being a vigilant citizen. We successfully received your report and have already logged it into our system for analysis.</p>
                
                <div class="highlight-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
                        <div>
                            <div class="label">Ticket ID</div>
                            <div class="value" style="font-family: monospace;">#{report_id}</div>
                        </div>
                        <div style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">OPEN</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <div class="label">Category</div>
                            <div style="font-weight: 600; color: #334155;">{category}</div>
                        </div>
                        <div>
                            <div class="label">Location</div>
                            <div style="font-weight: 600; color: #334155; font-size: 14px;">{location}</div>
                        </div>
                    </div>
                    <div style="margin-top: 15px;">
                        <div class="label">Next Steps</div>
                        <div style="font-size: 14px; color: #64748b;">Our AI is analyzing the severity. It will be assigned to a field officer within 24 hours.</div>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="https://web-app-urbaneye.vercel.app/dashboard" class="btn">Track Status Live</a>
                </div>
            </div>
            <div class="footer">
                <p>We appreciate your contribution to the community.</p>
                <p style="margin-top: 10px; font-size: 11px; opacity: 0.6;">Automated notification from UrbanEye System</p>
            </div>
        </div>
    </body>
    </html>
    """
