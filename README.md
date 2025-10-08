# 🏪 Bizim Oba - Job Posting & Application Platform

A modern, full-stack job posting and application management system built with Next.js, designed for OBA retail stores in Azerbaijan. HR admins can post jobs, and applicants can apply with CV uploads to Cloudflare R2.

## 📸 Screenshots

### Application Form
![Application Form](./ss/application%20page.png)
*Interactive job application form with map-based location selection*

### Admin - Applications Management
![Applications Page](./ss/candidates%20page.png)
*Comprehensive view of all applications with search, filtering, and export features*

### Admin - Analytics Dashboard
![Analytics Dashboard](./ss/analytics%20page.png)
*Visual analytics with statistics, charts, and distribution data*

## 🚀 Features

### 💼 Job Posting System (HR Admin)
- **Create & Manage Jobs** - Full CRUD for job postings with rich details
- **Job Details:**
  - Title, description, location
  - Salary range (min/max)
  - Employment type (full-time, part-time, contract, temporary)
  - Requirements and responsibilities
  - Status management (active, closed, draft)
- **Application Tracking** - See application count per job
- **Easy Job Management** - Edit, delete, and activate/deactivate jobs

### 📝 Public Job Application Form
- **Active Job Listings** - Browse and apply to specific job postings
- **CV Upload** - Upload CV (PDF, DOC, DOCX) stored in Cloudflare R2
- **Flexible Application** - Apply to specific jobs or submit general applications
- **Interactive Map Selection** - Select preferred work location from 1,610+ OBA stores
- **Geolocation Support** - Find nearby stores automatically
- **Multi-field Form** - Name, surname, phone, email, location, salary expectations
- **Fully Responsive** - Mobile-first design
- **Azerbaijani Language** - Complete UI in Azerbaijani

### 🔐 Admin Panel (Protected)
- **Secure Authentication** - Login system with environment-based credentials
- **Three Main Views:**
  - **📋 Applications Table** - View all applications with CV downloads
  - **📈 Analytics Dashboard** - Visual insights and statistics
  - **💼 Job Management** - Create and manage job postings

### 📊 Analytics Features
- **Key Metrics Cards:**
  - Total applications count
  - Average salary expectations
  - Number of unique locations
  - Number of unique job positions

- **Distribution Charts:**
  - Job titles distribution with progress bars
  - Top 10 locations by application count
  - Salary range distribution (500-700, 700-900, 900-1100, 1100+ AZN)

- **Visual Design:**
  - Beautiful gradient progress bars
  - Color-coded statistics
  - Percentage calculations
  - Smooth animations

### 🗂️ Application Management
- **Advanced Filtering:**
  - Search by name, phone, or job title
  - Filter by work location
  - Real-time search results

- **Pagination System:**
  - 5 applications per page
  - Page navigation with numbered buttons
  - Shows current range (e.g., "Showing 1-5 of 26")

- **CV Download:**
  - Direct download links for uploaded CVs
  - Secure file storage in Cloudflare R2
  - File validation (PDF, DOC, DOCX, max 5MB)

- **Data Export:**
  - Export to Excel (.xlsx) format
  - Includes CV URLs, emails, job postings
  - Proper Azerbaijani headers
  - Auto-generated filename with date

### 📱 Mobile Responsive
- **Fully optimized for mobile devices**
- Touch-friendly buttons and inputs
- Adaptive layouts for all screen sizes
- Horizontal scroll for tables on small screens
- Responsive text and spacing

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **File Storage:** Cloudflare R2 (S3-compatible)
- **Maps:** Leaflet + React-Leaflet
- **Excel Export:** xlsx library
- **Deployment:** Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun
- PostgreSQL database (Neon or local)
- Cloudflare R2 bucket for CV storage

## 🔧 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd obamiz
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# Cloudflare R2 Storage
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="your_bucket_name"
R2_PUBLIC_URL="https://your-bucket.r2.dev"
```

4. **Set up Cloudflare R2:**

- Create a Cloudflare R2 bucket
- Generate API credentials (Access Key ID and Secret)
- Set up public access URL (optional, for direct CV downloads)
- Create a `cvs/` folder in your bucket

5. **Set up the database:**

Run Prisma migrations:

```bash
npx prisma generate
npx prisma db push
```

This will create the following tables:
- `jobs` - Job postings
- `job_applications` - Job applications with CV URLs
- `locations` - Store locations (1,610+ OBA stores)

6. **Import location data:**

The `data/locations.csv` file contains 1,610 OBA store locations. Import it to your database:

```bash
# Use your preferred method to import CSV to PostgreSQL
# Example using psql:
psql $DATABASE_URL -c "\COPY locations(latitude,longitude,name) FROM './data/locations.csv' CSV HEADER;"
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## 📂 Project Structure

