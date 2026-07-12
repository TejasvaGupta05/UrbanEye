# Deploy UrbanEye Backend to Render

## Quick Setup

### Render Configuration

| Field | Value |
|-------|-------|
| **Name** | `urbaneye-api` (or your choice) |
| **Environment** | Production |
| **Language** | Python 3 |
| **Branch** | `main` |
| **Region** | Oregon (US West) |
| **Root Directory** | `UE_backend-main` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |

> **Important:** The start command is `gunicorn app:app` — not `gunicorn your_application.wsgi`

---

## Environment Variables

Add these in the Render dashboard under **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | `your_gemini_api_key` | Required - [Get key](https://ai.google.dev/) |
| `DATABASE_URL` | `postgresql://...` | Render provides this if you create a PostgreSQL database |
| `JWT_SECRET_KEY` | `your_random_secret_string` | Generate with: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `PYTHON_VERSION` | `3.11.4` | Optional - specify Python version |

### Generate JWT Secret

Run this locally and paste the output:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Database Setup (PostgreSQL on Render)

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Create database:
   - **Name:** `urbaneye-db`
   - **Region:** Same as your web service (Oregon)
   - **Plan:** Free (for testing) or Starter ($7/mo)
3. Copy the **Internal Database URL** from the database dashboard
4. Add it as `DATABASE_URL` environment variable in your web service

The internal URL format:
```
postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/urbaneye_db
```

---

## Step-by-Step Deployment

### 1. Prepare Repository

Make sure your repo has these files in `UE_backend-main/`:

```
UE_backend-main/
├── app.py              # Main Flask application
├── models.py           # SQLAlchemy models
├── requirements.txt    # Python dependencies
├── auth_utils.py
└── ...
```

### 2. Verify requirements.txt

Your `requirements.txt` should include:
```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-RESTX==1.3.0
google-generativeai==0.8.3
Pillow==10.4.0
Werkzeug==3.0.1
python-dotenv==1.0.0
gunicorn==21.2.0
Flask-JWT-Extended==4.6.0
bcrypt==4.1.2
Flask-SQLAlchemy==3.1.1
psycopg2-binary==2.9.9
```

### 3. Create Web Service on Render

1. Go to [render.com](https://render.com) → Dashboard
2. Click **New** → **Web Service**
3. Connect your GitHub repo: `AyanAhmedKhan/Web-app-urbaneye`
4. Fill in the configuration from the table above
5. Add environment variables
6. Click **Deploy web service**

### 4. Wait for Build

Build takes 2-5 minutes. Watch the logs for:
```
==> Build successful
==> Starting service
```

### 5. Initialize Database

After first deploy, the database tables are created automatically via:
```python
with app.app_context():
    db.create_all()
```

To seed sample data, run a one-off job (paid plans only) or do it locally pointing to the production database.

---

## Verify Deployment

Once deployed, test the API:

```bash
# Health check
curl https://your-app-name.onrender.com/api/v1/health

# Swagger docs
open https://your-app-name.onrender.com/docs/
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Civic Issue Detection API is running",
  "timestamp": 1736697600
}
```

---

## Troubleshooting

### "No module named 'app'"
- Check that Root Directory is set to `UE_backend-main`
- Verify `app.py` exists in that directory

### "Connection refused" for database
- Use the **Internal Database URL**, not the External one
- Ensure both services are in the same region

### Gemini API errors
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota at [Google AI Studio](https://ai.google.dev/)

### Free tier spin-down
- Free instances sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to Starter ($7/mo) to avoid this

---

## Optional: render.yaml (Blueprint)

Create `render.yaml` in your repo root for one-click deploys:

```yaml
services:
  - type: web
    name: urbaneye-api
    runtime: python
    region: oregon
    rootDir: UE_backend-main
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: urbaneye-db
          property: connectionString
      - key: JWT_SECRET_KEY
        generateValue: true

databases:
  - name: urbaneye-db
    region: oregon
    plan: free
```

---

## Your Final Render Settings

Based on your screenshot, update:

| Setting | Current | Change To |
|---------|---------|-----------|
| **Start Command** | `gunicorn your_application.wsgi` | `gunicorn app:app` |
| **Root Directory** | `UE_backend-main` | ✓ Correct |
| **Build Command** | `pip install -r requirements.txt` | ✓ Correct |

Then add environment variables and deploy.
