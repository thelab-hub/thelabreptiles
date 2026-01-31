# The Lab Reptiles - Backend & Admin Console

A Flask-based backend system for managing inventory, sales, and expenses for The Lab Reptiles gecko breeding business.

## Features

- **Admin Dashboard** - Quick stats and business overview
- **Animal Management** - Add, edit, and track all animals
- **Sales Recording** - Record sales with automatic inventory updates
- **Expense Tracking** - Track all business expenses
- **Sales Pipeline** - Manage leads from website inquiries
- **Financial Reports** - Revenue, expenses, and profit analysis
- **Google Sheets Integration** - All data stored in Google Sheets

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Set Up Google Sheets (Production)

You have multiple options for authenticating with Google Sheets:

#### Option A: Workload Identity Federation (Recommended for Railway)

WIF allows keyless authentication - no JSON credentials file needed!

1. Create a Google Cloud Project and enable Google Sheets API
2. Create a Workload Identity Pool:
   ```bash
   gcloud iam workload-identity-pools create "railway-pool" \
     --location="global" \
     --display-name="Railway Pool"
   ```
3. Create a provider for Railway:
   ```bash
   gcloud iam workload-identity-pools providers create-oidc "railway-provider" \
     --location="global" \
     --workload-identity-pool="railway-pool" \
     --issuer-uri="https://railway.app" \
     --attribute-mapping="google.subject=assertion.sub"
   ```
4. Create a service account and grant access:
   ```bash
   gcloud iam service-accounts create sheets-access

   gcloud iam service-accounts add-iam-policy-binding \
     sheets-access@YOUR_PROJECT.iam.gserviceaccount.com \
     --role="roles/iam.workloadIdentityUser" \
     --member="principalSet://iam.googleapis.com/projects/YOUR_PROJECT_NUMBER/locations/global/workloadIdentityPools/railway-pool/*"
   ```
5. Share your Google Sheet with the service account email
6. Set the `GOOGLE_WIF_CONFIG` environment variable with your WIF configuration JSON

#### Option B: Service Account JSON (Simpler Setup)

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a service account and download credentials.json
4. Upload your spreadsheet to Google Drive
5. Share with service account email (as editor)
6. Add Sheet ID to .env
7. Either:
   - Set `GOOGLE_CREDENTIALS_JSON` env var with the full JSON content, OR
   - Place credentials.json file in the backend directory

### 4. Run Locally

```bash
# Development mode with local data
python app.py

# Or with Flask CLI
flask run --debug
```

Visit http://localhost:5000/admin to access the admin console.

## Development Mode

For development without Google Sheets:
1. Place your Excel file at `admin/data/Animal_Management_BACKEND_READY.xlsx`
2. The system will automatically load and use local JSON data
3. Changes are saved to `admin/data/data.json`

## Deployment to Railway

1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard:
   - `SESSION_SECRET` - Random secret key
   - `ADMIN_USERNAME` - Admin username
   - `ADMIN_PASSWORD_HASH` - Bcrypt hash of password
   - `GOOGLE_SHEET_ID` - Your Google Sheet ID
   - `GOOGLE_CREDENTIALS_JSON` - Full credentials JSON as string
4. Deploy!

### Generate Password Hash

```bash
python utils/auth.py "YourPassword123!"
```

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── routes/
│   ├── admin.py        # Admin console routes
│   ├── public.py       # Public website routes
│   └── api.py          # REST API endpoints
├── utils/
│   ├── auth.py         # Authentication helpers
│   └── sheets.py       # Google Sheets database layer
├── templates/
│   ├── admin/          # Admin console templates
│   └── public/         # Public website templates
├── static/             # CSS, JS, images
├── admin/data/         # Local development data
├── requirements.txt    # Python dependencies
├── Procfile            # Railway/Heroku config
└── .env.example        # Environment template
```

## API Endpoints

### Public
- `GET /api/geckos` - List available geckos
- `GET /api/geckos/:id` - Get gecko details
- `POST /api/inquiry` - Submit inquiry form

### Admin (requires login)
- `GET /api/admin/animals` - List all animals
- `POST /api/admin/animals` - Add animal
- `PUT /api/admin/animals/:id` - Update animal
- `DELETE /api/admin/animals/:id` - Delete animal
- `GET /api/admin/sales` - List sales
- `POST /api/admin/sales` - Record sale
- `GET /api/admin/expenses` - List expenses
- `POST /api/admin/expenses` - Add expense
- `GET /api/admin/leads` - List leads
- `GET /api/admin/dashboard` - Dashboard metrics

## Security

- Passwords are bcrypt hashed
- Session-based authentication (2-hour timeout)
- Rate limiting on login (5 attempts per 15 minutes)
- All secrets in environment variables
- credentials.json is gitignored

## License

Private - The Lab Reptiles
