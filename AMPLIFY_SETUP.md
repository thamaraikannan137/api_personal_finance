# AWS Amplify Backend Deployment Guide

This guide helps you deploy and troubleshoot the Express backend on AWS Amplify Hosting.

## Backend URL

- **API**: https://api-aws-p1.d425cyjte4tn6.amplifyapp.com
- **Health check**: https://api-aws-p1.d425cyjte4tn6.amplifyapp.com/health

## Frontend Configuration

Update your frontend (ui-personal_finance) to use this API base URL:
```
https://api-aws-p1.d425cyjte4tn6.amplifyapp.com
```

---

## Required: Environment Variables

The backend **will not start** without these. Add them in **Amplify Console → App settings → Environment variables** for the `api_personal_finance` app.

| Variable | Required | Example / Notes |
|----------|----------|-----------------|
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | ✅ | 32+ characters |
| `JWT_REFRESH_SECRET` | ✅ | 32+ characters |
| `S3_ACCESS_KEY_ID` | ✅ | AWS IAM access key |
| `S3_SECRET_ACCESS_KEY` | ✅ | AWS IAM secret key |
| `S3_REGION` | ✅ | `ap-south-1` |
| `S3_BUCKET` | ✅ | Your S3 bucket name |
| `CORS_ORIGIN` | ✅ | `https://aws-p1.d1dmvstp54cq7q.amplifyapp.com` |
| `NODE_ENV` | Recommended | `production` |
| `ADDITIONAL_CORS_ORIGINS` | Optional | Comma-separated extra origins |

⚠️ **If any required variable is missing, the app exits immediately** and Amplify will show "Deployed" but the API will not respond.

---

## Troubleshooting

### 1. Build succeeds but API returns error/empty page

**Cause**: Runtime crash – usually missing or invalid environment variables.

**Fix**:
1. Go to **Amplify Console** → **api_personal_finance** → **App settings** → **Environment variables**
2. Add every variable from the table above
3. **Redeploy** (Hosting → branch → Redeploy this version)

### 2. Check runtime logs

1. **Amplify Console** → **api_personal_finance** → **Monitoring** → **Logs**
2. Look for errors such as:
   - `Invalid environment variables`
   - `MongoServerError` / connection failed
   - `JWT_SECRET` / `JWT_REFRESH_SECRET` validation errors

### 3. Verify deployment structure

After `npm run build && npm run postbuild`, verify:

```
.amplify-hosting/
├── deploy-manifest.json
└── compute/default/
    ├── package.json
    ├── dist/
    │   └── index.js
    └── node_modules/
```

### 4. CORS errors from frontend

Add the Amplify frontend URL to CORS. It is already included for `https://aws-p1.d1dmvstp54cq7q.amplifyapp.com`. For more origins, set `ADDITIONAL_CORS_ORIGINS` in Amplify env vars (comma-separated).

---

## Quick Checklist

- [ ] All required env vars set in Amplify
- [ ] Redeployed after adding env vars
- [ ] Frontend uses `https://api-aws-p1.d425cyjte4tn6.amplifyapp.com` as API URL
- [ ] Checked Monitoring → Logs for runtime errors
