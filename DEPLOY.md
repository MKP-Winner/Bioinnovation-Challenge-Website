# Deployment Guide: Bioinnovation Challenge Website

## Quick Start (Render.com - Recommended)

### Setup Steps:

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Create Render account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select your GitHub repo
   - Configure:
     - **Name**: `bioinnovation-api` (or similar)
     - **Environment**: Python
     - **Build command**: `pip install -r requirements.txt`
     - **Start command**: `gunicorn -w 4 -b 0.0.0.0:$PORT predict_api:app`
     - **Plan**: Free (will auto-spin down after 15 min of inactivity)

4. **Deploy**
   - Click "Create Web Service"
   - Wait ~2-3 minutes for first deployment
   - Get your live URL: `https://bioinnovation-api.onrender.com`

### Auto-Deploy on Push
- Every time you push to GitHub, Render automatically redeploys
- No additional setup needed!

---

## Local preview

Run the API from a Python 3.11 environment with the project dependencies
installed, then open **http://127.0.0.1:5000/**. Do not open `index.html`
directly from the file system: the calculator intentionally uses same-origin
requests and will not connect from a `file://` page.

```bash
python predict_api.py
```

---

## Frontend and CORS

The Flask service serves the website and API from the same origin, so no CORS
configuration is needed for the deployed site. If you deliberately host the
frontend elsewhere, configure Render's `ALLOWED_ORIGINS` environment variable
with its exact HTTPS origin (for example, `https://example.org`). Do not use
`*` for health-related inputs.

---

## Test Your Deployment

```bash
# Health check
curl https://bioinnovation-api.onrender.com/health

# Get schema
curl https://bioinnovation-api.onrender.com/schema

# Make a prediction
curl -X POST https://bioinnovation-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Age": 67,
    "Sex": "Female",
    "BMI": 26.1,
    "Exercise_Frequency_Weekly": 3,
    "Family_History_Alzheimer": 0,
    "Family_History_Dementia": 0,
    "Hypertension": 0,
    "Diabetes": 0,
    "Medication_Count": 2,
    "APOE_e4": 0
  }'
```

---

## Important Notes

- **Free tier**: App sleeps after 15 minutes of inactivity (wakes on request)
- **Large models**: If `model.joblib` is >100MB, you may need Paid tier
- **Health data**: Remember to add authentication & HTTPS (Render provides free HTTPS)
- **CORS**: Already configured for cross-origin requests

---

## Alternative Platforms

- **Railway.app** - Similar to Render, also free
- **Heroku** - Limited free tier (hibernation)
- **AWS** - More complex, but scalable

---

## Troubleshooting

**App won't start?**
- Check Render dashboard logs for errors
- Ensure all dependencies are in `requirements.txt`
- Verify port is set to `$PORT` (not hardcoded 5000)

**Model file not found?**
- Add to Render environment: `GIT_LFS_SKIP_SMUDGE=1` if using Git LFS
- Or upload model separately via Render's filesystem

**CORS errors?**
- Serve the frontend from this service, or set the exact frontend origin in
  `ALLOWED_ORIGINS`.