```
obamiz/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── page.tsx        # Admin dashboard (applications & analytics)
│   │   │   └── jobs/
│   │   │       └── page.tsx    # Job management interface
│   │   ├── api/
│   │   │   ├── applications/   # Get all applications
│   │   │   ├── apply/          # Submit application with CV
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── jobs/           # CRUD operations for jobs
│   │   │   ├── upload-cv/      # CV upload to R2
│   │   │   └── locations/      # Get store locations
│   │   ├── components/
│   │   │   └── MapSelector.tsx # Interactive map component
│   │   ├── page.tsx            # Main job listing & application form
│   │   └── layout.tsx          # Root layout
│   ├── lib/
│   │   └── r2.ts               # Cloudflare R2 utilities
│   └── types/                  # TypeScript type definitions
├── prisma/
│   └── schema.prisma           # Database schema
├── data/
│   └── locations.csv           # 1,610 OBA store locations
├── public/                     # Static assets
├── .env.example                # Environment template
└── .env                        # Environment variables (not in git)
```

## 🎯 Key Pages

### Public Pages
- `/` - Active job listings and application form with CV upload

### Protected Pages (Admin)
- `/admin` - Login & admin dashboard
  - **Applications tab** - View all applications with CV downloads
  - **Analytics tab** - Statistics and insights
  - **Jobs link** - Navigate to job management
- `/admin/jobs` - Create, edit, delete job postings

## 🔑 Admin Access

Default credentials (change in `.env`):
- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change these credentials in production!

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ADMIN_USERNAME` | Admin panel username | Yes |
| `ADMIN_PASSWORD` | Admin panel password | Yes |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | Yes |
| `R2_ACCESS_KEY_ID` | R2 access key ID | Yes |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key | Yes |
| `R2_BUCKET_NAME` | R2 bucket name for CVs | Yes |
| `R2_PUBLIC_URL` | Public URL for R2 bucket | Yes |

## 📊 Database Schema

### jobs table
```sql
id                SERIAL PRIMARY KEY
title             VARCHAR(255)
description       TEXT
location          VARCHAR(255)
salary_min        INTEGER (nullable)
salary_max        INTEGER (nullable)
employment_type   VARCHAR(50) DEFAULT 'full_time'
requirements      TEXT (nullable)
responsibilities  TEXT (nullable)
status            VARCHAR(50) DEFAULT 'active'
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### job_applications table
```sql
id                    SERIAL PRIMARY KEY
job_id                INTEGER (nullable, foreign key to jobs)
name                  VARCHAR(255)
surname               VARCHAR(255)
phone                 VARCHAR(20)
email                 VARCHAR(255) (nullable)
current_living_place  VARCHAR(255)
place_to_work         VARCHAR(255)
job_title             VARCHAR(255)
expected_salary       INTEGER
cv_url                TEXT (nullable)
info                  TEXT (nullable)
created_at            TIMESTAMP
```

### locations table
```sql
id        SERIAL PRIMARY KEY
latitude  FLOAT
longitude FLOAT
name      VARCHAR(50)
```

## 🎨 Features in Detail

### Interactive Map
- Built with Leaflet.js
- Custom markers for each OBA store
- Click markers to select location
- Shows distance from user's location
- Zoom and pan controls
- Mobile-optimized touch controls

### Form Validation
- All required fields validated
- Phone number format checking
- CV file type validation (PDF, DOC, DOCX)
- CV file size limit (5MB)
- Location must be selected from map (for general applications)
- Client-side and server-side validation

### Admin Features
- Secure cookie-based authentication
- Session persistence (24 hours)
- Job posting CRUD with status management
- Excel export with CV URLs and job data
- Real-time search and filtering
- CV download links
- Responsive tables with horizontal scroll
- Color-coded status indicators

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Environment Setup

Make sure to add all environment variables in your Vercel project settings:
- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

## 🔒 Security

- HTTP-only cookies for authentication
- Secure flag enabled in production
- SameSite cookie policy
- Environment-based credentials
- SQL injection protection via parameterized queries

## 🎯 Future Enhancements

Potential features for future versions:
- Application status workflow (New → Reviewing → Interview → Hired/Rejected)
- Email/SMS notifications
- Interview scheduling
- Document upload (CV, certificates)
- Multi-language support (Russian, English)
- AI-powered candidate scoring
- Advanced analytics with charts
- Role-based access control
- Application notes and ratings

## 📝 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For access or contributions, please contact the project owner.

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 📞 Support

For support, please contact the development team.

---

Built with ❤️ for OBA Stores in Azerbaijan
